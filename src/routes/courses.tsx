import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Layers, GraduationCap } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { semesters, subjectsBySemester } from "@/lib/data";
import { StudyVideos } from "@/components/StudyVideos";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Course & Syllabus Database (Sem 1–6) — Master Hub" },
      {
        name: "description",
        content:
          "Complete IGNOU BCA course database: course codes, subject names, credits, units and important topics for all six semesters.",
      },
      { property: "og:title", content: "IGNOU BCA Course & Syllabus Database" },
      { property: "og:description", content: "All BCA subjects with credits, units and important topics." },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const [sem, setSem] = useState(1);
  const subjects = subjectsBySemester(sem);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Course Database"
        title="Complete BCA Course Database"
        subtitle="Every subject across Semesters 1–6 with course code, credits, units and the topics that matter most for exams."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {semesters.map((s) => (
            <button
              key={s}
              onClick={() => setSem(s)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                sem === s
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              Semester {s}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {subjects.map((s) => (
            <div key={s.courseCode} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-mono">{s.courseCode}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" /> Sem {s.semester}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
              <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {s.credits} credits</span>
                <span className="flex items-center gap-1"><Layers className="h-4 w-4" /> {s.units} units</span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Important topics</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {s.importantTopics.map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <StudyVideos
                query={`IGNOU ${s.courseCode} ${s.title} full lecture in hindi`}
                label={`${s.courseCode} lecture videos`}
              />
            </div>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
