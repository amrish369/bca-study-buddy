import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { semesters, subjectsBySemester, findSubject } from "@/lib/data";
import { lessonsForCourse } from "@/lib/syllabus";
import { getSubjectAnalysis, type AnalysisTopic } from "@/lib/prep.functions";

export function SubjectAnalysis() {
  const [sem, setSem] = useState(1);
  const subs = subjectsBySemester(sem);
  const [course, setCourse] = useState(subs[0]?.courseCode ?? "");
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<AnalysisTopic[] | null>(null);
  const analyse = useServerFn(getSubjectAnalysis);

  async function run() {
    const s = findSubject(course);
    if (!s) return;
    setLoading(true); setTopics(null);
    try {
      const r = await analyse({ data: { courseCode: s.courseCode, title: s.title, lessons: lessonsForCourse(s.courseCode).map((l) => l.title).slice(0, 40) } });
      setTopics([...r.topics].sort((a, b) => b.probability - a.probability));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analysis failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="rounded-2xl border border-primary/40 bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-5 w-5 text-primary" /> Subject-wise Smart PYQ Analysis</h2>
      <p className="text-sm text-muted-foreground">Subject chuno — repeated topics, year-wise frequency aur Most Expected Questions dekho.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[auto_1fr_auto]">
        <select className="rounded-lg border border-input bg-background p-2" value={sem}
          onChange={(e) => { const s = Number(e.target.value); setSem(s); setCourse(subjectsBySemester(s)[0]?.courseCode ?? ""); }}>
          {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <select className="rounded-lg border border-input bg-background p-2" value={course} onChange={(e) => setCourse(e.target.value)}>
          {subs.map((s) => <option key={s.courseCode} value={s.courseCode}>{s.courseCode} — {s.title}</option>)}
        </select>
        <Button onClick={run} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyse"}</Button>
      </div>

      {topics && (
        <div className="mt-5 space-y-3">
          {topics.map((t) => (
            <div key={t.topic} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{t.topic}</p>
                  <p className="text-xs text-muted-foreground">{t.unit} · ~{t.timesAsked}× asked · {t.marks} marks</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${t.probability >= 75 ? "bg-destructive/15 text-destructive" : t.probability >= 50 ? "bg-warning/20 text-warning-foreground" : "bg-muted text-muted-foreground"}`}>
                  {Math.round(t.probability)}% chance
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {[...t.years].sort((a, b) => b - a).map((y) => <span key={y} className="rounded bg-success/15 px-2 py-0.5 text-xs text-success">{y}</span>)}
              </div>
              <div className="mt-3 space-y-2">
                {t.expectedQuestions.map((q, i) => <QA key={q} n={i + 1} q={q} marks={t.marks} course={course} />)}
              </div>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link to="/quiz" search={{ course, focus: t.topic }}><Brain className="h-4 w-4" /> Is topic ka quiz do</Link>
              </Button>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Note: Frequency AI estimate hai, official PDFs Previous Papers page par dekhein.</p>
        </div>
      )}
    </div>
  );
}
