import { createFileRoute } from "@tanstack/react-router";
import { Download, FileCheck2, Clock, AlertCircle } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assignments } from "@/lib/data";

export const Route = createFileRoute("/assignments")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Solved Assignments 2025-26 — Master Hub" },
      {
        name: "description",
        content:
          "Download the latest IGNOU BCA solved assignments for 2025-26 with submission deadlines and status tracking.",
      },
      { property: "og:title", content: "IGNOU BCA Solved Assignments 2025-26" },
      { property: "og:description", content: "Latest IGNOU BCA assignments with solved guides and deadlines." },
    ],
    links: [{ rel: "canonical", href: "/assignments" }],
  }),
  component: AssignmentsPage,
});

function daysLeft(date: string) {
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  return diff;
}

function AssignmentsPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Assignments"
        title="IGNOU BCA Solved Assignments"
        subtitle="Latest assignments for the 2025-26 session with solved guides, submission deadlines and a status tracker."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {assignments.map((a) => {
            const left = daysLeft(a.deadline);
            return (
              <div key={a.courseCode + a.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="font-mono">{a.courseCode}</Badge>
                    <h3 className="mt-2 text-lg font-bold">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">Session {a.session} · Semester {a.semester}</p>
                  </div>
                  {a.solved ? (
                    <Badge className="bg-success/15 text-success hover:bg-success/15">
                      <FileCheck2 className="mr-1 h-3 w-3" /> Solved
                    </Badge>
                  ) : (
                    <Badge variant="outline">Coming soon</Badge>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  {left > 0 ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" /> Due {new Date(a.deadline).toLocaleDateString()} · {left} days left
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-4 w-4" /> Submission closed
                    </span>
                  )}
                </div>

                <div className="mt-5 flex gap-2">
                  <Button size="sm" disabled={!a.solved}>
                    <Download className="mr-1 h-4 w-4" /> Solved Guide
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="mr-1 h-4 w-4" /> Question PDF
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
