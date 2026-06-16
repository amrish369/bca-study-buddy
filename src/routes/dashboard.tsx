import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Target, Flame, ListChecks, AlertTriangle } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { semesters, subjectsBySemester } from "@/lib/data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Exam Preparation Dashboard — Master Hub" },
      {
        name: "description",
        content:
          "Smart IGNOU BCA exam dashboard: exam countdown, daily study plan, progress tracking and weak-topic reminders.",
      },
      { property: "og:title", content: "IGNOU BCA Exam Preparation Dashboard" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: DashboardPage,
});

const EXAM_DATES: Record<string, string> = {
  June: "2026-06-01",
  December: "2026-12-01",
};

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

function DashboardPage() {
  const [sem, setSem] = useState(4);
  const [examMonth, setExamMonth] = useState<keyof typeof EXAM_DATES>("June");
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const raw = localStorage.getItem("bca-progress");
    if (raw) setDone(JSON.parse(raw));
  }, []);

  const toggle = (key: string) => {
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("bca-progress", JSON.stringify(next));
      return next;
    });
  };

  const cd = useCountdown(EXAM_DATES[examMonth]);
  const subjects = subjectsBySemester(sem);

  const topics = useMemo(
    () => subjects.flatMap((s) => s.importantTopics.map((t) => ({ key: `${s.courseCode}:${t}`, topic: t, code: s.courseCode }))),
    [subjects],
  );
  const completed = topics.filter((t) => done[t.key]).length;
  const percent = topics.length ? Math.round((completed / topics.length) * 100) : 0;
  const weak = topics.filter((t) => !done[t.key]).slice(0, 4);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="My Dashboard"
        title="Smart Exam Preparation"
        subtitle="Pick your semester and exam session to get a live countdown, progress tracking and a focused checklist."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {semesters.map((s) => (
              <button
                key={s}
                onClick={() => setSem(s)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  sem === s ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                Sem {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(Object.keys(EXAM_DATES) as (keyof typeof EXAM_DATES)[]).map((m) => (
              <button
                key={m}
                onClick={() => setExamMonth(m)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  examMonth === m ? "bg-accent text-accent-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {m} TEE
              </button>
            ))}
          </div>
        </div>

        {/* Top cards */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="h-5 w-5" />
              <span className="text-sm font-semibold">Countdown to {examMonth} 2026 exams</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[
                { v: cd.days, l: "Days" },
                { v: cd.hours, l: "Hours" },
                { v: cd.mins, l: "Mins" },
                { v: cd.secs, l: "Secs" },
              ].map((b) => (
                <div key={b.l} className="rounded-xl bg-background p-3 text-center">
                  <div className="text-2xl font-extrabold text-gradient sm:text-3xl">{String(b.v).padStart(2, "0")}</div>
                  <div className="text-xs text-muted-foreground">{b.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Target className="h-5 w-5" /> Progress
              </span>
              <span className="flex items-center gap-1 rounded-full bg-warning/20 px-2.5 py-1 text-xs font-bold text-warning-foreground">
                <Flame className="h-3.5 w-3.5" /> {completed} done
              </span>
            </div>
            <div className="mt-6 text-center">
              <div className="text-4xl font-extrabold text-gradient">{percent}%</div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{completed} of {topics.length} key topics</p>
            </div>
          </div>
        </div>

        {/* Checklist + weak */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Completed topics checklist</h3>
            </div>
            <div className="mt-4 space-y-2">
              {topics.map((t) => (
                <label
                  key={t.key}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-colors hover:border-primary/40"
                >
                  <input
                    type="checkbox"
                    checked={!!done[t.key]}
                    onChange={() => toggle(t.key)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span className={`flex-1 text-sm ${done[t.key] ? "text-muted-foreground line-through" : ""}`}>{t.topic}</span>
                  <Badge variant="secondary" className="font-mono text-xs">{t.code}</Badge>
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-bold">Weak-topic reminders</h3>
            </div>
            {weak.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">All caught up — great work! 🎉</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {weak.map((t) => (
                  <li key={t.key} className="rounded-lg bg-background p-3">
                    <p className="text-sm font-semibold">{t.topic}</p>
                    <p className="text-xs text-muted-foreground">{t.code} · not yet completed</p>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="outline" className="mt-5 w-full">
              <a href="/analysis">See high-yield topics</a>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
