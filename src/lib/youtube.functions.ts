import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({
  query: z.string().min(3).max(160),
  limit: z.number().int().min(1).max(8).optional(),
});

/** Find study videos on YouTube for a subject / assignment / topic. */
export const getStudyVideos = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => input.parse(data))
  .handler(async ({ data }) => {
    const { searchStudyVideos } = await import("./youtube.server");
    try {
      const videos = await searchStudyVideos(data.query, data.limit ?? 6);
      return { videos, error: null as string | null };
    } catch (error) {
      console.error("youtube search failed", error);
      return { videos: [], error: "YouTube search unavailable" };
    }
  });
