import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ClipboardList, CalendarDays, Download, Loader2, Search, FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { semesters, assignmentsBySemester, currentAssignmentSession } from "@/lib/data";
import { getAssignmentUrl } from "@/lib/assignments.functions";
import { logDownload } from "@/lib/records.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/assignments")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Assignments 2025-26 — Download Question PDFs" },
      {
        name: "description",
        content:
          "Download IGNOU BCA assignment question papers semester-wise for the 2025-26 session, with subject search and submission deadlines.",
      },
      { property: "og:title", content: "IGNOU BCA Assignments 2025-26" },
      {
        property: "og:description",
        content: "Semester-wise IGNOU BCA assignment PDFs with search and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/assignments" }],
  }),
  component: AssignmentsPage,
});

function DownloadButton({
  courseCode,
  title,
  kind,
}: {
  courseCode: string;
  title: string;
  kind: "question" | "solved";
}) {
  const fetchUrl = useServerFn(getAssignmentUrl);
  const saveDownload = useServerFn(logDownload);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const pending = toast.loading(`Fetching ${courseCode} assignment…`);
    try {
      const result = await fetchUrl({
        data: { courseCode, session: currentAssignmentSession, kind },
      });
      toast.dismiss(pending);
      if (result.pdfUrl) {
        toast.success(`${courseCode} assignment found — opening PDF`);
        window.open(result.pdfUrl, "_blank", "noopener,noreferrer");
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await saveDownload({
            data: {
              resourceType: "assignment",
              courseCode,
              label: `${title} (${currentAssignmentSession} ${kind})`,
              pdfUrl: result.pdfUrl,
            },
          }).catch(() => undefined);
        }
      } else {
        toast.error(
          `${courseCode} ${kind === "solved" ? "solved guide" : "assignment"} is not available online yet. We'll keep checking IGNOU's site.`,
        );
      }
    } catch (error) {
      console.error(error);
      toast.dismiss(pending);
      toast.error("Could not reach the assignment server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      variant={kind === "solved" ? "secondary" : "outline"}
      className="h-8"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
      ) : kind === "solved" ? (
        <FileCheck2 className="mr-1 h-3.5 w-3.5" />
      ) : (
        <Download className="mr-1 h-3.5 w-3.5" />
      )}
      {kind === "solved" ? "Solved" : "Question PDF"}
    </Button>
  );
}

function AssignmentsPage() {
  const [sem, setSem] = useState(1);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const all = assignmentsBySemester(sem);
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter(
      (a) => a.title.toLowerCase().includes(q) || a.courseCode.toLowerCase().includes(q),
    );
  }, [sem, query]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={`Session ${currentAssignmentSession}`}
        title="IGNOU BCA Assignments"
        subtitle="Semester-wise assignment question papers fetched live from IGNOU's official website, with deadlines and solved guides where available."
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
          {list.map((a) => (
            <div
              key={a.courseCode}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="secondary" className="font-mono">
                    {a.courseCode}
                  </Badge>
                  <h3 className="mt-2 text-lg font-bold">{a.title}</h3>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" /> Last date: {a.deadline} · {a.credits} credits
                  </p>
                </div>
                <ClipboardList className="h-6 w-6 shrink-0 text-primary" />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <DownloadButton courseCode={a.courseCode} title={a.title} kind="question" />
                {a.solved && <DownloadButton courseCode={a.courseCode} title={a.title} kind="solved" />}
                <span className="text-xs text-muted-foreground">Session {a.session}</span>
              </div>
            </div>
          ))}
        </div>

        {list.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">No assignments match your search.</p>
        )}
      </div>
    </SiteLayout>
  );
}
