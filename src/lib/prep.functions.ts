import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function strict(s: any): any {
  if (s && s.type === "object") {
    return { ...s, additionalProperties: false, properties: Object.fromEntries(Object.entries(s.properties).map(([k, v]) => [k, strict(v)])) };
  }
  if (s && s.type === "array") return { ...s, items: strict(s.items) };
  return s;
}

const SYSTEM = "You are an expert IGNOU BCA examiner who knows 10+ years of IGNOU term-end exam papers. Be accurate and exam focused.";

async function callGemini(key: string, prompt: string, schema: Record<string, unknown>, model = "gemini-3-flash-preview") {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: strict(schema),
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini failed (${res.status})`);
  const json: any = await res.json();
  const out = (json?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("");
  if (!out) throw new Error("Gemini returned no result");
  return JSON.parse(out);
}

async function callGroq(key: string, prompt: string, _name: string, schema: Record<string, unknown>) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "User-Agent": "curl/8.0" },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: `${SYSTEM} Reply ONLY with a JSON object matching this JSON schema: ${JSON.stringify(schema)}` },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Groq failed (${res.status})`);
  const json: any = await res.json();
  const out = json?.choices?.[0]?.message?.content;
  if (!out) throw new Error("Groq returned no result");
  return JSON.parse(out);
}

// Tries each configured free provider in turn; on limit/error, switches to the next.
async function callAI(prompt: string, name: string, schema: Record<string, unknown>) {
  const providers: Array<() => Promise<any>> = [];
  const g = process.env["GEMINI_API_KEY"];
  const gk = process.env["GROK_API_KEY"];
  const q = process.env["GROQ_API_KEY"] || (gk?.startsWith("gsk_") ? gk : undefined);
  if (g) providers.push(() => callGemini(g, prompt, schema));
  if (q) providers.push(() => callGroq(q, prompt, name, schema));
  if (g) providers.push(() => callGemini(g, prompt, schema, "gemini-flash-lite-latest"));
  if (!providers.length) throw new Error("AI is not configured");
  for (let round = 0; round < 2; round++) {
    for (const p of providers) {
      try {
        return await p();
      } catch (e) {
        console.error("AI provider failed, switching:", e);
      }
    }
    await new Promise((r) => setTimeout(r, 6000));
  }
  throw new Error("Free AI limit reached on all providers, please try again in a minute.");
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
      instructions: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const r = await callAI(
      `Solve the IGNOU BCA assignment for ${data.courseCode} ${data.title}, session ${data.session}.
${data.questionsText.trim() ? `Assignment questions given by student:\n${data.questionsText}` : "Questions not provided: write the typical official IGNOU assignment for this course (usually 4-8 questions, total 100 marks)."}
For every question give the question number, full question text, marks, and a complete exam-quality answer in simple English that a student can copy by hand. Length must suit the marks (~40 words per mark, max 600 words). Use headings, "- " bullet points, steps, formulas, and code where relevant. Plain text only, no markdown symbols like ** or #.${data.instructions?.trim() ? `\nIMPORTANT extra instructions from the student (follow these over the defaults above): ${data.instructions}` : ""}`,
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

export const listAssignmentQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ courseCode: z.string().min(2).max(20), title: z.string().min(2).max(200), session: z.string().max(20), questionsText: z.string().max(8000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const r = await callAI(
      `${data.questionsText.trim() ? `Split ONLY these given IGNOU assignment questions of ${data.courseCode} ${data.title} into a clean list. Keep the exact wording, sub-parts and marks. Do NOT add, remove, invent or replace any question. If marks are missing, distribute 100 marks sensibly:\n${data.questionsText}` : `Write the typical official IGNOU assignment questions for ${data.courseCode} ${data.title}, session ${data.session} (4-8 questions, total 100 marks).`}
Return only question number, full question text and marks. Do not answer.`,
      "assignment_questions",
      {
        type: "object",
        properties: { questions: { type: "array", items: { type: "object", properties: { qno: { type: "string" }, question: { type: "string" }, marks: { type: "number" } }, required: ["qno", "question", "marks"] } } },
        required: ["questions"],
      },
    );
    return { questions: (r.questions ?? []) as Array<{ qno: string; question: string; marks: number }> };
  });

export const solveAssignmentQuestion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ courseCode: z.string().min(2).max(20), title: z.string().min(2).max(200), question: z.string().min(2).max(3000), marks: z.number().min(1).max(100), instructions: z.string().max(2000).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const words = Math.min(900, Math.max(150, data.marks * 35));
    const r = await callAI(
      `Write a complete IGNOU BCA assignment answer for ${data.courseCode} ${data.title}.
Question (${data.marks} marks): ${data.question}
Write about ${words} words in simple English, the way a good student writes by hand: short Introduction, clear headings on their own line, "- " bullet points, step-by-step working for maths, full code with comments for programs, a small text diagram/table if useful, and a short Conclusion. Put every heading, bullet, step and code line on its own new line using \\n line breaks, with a blank line between sections. Plain text only, no markdown symbols like ** or #.${data.instructions?.trim() ? `\nIMPORTANT extra instructions from the student (follow these over the defaults): ${data.instructions}` : ""}`,
      "assignment_answer",
      { type: "object", properties: { answer: { type: "string" } }, required: ["answer"] },
    );
    return { answer: String(r.answer ?? "").replace(/\s+-\s(?=[A-Z0-9])/g, "\n- ").replace(/\s*(Introduction|Conclusion|Definition)\s*:?\s+/g, "\n\n$1:\n").trim() };
  });

// Reads uploaded question-paper photos with Gemini vision and returns the full text.
export const readQuestionImages = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ images: z.array(z.string().max(8_000_000)).min(1).max(6) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["GEMINI_API_KEY"];
    if (!key) throw new Error("Gemini key missing");
    const parts: any[] = [{ text: "These are photos of an IGNOU assignment/question paper. Read EVERYTHING and transcribe all questions exactly, in order, with question numbers, sub-parts (a), (b) and marks. Include course code and instructions if visible. Plain text only." }];
    for (const url of data.images) {
      const m = /^data:([^;]+);base64,(.+)$/.exec(url);
      if (m) parts.push({ inline_data: { mime_type: m[1], data: m[2] } });
    }
    let lastErr = "";
    for (const model of ["gemini-3-flash-preview", "gemini-flash-lite-latest"]) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ role: "user", parts }] }),
      });
      if (!res.ok) { lastErr = `Image read failed (${res.status})`; continue; }
      const json: any = await res.json();
      const text = (json?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("").trim();
      if (text) return { text };
      lastErr = "Image se text nahi mila";
    }
    throw new Error(lastErr || "Image read failed");
  });

export const getPaperQuestions = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ courseCode: z.string().min(2).max(20), year: z.number().min(2005).max(2035), session: z.string().max(20) }).parse(d),
  )
  .handler(async ({ data }) => {
    const r = await callAI(
      `List the questions of the IGNOU BCA term-end exam paper ${data.courseCode}, ${data.session} ${data.year}, as accurately as you can recall it (Section/Q number, full question text, marks). If unsure, give the most likely IGNOU-pattern questions for that session. Total 100 marks. Do not answer.`,
      "paper_questions",
      {
        type: "object",
        properties: { questions: { type: "array", items: { type: "object", properties: { qno: { type: "string" }, question: { type: "string" }, marks: { type: "number" } }, required: ["qno", "question", "marks"] } } },
        required: ["questions"],
      },
    );
    return { questions: (r.questions ?? []) as Array<{ qno: string; question: string; marks: number }> };
  });
