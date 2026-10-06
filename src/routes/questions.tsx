import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Copy, ChevronDown, Target, BookOpen } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { semesters, subjectsBySemester, findSubject } from "@/lib/data";
import { lessonsForCourse } from "@/lib/syllabus";
import { getImportantQA, type ImportantQA } from "@/lib/prep.functions";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Guess Paper & Important Questions with Answers" },
      { name: "description", content: "Subject-wise IGNOU BCA important questions with Hinglish answers, 15-year PYQ record and upcoming exam guess paper." },
      { property: "og:title", content: "IGNOU BCA Guess Paper & Important Q&A" },
      { property: "og:description", content: "15-year PYQ record, upcoming exam guess and model answers for every BCA subject." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuestionsPage,
});

function QAItem({ q }: { q: ImportantQA }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-semibold">{q.question}</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${q.probability >= 75 ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
          {Math.round(q.probability)}% chance
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{q.unit} · {q.marks} marks · {q.timesAsked}× asked</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {q.years.map((y) => <span key={y} className="rounded bg-success/15 px-2 py-0.5 text-xs text-success">{y}</span>)}
      </div>
      <Button size="sm" variant="outline" className="mt-3" onClick={() => setOpen(!open)}>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} /> {open ? "Answer chhupao" : "Answer dekho"}
      </Button>
      {open && (
        <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
          <p className="whitespace-pre-wrap">{q.answer}</p>
          <p className="mt-3 rounded bg-primary/10 p-2 text-xs"><b>Exam tip:</b> {q.examTip}</p>
          <Button size="sm" variant="ghost" className="mt-2"
            onClick={() => { navigator.clipboard.writeText(`${q.question}\n\n${q.answer}`); toast.success("Copied"); }}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>
      )}
    </div>
  );
}

function QuestionsPage() {
  const [sem, setSem] = useState(1);
  const subs = subjectsBySemester(sem);
  const [course, setCourse] = useState(subs[0]?.courseCode ?? "");
  const [mode, setMode] = useState<"guess" | "bank">("guess");
  const [loading, setLoading] = useState(false);
  const [qs, setQs] = useState<ImportantQA[] | null>(null);
  const fetchQA = useServerFn(getImportantQA);

  async function run() {
    const s = findSubject(course);
    if (!s) return;
    setLoading(true); setQs(null);
    try {
      const r = await fetchQA({ data: { courseCode: s.courseCode, title: s.title, lessons: lessonsForCourse(s.courseCode).map((l) => l.title).slice(0, 40) } });
      setQs(r.questions);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setLoading(false); }
  }

  const shown = qs ? (mode === "guess" ? qs.filter((q) => q.probability >= 70).slice(0, 10) : qs) : null;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Guess Paper" title="Important Questions & Answers"
        subtitle="Har subject ke pichhle 15 saal ke repeated questions, upcoming exam guess aur Hinglish model answers." />
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
          <select className="rounded-lg border border-input bg-background p-2" value={sem}
            onChange={(e) => { const s = Number(e.target.value); setSem(s); setCourse(subjectsBySemester(s)[0]?.courseCode ?? ""); setQs(null); }}>
            {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <select className="rounded-lg border border-input bg-background p-2" value={course} onChange={(e) => { setCourse(e.target.value); setQs(null); }}>
            {subs.map((s) => <option key={s.courseCode} value={s.courseCode}>{s.courseCode} — {s.title}</option>)}
          </select>
          <Button onClick={run} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Ban raha hai…</> : "Questions lao"}</Button>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === "guess" ? "default" : "outline"} size="sm" onClick={() => setMode("guess")}><Target className="h-4 w-4" /> Upcoming Guess</Button>
          <Button variant={mode === "bank" ? "default" : "outline"} size="sm" onClick={() => setMode("bank")}><BookOpen className="h-4 w-4" /> 15-Year Bank</Button>
        </div>
        {loading && <p className="text-sm text-muted-foreground">Answers likhe ja rahe hain, 30-60 second lag sakte hain…</p>}
        {shown && (
          <div className="space-y-3">
            {shown.map((q) => <QAItem key={q.question} q={q} />)}
            {shown.length === 0 && <p className="text-sm">Koi high-probability question nahi mila — 15-Year Bank dekho.</p>}
            <p className="text-xs text-muted-foreground">Note: Year record aur guess AI estimate hain, IGNOU ki official guarantee nahi.</p>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
