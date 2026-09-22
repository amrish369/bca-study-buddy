import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const input = z.object({
  enrolmentNo: z.string().trim().regex(/^\d{8,12}$/, "Enrolment number must be 8-12 digits"),
  programmeCode: z.enum(["BCA", "BCAOL", "BCA_NEW", "BCA_NEWOL"]),
});

/**
 * One-click sync of everything IGNOU publishes for a student:
 *  - grade card (assignment / theory / practical marks + completion status)
 *  - official assignment & project marks-transmission status
 * Both are cached against the signed-in user's private records.
 */
export const syncMyIgnouRecords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ fetchGradeCard }, { fetchAssignmentStatus }] = await Promise.all([
      import("./gradecard.server"),
      import("./ignou.server"),
    ]);

    const [grade, assignments] = await Promise.all([
      fetchGradeCard(data.enrolmentNo, data.programmeCode),
      fetchAssignmentStatus(data.enrolmentNo, data.programmeCode),
    ]);

    if (grade.status === "found") {
      await supabase
        .from("grade_card_records")
        .delete()
        .eq("user_id", userId)
        .eq("programme", data.programmeCode);

      const { error } = await supabase.from("grade_card_records").insert(
        grade.rows.map((row) => ({
          user_id: userId,
          programme: data.programmeCode,
          course_code: row.courseCode,
          assignment_marks: row.assignmentMarks,
          theory_marks: row.theoryMarks,
          practical_marks: row.practicalMarks,
          total: row.total,
          status: row.status,
        })),
      );
      if (error) throw new Error(error.message);
    }

    if (assignments.status === "found") {
      await supabase
        .from("assignment_status_records")
        .delete()
        .eq("user_id", userId)
        .eq("programme", data.programmeCode);

      const { error } = await supabase.from("assignment_status_records").insert(
        assignments.rows.map((row) => ({
          user_id: userId,
          programme: data.programmeCode,
          course_code: row.courseCode,
          session: row.session,
          status: row.status,
          marks: row.marks,
          remarks: row.remarks,
        })),
      );
      if (error) throw new Error(error.message);
    }

    const completed = grade.rows.filter((r) =>
      (r.status ?? "").toLowerCase().includes("completed") &&
      !(r.status ?? "").toLowerCase().includes("not"),
    ).length;

    const summary = {
      gradeCardStatus: grade.status,
      gradeCardMessage: grade.message,
      assignmentStatus: assignments.status,
      assignmentMessage: assignments.message,
      coursesFound: grade.rows.length,
      coursesCompleted: completed,
      assignmentRecords: assignments.rows.length,
      syncedAt: new Date().toISOString(),
    };

    await supabase
      .from("profiles")
      .update({
        enrolment_no: data.enrolmentNo,
        programme_code: data.programmeCode,
        last_synced_at: summary.syncedAt,
        ignou_summary: summary,
        updated_at: summary.syncedAt,
      })
      .eq("id", userId);

    return {
      gradeCard: { status: grade.status, message: grade.message, rows: grade.rows },
      assignments: {
        status: assignments.status,
        message: assignments.message,
        rows: assignments.rows,
      },
      summary,
    };
  });
