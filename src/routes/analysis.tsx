import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Check } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { repeatTrends } from "@/lib/data";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Important Questions & PYQ Analysis — Master Hub" },
      {
        name: "description",
        content:
          "IGNOU BCA previous year analysis: most repeated questions, chapter weightage, probability scores and 10-year question trends.",
      },
      { property: "og:title", content: "IGNOU BCA Important Questions & PYQ Analysis" },
      { property: "og:description", content: "Most repeated topics, weightage and probability scores for IGNOU BCA." },
    ],
    links: [{ rel: "canonical", href: "/analysis" }],
  }),
  component: AnalysisPage,
});

const importanceColor: Record<string, string> = {
  HIGH: "bg-destructive/15 text-destructive",
  MEDIUM: "bg-warning/20 text-warning-foreground",
  LOW: "bg-muted text-muted-foreground",
};

const allYears = [2025, 2024, 2023, 2022, 2021, 2020, 2019];

function AnalysisPage() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Smart Analysis"
        title="Previous Year Question Analysis"
        subtitle="Spend your time where it counts. These are the most repeated topics, their chapter weightage and probability of appearing again."
      />

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-10 sm:px-6">
        {repeatTrends.map((t) => (
          <div key={t.topic} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">{t.topic}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{t.subject}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${importanceColor[t.importance]}`}>
                {t.importance} IMPORTANCE
              </span>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Asked in</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {allYears.map((y) => {
                    const asked = t.years.includes(y);
                    return (
                      <span
                        key={y}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${
                          asked ? "bg-success/15 text-success" : "bg-muted text-muted-foreground line-through"
                        }`}
                      >
                        {asked && <Check className="h-3 w-3" />} {y}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="md:w-48">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Probability</span>
                  <span className="font-bold">{t.probability}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${t.probability}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SiteLayout>
  );
}
