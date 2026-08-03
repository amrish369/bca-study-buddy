import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const courseCode = z
  .string()
  .min(3)
  .max(20)
  .regex(/^[A-Za-z]{2,6}-?[A-Za-z]?[0-9]{2,3}$/);

const singleInput = z.object({
  courseCode,
  session: z.string().regex(/^\d{4}-\d{2}$/),
  kind: z.enum(["question", "solved"]),
});

const semesterInput = z.object({
  courseCodes: z.array(courseCode).max(12),
  session: z.string().regex(/^\d{4}-\d{2}$/),
  kind: z.enum(["question", "solved"]),
});

/** Resolve one assignment PDF (cache-first, then live lookup). */
export const getAssignmentUrl = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => singleInput.parse(data))
  .handler(async ({ data }) => {
    const { resolveAssignment } = await import("./assignments.server");
    const result = await resolveAssignment(data.courseCode, data.session, data.kind);
    return { pdfUrl: result.pdfUrl, status: result.status };
  });

/** Resolve assignment PDFs for a whole semester at once. */
export const getSemesterAssignments = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => semesterInput.parse(data))
  .handler(async ({ data }) => {
    const { resolveAssignment } = await import("./assignments.server");
    const results = await Promise.all(
      data.courseCodes.map((code) => resolveAssignment(code, data.session, data.kind)),
    );
    return results.map((r) => ({
      courseCode: r.courseCode,
      pdfUrl: r.pdfUrl,
      status: r.status,
    }));
  });
