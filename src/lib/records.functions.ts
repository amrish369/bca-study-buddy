import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const courseCode = z.string().min(2).max(20);

/** Everything the dashboard needs for the signed-in student. */
export const getMyRecords = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profile, progress, plan, downloads, submissions, gradeCard, assignmentStatus] =
      await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("study_progress").select("*").eq("user_id", userId),
      supabase.from("study_plan").select("*").eq("user_id", userId).order("target_date"),
      supabase
        .from("download_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase.from("assignment_submissions").select("*").eq("user_id", userId),
      supabase.from("grade_card_records").select("*").eq("user_id", userId).order("course_code"),
    ]);

    return {
      profile: profile.data ?? null,
      progress: progress.data ?? [],
      plan: plan.data ?? [],
      downloads: downloads.data ?? [],
      submissions: submissions.data ?? [],
      gradeCard: gradeCard.data ?? [],
    };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        fullName: z.string().trim().max(100),
        enrolmentNo: z.string().trim().max(30),
        currentSemester: z.number().int().min(1).max(6),
        studyCentre: z.string().trim().max(100),
        programmeCode: z.enum(["BCA", "BCAOL", "BCA_NEW", "BCA_NEWOL"]).default("BCA_NEWOL"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      full_name: data.fullName,
      enrolment_no: data.enrolmentNo,
      current_semester: data.currentSemester,
      study_centre: data.studyCentre,
      programme_code: data.programmeCode,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setTopicProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ courseCode, topic: z.string().min(1).max(200), completed: z.boolean() })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("study_progress").upsert(
      {
        user_id: context.userId,
        course_code: data.courseCode,
        topic: data.topic,
        completed: data.completed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_code,topic" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addPlanItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        courseCode,
        title: z.string().trim().min(2).max(150),
        targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        dailyMinutes: z.number().int().min(10).max(600),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("study_plan").insert({
      user_id: context.userId,
      course_code: data.courseCode,
      title: data.title,
      target_date: data.targetDate,
      daily_minutes: data.dailyMinutes,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updatePlanStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["planned", "doing", "done"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("study_plan")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deletePlanItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("study_plan")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const logDownload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        resourceType: z.enum(["paper", "assignment"]),
        courseCode,
        label: z.string().trim().min(1).max(120),
        pdfUrl: z.string().url().max(600),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("download_history").insert({
      user_id: context.userId,
      resource_type: data.resourceType,
      course_code: data.courseCode,
      label: data.label,
      pdf_url: data.pdfUrl,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        courseCode,
        session: z.string().regex(/^\d{4}-\d{2}$/),
        status: z.enum(["pending", "submitted", "evaluated"]),
        submittedOn: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .nullable(),
        marks: z.number().int().min(0).max(100).nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("assignment_submissions").upsert(
      {
        user_id: context.userId,
        course_code: data.courseCode,
        session: data.session,
        status: data.status,
        submitted_on: data.submittedOn,
        marks: data.marks,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,course_code,session" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
