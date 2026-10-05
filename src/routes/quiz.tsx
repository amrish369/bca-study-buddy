import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Brain, Timer, CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { semesters, subjectsBySemester, findSubject } from "@/lib/data";
import { lessonsForCourse } from "@/lib/syllabus";
import { generateQuiz, type QuizQuestion } from "@/lib/prep.functions";

export const Route = createFileRoute("/quiz")({
  validateSearch: (s) =>
    z.object({ course: z.string().optional(), focus: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "IGNOU BCA Mock Test & Quiz — Master Hub" },
      { name: "description", content: "Subject and unit-wise IGNOU BCA mock tests with timer, instant score and Hindi explanations." },
      { property: "og:title", content: "IGNOU BCA Mock Test & Quiz" },
      { property: "og:description", content: "Practice MCQs, timed TEE mocks and weak-topic reports for IGNOU BCA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuizPage,
});

type Attempt = { course: string; score: number; total: number; date: string };
const HISTORY_KEY = "quiz-history";

function QuizPage() {
  const search = Route.useSearch();
  const initial = search.course ? findSubject(search.course) : undefined;
  const [sem, setSem] = useState(initial?.semester ?? 1);
  const subs = subjectsBySemester(sem);
  const [course, setCourse] = useState(initial?.courseCode ?? subs[0]?.courseCode ?? "");
  const [focus, setFocus] = useState(search.focus ?? "");
  const [mode, setMode] = useState<"quick" | "mock">("quick");
  const [loading, setLoading] = useState(false);
  const [qs, setQs] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [history, setHistory] = useState<Attempt[]>([]);
  const gen = useServerFn(generateQuiz);
  const subject = findSubject(course);
  const lessons = useMemo(() => (course ? lessonsForCourse(course) : []), [course]);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!qs || submitted || mode !== "mock") return;
    if (timeLeft <= 0) { submit(); return; }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  });

  async function start() {
    if (!subject) return;
    setLoading(true); setQs(null); setAnswers({}); setSubmitted(false);
    try {
      const count = mode === "mock" ? 20 : 10;
      const r = await gen({ data: { courseCode: subject.courseCode, title: subject.title, focus: focus || undefined, count } });
      if (!r.questions.length) throw new Error("No questions generated, try again.");
      setQs(r.questions);
      setTimeLeft(r.questions.length * 60);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create quiz");
    } finally { setLoading(false); }
  }

  function submit() {
    if (!qs) return;
    setSubmitted(true);
    const score = qs.filter((q, i) => answers[i] === q.answerIndex).length;
    const next = [{ course, score, total: qs.length, date: new Date().toISOString() }, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const score = qs ? qs.filter((q, i) => answers[i] === q.answerIndex).length : 0;
  const weak = qs && submitted ? [...new Set(qs.filter((q, i) => answers[i] !== q.answerIndex).map((q) => q.topic))] : [];

  return (
    <SiteLayout>
      <PageHeader eyebrow="Mock Test" title="Mock Test & Quiz" subtitle="Subject ya unit chuno, quiz shuru karo, aur turant score + explanation pao." />
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Semester
              <select className="mt-1 w-full rounded-lg border border-input bg-background p-2" value={sem}
                onChange={(e) => { const s = Number(e.target.value); setSem(s); setCourse(subjectsBySemester(s)[0]?.courseCode ?? ""); setFocus(""); }}>
                {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Subject
              <select className="mt-1 w-full rounded-lg border border-input bg-background p-2" value={course}
                onChange={(e) => { setCourse(e.target.value); setFocus(""); }}>
                {subs.map((s) => <option key={s.courseCode} value={s.courseCode}>{s.courseCode} — {s.title}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">Unit / topic (optional)
            <select className="mt-1 w-full rounded-lg border border-input bg-background p-2" value={focus} onChange={(e) => setFocus(e.target.value)}>
              <option value="">All important topics</option>
              {focus && !lessons.some((l) => l.title === focus) && <option value={focus}>{focus}</option>}
              {lessons.map((l) => <option key={l.unit + l.title} value={l.title}>Unit {l.unit}: {l.title}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button variant={mode === "quick" ? "default" : "outline"} onClick={() => setMode("quick")}><Brain className="h-4 w-4" /> Quick practice (10)</Button>
            <Button variant={mode === "mock" ? "default" : "outline"} onClick={() => setMode("mock")}><Timer className="h-4 w-4" /> Timed TEE mock (20)</Button>
          </div>
          <Button className="w-full" onClick={start} disabled={loading || !subject}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Questions ban rahe hain…</> : "Start quiz"}
          </Button>
        </div>

        {qs && submitted && (
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-2xl font-extrabold">Score: {score}/{qs.length} ({Math.round((score / qs.length) * 100)}%)</p>
            {weak.length > 0 && <p className="mt-2 text-sm"><b>Weak topics:</b> {weak.join(", ")}</p>}
            <Button variant="outline" className="mt-3" onClick={start}><RotateCcw className="h-4 w-4" /> New quiz</Button>
          </div>
        )}

        {qs && !submitted && mode === "mock" && (
          <div className="sticky top-16 z-10 rounded-xl bg-secondary p-2 text-center font-bold">
            Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
        )}

        {qs?.map((q, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <p className="font-semibold">{i + 1}. {q.question}</p>
            <div className="mt-3 grid gap-2">
              {q.options.map((o, j) => {
                const picked = answers[i] === j;
                const cls = submitted
                  ? j === q.answerIndex ? "border-success bg-success/10" : picked ? "border-destructive bg-destructive/10" : "border-border"
                  : picked ? "border-primary bg-primary/10" : "border-border";
                return (
                  <button key={j} disabled={submitted} onClick={() => setAnswers((a) => ({ ...a, [i]: j }))}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm ${cls}`}>
                    {submitted && j === q.answerIndex && <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
                    {submitted && picked && j !== q.answerIndex && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                    {o}
                  </button>
                );
              })}
            </div>
            {submitted && <p className="mt-3 rounded-lg bg-muted p-3 text-sm"><b>Explanation:</b> {q.explanation}</p>}
          </div>
        ))}

        {qs && !submitted && (
          <Button className="w-full" onClick={submit}>Submit ({Object.keys(answers).length}/{qs.length} answered)</Button>
        )}

        {history.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-bold">Your recent attempts</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between"><span>{h.course} · {new Date(h.date).toLocaleDateString()}</span><b>{h.score}/{h.total}</b></li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
