import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarDays, GraduationCap, FileText, RefreshCw, Award, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ignouPortals } from "@/lib/portals";
import { updates, type UpdateItem } from "@/lib/data";


export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Latest Updates — Exam, Result & Hall Ticket | Master Hub" },
      {
        name: "description",
        content:
          "Latest IGNOU updates for BCA students: exam form, hall ticket, result, assignment dates, re-registration and grade card.",
      },
      { property: "og:title", content: "IGNOU BCA Latest Updates" },
      { property: "og:description", content: "Exam form, hall ticket, result and registration updates for IGNOU BCA." },
    ],
    links: [{ rel: "canonical", href: "/updates" }],
  }),
  component: UpdatesPage,
});

const icons: Record<UpdateItem["category"], typeof Bell> = {
  Exam: FileText,
  Result: Award,
  Assignment: CalendarDays,
  Registration: RefreshCw,
  "Hall Ticket": GraduationCap,
};

function UpdatesPage() {
  const sorted = [...updates].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Notifications"
        title="IGNOU Updates & Alerts"
        subtitle="Stay on top of exam forms, hall tickets, results, assignment dates and re-registration deadlines."
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="space-y-4">
          {sorted.map((u) => {
            const Icon = icons[u.category];
            return (
              <div key={u.id} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold">{u.title}</h3>
                    <Badge variant="secondary">{u.category}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{u.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="text-xs text-muted-foreground">{new Date(u.date).toLocaleDateString()}</p>
                    {u.actionUrl && (
                      <Button asChild size="sm" variant="outline">
                        <a href={u.actionUrl} target="_blank" rel="noopener noreferrer">
                          {u.actionLabel ?? "Open portal"}
                          <ExternalLink className="ml-1 h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-bold">All official IGNOU portals</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified working links for result, grade card, assignment status and more.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ignouPortals.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-border p-4 transition-colors hover:border-primary/60 hover:bg-primary/5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{p.name}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

    </SiteLayout>
  );
}
