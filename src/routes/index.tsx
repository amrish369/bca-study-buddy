import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Sparkles,
  BookOpen,
  LayoutDashboard,
  TrendingUp,
  Bell,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { subjects, papers, repeatTrends } from "@/lib/data";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Master Hub — Previous Papers, Notes & AI Prep" },
      {
        name: "description",
        content:
          "All-in-one AI-powered IGNOU BCA preparation platform: previous year question papers, solved answers, syllabus, assignments, PYQ analysis and a smart exam dashboard.",
      },
      { property: "og:title", content: "IGNOU BCA Master Hub" },
      {
        property: "og:description",
        content:
          "Previous year papers, solved assignments, notes and AI study tools for IGNOU BCA students.",
      },
      { property: "og:image", content: hero },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "IGNOU BCA Master Hub",
          description:
            "AI-powered IGNOU BCA preparation platform with previous year papers, notes and assignments.",
        }),
      },
    ],
  }),
  component: Home,
});

const features = [
  { icon: FileText, title: "Previous Year Papers", desc: "Year-wise PYQ database by semester, course code, subject and exam session.", to: "/papers" as const },
  { icon: Sparkles, title: "AI Answer Generator", desc: "IGNOU exam-style answers — short, long or point-wise, with Hindi explanations.", to: "/dashboard" as const },
  { icon: BookOpen, title: "Complete Course DB", desc: "All Semester 1–6 subjects with credits, units, topics and expected questions.", to: "/courses" as const },
  { icon: TrendingUp, title: "PYQ Analysis", desc: "Most repeated questions, chapter weightage and probability scores.", to: "/analysis" as const },
  { icon: LayoutDashboard, title: "Exam Dashboard", desc: "Countdown, daily study plan, progress tracking and weak-topic reminders.", to: "/dashboard" as const },
  { icon: Bell, title: "IGNOU Updates", desc: "Exam form, hall ticket, results, assignment and re-registration alerts.", to: "/updates" as const },
];

function Home() {
  const stats = [
    { value: `${subjects.length}+`, label: "Subjects covered" },
    { value: `${papers.length}+`, label: "Question papers" },
    { value: "6", label: "Semesters" },
    { value: "10yr", label: "PYQ trends" },
  ];

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> AI-powered exam preparation
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Crack IGNOU BCA with the <span className="text-gradient">Master Hub</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Previous year question papers, solved answers, syllabus, assignments, notes and smart
              AI study tools — everything you need in one place.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/papers">
                  Browse Previous Papers <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">Open Dashboard</Link>
              </Button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["100% free core resources", "Mobile first", "Updated for 2026"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="IGNOU BCA Master Hub preparation dashboard illustration"
              width={1280}
              height={960}
              className="w-full rounded-2xl border border-border shadow-[var(--shadow-card)]"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-gradient">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold">Everything for your BCA preparation</h2>
          <p className="mt-3 text-muted-foreground">
            Built around how IGNOU exams actually work — from PYQs to AI-written answers.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.title}
              to={f.to}
              className="group rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                Explore <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Top trends */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">High-probability topics this session</h2>
              <p className="mt-2 text-muted-foreground">Based on the last 10 years of question trends.</p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/analysis">View full analysis <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {repeatTrends.slice(0, 3).map((t) => (
              <div key={t.topic} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
                    {t.probability}% likely
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{t.importance}</span>
                </div>
                <h3 className="mt-3 font-bold">{t.topic}</h3>
                <p className="text-sm text-muted-foreground">{t.subject}</p>
                <p className="mt-3 text-xs text-muted-foreground">Asked in: {t.years.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-border bg-hero-gradient p-10 text-center">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Start your smart preparation today</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Track your syllabus, hit your daily targets and never miss an IGNOU deadline again.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/dashboard">Open My Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
