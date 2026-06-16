import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarDays, GraduationCap, FileText, RefreshCw, Award } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
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
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(u.date).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
