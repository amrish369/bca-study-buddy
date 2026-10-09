import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function strict(s: any): any {
  if (s && s.type === "object") {
    return { ...s, additionalProperties: false, properties: Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, strict(v)])) };
  }
  if (s && s.type === "array") return { ...s, items: strict(s.items) };
  return s;
}

async function callAI(prompt: string, _name: string, schema: Record<string, unknown>) {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("AI is not configured");
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: "You are an expert IGNOU BCA examiner who knows 10+ years of IGNOU term-end exam papers. Be accurate and exam focused." }],
        },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: strict(schema),
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    },
  );
  if (res.status === 429) throw new Error("Free limit reached, please try again in a minute.");
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  const json: any = await res.json();
  const out = (json?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("");
  if (!out) throw new Error("AI returned no result");
  return JSON.parse(out);
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

export type ImportantQA = {
  question: string;
  unit: string;
  marks: number;
  years: string[];
  timesAsked: number;
  probability: number;
  answer: string;
  examTip: string;
};

export const getImportantQA = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => subjectInput.parse(d))
  .handler(async ({ data }) => {
    const r = await callAI(
      `For IGNOU ${data.courseCode} ${data.title}, analyse term-end exam papers of the last 15 years (2011-2025, June & December sessions).
Units: ${data.lessons.join("; ") || "use the official syllabus"}.
Return 12 most important repeated questions sorted by probability of appearing in the upcoming exam. For each: exact IGNOU-style question, unit, marks, sessions asked (like "Jun 2019", "Dec 2022"), timesAsked, probability 0-100, an exam-ready model answer in Hinglish (Hindi in Roman script mixed with English technical terms; use definition, key points as "- " bullets, code/syntax if relevant; 120-250 words), and a short scoring tip.`,
      "important_qa",
      {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                unit: { type: "string" },
                marks: { type: "number" },
                years: { type: "array", items: { type: "string" } },
                timesAsked: { type: "number" },
                probability: { type: "number" },
                answer: { type: "string" },
                examTip: { type: "string" },
              },
              required: ["question", "unit", "marks", "years", "timesAsked", "probability", "answer", "examTip"],
            },
          },
        },
        required: ["questions"],
      },
    );
    const qs = ((r.questions ?? []) as ImportantQA[]).sort((a, b) => b.probability - a.probability);
    return { questions: qs };
  });

export type AssignmentAnswer = { qno: string; question: string; marks: number; answer: string };

export const solveAssignment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      courseCode: z.string().min(2).max(20),
      title: z.string().min(2).max(200),
      session: z.string().max(20),
      questionsText: z.string().max(8000),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const r = await callAI(
      `Solve the IGNOU BCA assignment for ${data.courseCode} ${data.title}, session ${data.session}.
${data.questionsText.trim() ? `Assignment questions given by student:\n${data.questionsText}` : "Questions not provided: write the typical official IGNOU assignment for this course (usually 4-8 questions, total 100 marks)."}
For every question give the question number, full question text, marks, and a complete exam-quality answer in simple English that a student can copy by hand. Length must suit the marks (~40 words per mark, max 600 words). Use headings, "- " bullet points, steps, formulas, and code where relevant. Plain text only, no markdown symbols like ** or #.`,
      "assignment_solution",
      {
        type: "object",
        properties: {
          answers: {
            type: "array",
            items: {
              type: "object",
              properties: { qno: { type: "string" }, question: { type: "string" }, marks: { type: "number" }, answer: { type: "string" } },
              required: ["qno", "question", "marks", "answer"],
            },
          },
        },
        required: ["answers"],
      },
    );
    return { answers: (r.answers ?? []) as AssignmentAnswer[] };
  });
