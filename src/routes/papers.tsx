import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { FileText, FileCheck2, Search, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { semesters, subjectsBySemester, papersForCourse } from "@/lib/data";
import { getPaperUrl } from "@/lib/papers.functions";


export const Route = createFileRoute("/papers")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Previous Year Question Papers (PYQ) — Master Hub" },
      {
        name: "description",
        content:
          "Download IGNOU BCA previous year question papers semester-wise and course-wise. June & December sessions with solved answers.",
      },
      { property: "og:title", content: "IGNOU BCA Previous Year Question Papers" },
      { property: "og:description", content: "Year-wise IGNOU BCA PYQ database with solved answers." },
    ],
    links: [{ rel: "canonical", href: "/papers" }],
  }),
  component: PapersPage,
});

function PapersPage() {
  const [sem, setSem] = useState(1);
  const [query, setQuery] = useState("");

  const subjects = useMemo(() => {
    const list = subjectsBySemester(sem);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (s) => s.title.toLowerCase().includes(q) || s.courseCode.toLowerCase().includes(q),
    );
  }, [sem, query]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="PYQ Database"
        title="Previous Year Question Papers"
        subtitle="Browse IGNOU BCA question papers by semester and course. Each subject lists June & December sessions with solved answers where available."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                Sem {s}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subject or course code"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {subjects.map((s) => {
            const list = papersForCourse(s.courseCode);
            return (
              <div key={s.courseCode + s.semester} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary" className="font-mono">{s.courseCode}</Badge>
                    <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.credits} credits · {s.units} units</p>
                  </div>
                  <FileText className="h-6 w-6 shrink-0 text-primary" />
                </div>

                <div className="mt-4 space-y-2">
                  {list.slice(0, 4).map((p) => (
                    <div
                      key={p.year + p.session}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                    >
                      <span className="text-sm font-medium">{p.session} {p.year}</span>
                      <div className="flex items-center gap-2">
                        {p.hasSolution && (
                          <Badge className="bg-success/15 text-success hover:bg-success/15">
                            <FileCheck2 className="mr-1 h-3 w-3" /> Solved
                          </Badge>
                        )}
                        <Button size="sm" variant="outline" className="h-8">
                          <Download className="mr-1 h-3.5 w-3.5" /> PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {subjects.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">No subjects match your search.</p>
        )}
      </div>
    </SiteLayout>
  );
}
