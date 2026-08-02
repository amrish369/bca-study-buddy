import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const paperInput = z.object({
  courseCode: z.string().min(3).max(20).regex(/^[A-Za-z]{2,6}-?[A-Za-z]?[0-9]{2,3}$/),
  year: z.number().int().min(2005).max(2035),
  session: z.enum(["June", "December"]),
});

const courseInput = z.object({
  courseCode: z.string().min(3).max(20).regex(/^[A-Za-z]{2,6}-?[A-Za-z]?[0-9]{2,3}$/),
  years: z.array(z.number().int().min(2005).max(2035)).max(12),
});

/** Resolve one paper's real PDF URL (cache-first, then live lookup). */
export const getPaperUrl = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => paperInput.parse(data))
  .handler(async ({ data }) => {
    const { resolvePaper } = await import("./papers.server");
    const paper = await resolvePaper(data.courseCode, data.year, data.session);
    return { pdfUrl: paper.pdfUrl, status: paper.status };
  });

/** Resolve every June/December paper for a course across the given years. */
export const getCoursePapers = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => courseInput.parse(data))
  .handler(async ({ data }) => {
    const { resolvePaper } = await import("./papers.server");
    const sessions = ["June", "December"] as const;
    const jobs = data.years.flatMap((year) =>
      sessions.map((session) => resolvePaper(data.courseCode, year, session)),
    );
    const results = await Promise.all(jobs);
    return results.map((r) => ({
      year: r.year,
      session: r.session,
      pdfUrl: r.pdfUrl,
      status: r.status,
    }));
  });
