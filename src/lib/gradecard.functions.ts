import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const input = z.object({
  enrolmentNo: z.string().trim().regex(/^\d{8,12}$/, "Enrolment number must be 8-12 digits"),
  programmeCode: z.enum(["BCA", "BCAOL", "BCA_NEW", "BCA_NEWOL"]),
});

/**
 * Fetch the signed-in student's IGNOU grade card, cache it in their private
 * records, and return the parsed marks.
 */
export const syncMyGradeCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { fetchGradeCard } = await import("./gradecard.server");
    const result = await fetchGradeCard(data.enrolmentNo, data.programmeCode);

    if (result.status === "found") {
      await supabase
        .from("grade_card_records")
        .delete()
        .eq("user_id", userId)
        .eq("programme", data.programmeCode);

      const { error } = await supabase.from("grade_card_records").insert(
        result.rows.map((row) => ({
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

      // Keep the profile in sync with what the student just verified.
      await supabase
        .from("profiles")
        .update({
          enrolment_no: data.enrolmentNo,
          programme_code: data.programmeCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }

    return { status: result.status, message: result.message, rows: result.rows };
  });
