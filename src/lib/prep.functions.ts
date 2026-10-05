import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function callAI(prompt: string, toolName: string, parameters: Record<string, unknown>) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert IGNOU BCA examiner who knows 10+ years of IGNOU term-end exam papers. Be accurate and exam focused.",
        },
        { role: "user", content: prompt },
      ],
      tools: [{ type: "function", function: { name: toolName, parameters } }],
      tool_choice: { type: "function", function: { name: toolName } },
    }),
  });
  if (res.status === 429) throw new Error("Too many requests, please try again in a minute.");
  if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const json = await res.json();
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("AI returned no result");
  return JSON.parse(args);
}

const subjectInput = z.object({
  courseCode: z.string().min(2).max(20),
  title: z.string().min(2).max(200),
  lessons: z.array(z.string().max(200)).max(40),
});

export type AnalysisTopic = {
  topic: string;
  unit: string;
  timesAsked: number;
  years: number[];
  marks: number;
  probability: number;
  expectedQuestions: string[];
};

export const getSubjectAnalysis = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => subjectInput.parse(d))
  .handler(async ({ data }) => {
    const r = await callAI(
      `Analyse IGNOU term-end exam question papers (2015-2025) for ${data.courseCode} ${data.title}.
Units: ${data.lessons.join("; ") || "use the official syllabus"}.
Return 8-12 most repeated topics sorted by probability of appearing in the next exam. For each: unit name, approximate times asked in last 10 years, list of years, typical marks, probability 0-100, and 2-3 most expected exam questions exactly as IGNOU style.`,
      "subject_analysis",
      {
        type: "object",
        properties: {
          topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topic: { type: "string" },
                unit: { type: "string" },
                timesAsked: { type: "number" },
                years: { type: "array", items: { type: "number" } },
                marks: { type: "number" },
                probability: { type: "number" },
                expectedQuestions: { type: "array", items: { type: "string" } },
              },
              required: ["topic", "unit", "timesAsked", "years", "marks", "probability", "expectedQuestions"],
            },
          },
        },
        required: ["topics"],
      },
    );
    return { topics: (r.topics ?? []) as AnalysisTopic[] };
  });

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  topic: string;
};

export const generateQuiz = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        courseCode: z.string().min(2).max(20),
        title: z.string().min(2).max(200),
        focus: z.string().max(300).optional(),
        count: z.number().int().min(5).max(25),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const r = await callAI(
      `Create ${data.count} high-quality MCQs for IGNOU ${data.courseCode} ${data.title}${
        data.focus ? `, focused on: ${data.focus}` : " covering the most repeated exam topics"
      }. Each has exactly 4 options, the correct answerIndex (0-3), a short explanation in simple Hindi+English (Hinglish), and the topic name. Mix concept, numerical and output-based questions where relevant.`,
      "make_quiz",
      {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                answerIndex: { type: "number" },
                explanation: { type: "string" },
                topic: { type: "string" },
              },
              required: ["question", "options", "answerIndex", "explanation", "topic"],
            },
          },
        },
        required: ["questions"],
      },
    );
    const qs = ((r.questions ?? []) as QuizQuestion[]).filter(
      (q) => q.options?.length === 4 && q.answerIndex >= 0 && q.answerIndex < 4,
    );
    return { questions: qs };
  });
