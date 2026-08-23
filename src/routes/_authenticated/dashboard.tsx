import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  Target,
  Flame,
  ListChecks,
  AlertTriangle,
  Download,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  Trash2,
  LogOut,
  UserRound,
  RefreshCw,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  semesters,
  subjectsBySemester,
  currentAssignmentSession,
  IGNOU_PROGRAMME_CODES,
  type IgnouProgrammeCode,
} from "@/lib/data";
import { syncMyGradeCard } from "@/lib/gradecard.functions";
import { ignouPortals } from "@/lib/portals";
import { supabase } from "@/integrations/supabase/client";
import {
  getMyRecords,
  saveMyProfile,
  setTopicProgress,
  addPlanItem,
  updatePlanStatus,
  deletePlanItem,
  setSubmission,
} from "@/lib/records.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My IGNOU BCA Dashboard — Study Plan & Records" },
      {
        name: "description",
        content:
          "Your personal IGNOU BCA dashboard: exam countdown, saved study plan, topic progress, download history and assignment submission tracker.",
      },
      { property: "og:title", content: "My IGNOU BCA Dashboard" },
      {
        property: "og:description",
        content: "Track your BCA study plan, progress and assignment submissions in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/dashboard" }],
  }),
  component: DashboardPage,
});

const EXAM_DATES: Record<string, string> = { June: "2026-06-01", December: "2026-12-01" };

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchRecords = useServerFn(getMyRecords);
  const saveProfileFn = useServerFn(saveMyProfile);
  const setProgressFn = useServerFn(setTopicProgress);
  const addPlanFn = useServerFn(addPlanItem);
  const updatePlanFn = useServerFn(updatePlanStatus);
  const deletePlanFn = useServerFn(deletePlanItem);
  const setSubmissionFn = useServerFn(setSubmission);
  const syncGradeCardFn = useServerFn(syncMyGradeCard);

  const records = useQuery({
    queryKey: ["my-records"],
    queryFn: () => fetchRecords(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const [sem, setSem] = useState(1);
  const [examMonth, setExamMonth] = useState<keyof typeof EXAM_DATES>("June");
  const [syncing, setSyncing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    enrolmentNo: "",
    currentSemester: 1,
    studyCentre: "",
    programmeCode: "BCA_NEWOL" as IgnouProgrammeCode,
  });
  const [planForm, setPlanForm] = useState({ courseCode: "", title: "", targetDate: "", dailyMinutes: 60 });

  const profile = records.data?.profile ?? null;
  const gradeCard = records.data?.gradeCard ?? [];

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      fullName: profile.full_name ?? "",
      enrolmentNo: profile.enrolment_no ?? "",
      currentSemester: profile.current_semester ?? 1,
      studyCentre: profile.study_centre ?? "",
      programmeCode: (IGNOU_PROGRAMME_CODES as readonly string[]).includes(profile.programme_code)
        ? (profile.programme_code as IgnouProgrammeCode)
        : "BCA_NEWOL",
    });
    if (profile.current_semester) setSem(profile.current_semester);
  }, [profile]);

  const cd = useCountdown(EXAM_DATES[examMonth]);
  const subjects = subjectsBySemester(
    sem,
    profileForm.programmeCode.startsWith("BCA_NEW") ? "BCA_NEWOL" : "BCA",
  );


  const doneMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const row of records.data?.progress ?? []) {
      map[`${row.course_code}:${row.topic}`] = row.completed;
    }
    return map;
  }, [records.data]);

  const topics = useMemo(
    () =>
      subjects.flatMap((s) =>
        s.importantTopics.map((t) => ({ key: `${s.courseCode}:${t}`, topic: t, code: s.courseCode })),
      ),
    [subjects],
  );
  const completed = topics.filter((t) => doneMap[t.key]).length;
  const percent = topics.length ? Math.round((completed / topics.length) * 100) : 0;
  const weak = topics.filter((t) => !doneMap[t.key]).slice(0, 4);

  const submissionMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const row of records.data?.submissions ?? []) map[row.course_code] = row.status;
    return map;
  }, [records.data]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["my-records"] });

  async function toggleTopic(code: string, topic: string, next: boolean) {
    try {
      await setProgressFn({ data: { courseCode: code, topic, completed: next } });
      refresh();
    } catch {
      toast.error("Could not save progress");
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveProfileFn({ data: profileForm });
      toast.success("Profile saved");
      refresh();
    } catch {
      toast.error("Could not save profile");
    }
  }

  async function handleSyncGradeCard() {
    if (!/^\d{8,12}$/.test(profileForm.enrolmentNo.trim())) {
      toast.error("Enter a valid enrolment number (8–12 digits) first.");
      return;
    }
    setSyncing(true);
    const pending = toast.loading("Fetching your grade card from IGNOU…");
    try {
      const result = await syncGradeCardFn({
        data: {
          enrolmentNo: profileForm.enrolmentNo.trim(),
          programmeCode: profileForm.programmeCode,
        },
      });
      toast.dismiss(pending);
      if (result.status === "found") {
        toast.success(`Grade card saved — ${result.rows.length} courses`);
        refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.dismiss(pending);
      toast.error("Could not fetch the grade card right now.");
    } finally {
      setSyncing(false);
    }
  }


  async function handleAddPlan(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addPlanFn({ data: planForm });
      toast.success("Added to your study plan");
      setPlanForm({ courseCode: "", title: "", targetDate: "", dailyMinutes: 60 });
      refresh();
    } catch {
      toast.error("Could not add plan item");
    }
  }

  async function markSubmission(code: string, status: "pending" | "submitted") {
    try {
      await setSubmissionFn({
        data: {
          courseCode: code,
          session: currentAssignmentSession,
          status,
          submittedOn: status === "submitted" ? new Date().toISOString().slice(0, 10) : null,
          marks: null,
        },
      });
      refresh();
    } catch {
      toast.error("Could not update submission");
    }
  }

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="My Dashboard"
        title={profile?.full_name ? `Welcome, ${profile.full_name}` : "Smart Exam Preparation"}
        subtitle="Your saved study plan, topic progress, downloads and assignment submissions — all in one account."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {records.isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your records…
          </p>
        )}

        {/* Controls */}
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
          <div className="flex gap-2">
            {(Object.keys(EXAM_DATES) as (keyof typeof EXAM_DATES)[]).map((m) => (
              <button
                key={m}
                onClick={() => setExamMonth(m)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  examMonth === m
                    ? "bg-accent text-accent-foreground"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {m} TEE
              </button>
            ))}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>

        {/* Countdown + progress */}
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
                  <div className="text-2xl font-extrabold text-gradient sm:text-3xl">
                    {String(b.v).padStart(2, "0")}
                  </div>
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
              <p className="mt-3 text-sm text-muted-foreground">
                {completed} of {topics.length} key topics
              </p>
            </div>
          </div>
        </div>

        {/* Profile + plan builder */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <form
            onSubmit={handleSaveProfile}
            className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-primary" />
              <h3 className="font-bold">My profile</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  maxLength={100}
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enrolmentNo">Enrolment no.</Label>
                <Input
                  id="enrolmentNo"
                  maxLength={30}
                  value={profileForm.enrolmentNo}
                  onChange={(e) => setProfileForm({ ...profileForm, enrolmentNo: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currentSemester">Current semester</Label>
                <Input
                  id="currentSemester"
                  type="number"
                  min={1}
                  max={6}
                  value={profileForm.currentSemester}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, currentSemester: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="studyCentre">Study centre</Label>
                <Input
                  id="studyCentre"
                  maxLength={100}
                  value={profileForm.studyCentre}
                  onChange={(e) => setProfileForm({ ...profileForm, studyCentre: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="programmeCode">Programme</Label>
                <select
                  id="programmeCode"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={profileForm.programmeCode}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, programmeCode: e.target.value as IgnouProgrammeCode })
                  }
                >
                  {IGNOU_PROGRAMME_CODES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="submit">Save profile</Button>
              <Button type="button" variant="outline" onClick={handleSyncGradeCard} disabled={syncing}>
                {syncing ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1 h-4 w-4" />
                )}
                Fetch grade card
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Grade card is fetched live from IGNOU using your enrolment number and saved to your account.
            </p>
          </form>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-bold">My grade card ({profileForm.programmeCode})</h3>
            </div>
            {gradeCard.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No marks saved yet — enter your enrolment number, pick your programme and hit “Fetch grade
                card”.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-muted-foreground">
                      <th className="py-2">Course</th>
                      <th className="py-2">Asgn</th>
                      <th className="py-2">Theory</th>
                      <th className="py-2">Practical</th>
                      <th className="py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeCard.map((g) => (
                      <tr key={g.id} className="border-t border-border">
                        <td className="py-2 font-mono text-xs">{g.course_code}</td>
                        <td className="py-2">{g.assignment_marks ?? "—"}</td>
                        <td className="py-2">{g.theory_marks ?? "—"}</td>
                        <td className="py-2">{g.practical_marks ?? "—"}</td>
                        <td className="py-2 font-semibold">{g.total ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">


          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <h3 className="font-bold">My study plan</h3>
            </div>
            <form onSubmit={handleAddPlan} className="mt-4 grid gap-3 sm:grid-cols-2">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={planForm.courseCode}
                onChange={(e) => setPlanForm({ ...planForm, courseCode: e.target.value })}
                required
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.courseCode} value={s.courseCode}>
                    {s.courseCode} — {s.title}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Goal (e.g. Finish Unit 1-4)"
                maxLength={150}
                value={planForm.title}
                onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                required
              />
              <Input
                type="date"
                value={planForm.targetDate}
                onChange={(e) => setPlanForm({ ...planForm, targetDate: e.target.value })}
                required
              />
              <Input
                type="number"
                min={10}
                max={600}
                value={planForm.dailyMinutes}
                onChange={(e) => setPlanForm({ ...planForm, dailyMinutes: Number(e.target.value) })}
              />
              <Button type="submit" className="sm:col-span-2">
                Add to plan
              </Button>
            </form>

            <ul className="mt-4 space-y-2">
              {(records.data?.plan ?? []).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.course_code} · {p.target_date ?? "no date"} · {p.daily_minutes} min/day
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      value={p.status}
                      onChange={async (e) => {
                        await updatePlanFn({
                          data: { id: p.id, status: e.target.value as "planned" | "doing" | "done" },
                        });
                        refresh();
                      }}
                    >
                      <option value="planned">Planned</option>
                      <option value="doing">Doing</option>
                      <option value="done">Done</option>
                    </select>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={async () => {
                        await deletePlanFn({ data: { id: p.id } });
                        refresh();
                      }}
                      aria-label="Delete plan item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
              {(records.data?.plan ?? []).length === 0 && (
                <li className="text-sm text-muted-foreground">No plan items yet — add your first goal.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Checklist + weak topics */}
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
                    checked={!!doneMap[t.key]}
                    onChange={(e) => toggleTopic(t.code, t.topic, e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <span className={`flex-1 text-sm ${doneMap[t.key] ? "text-muted-foreground line-through" : ""}`}>
                    {t.topic}
                  </span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {t.code}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-5">
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
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                <h3 className="font-bold">IGNOU portals (LMS)</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {ignouPortals.map((p) => (
                  <li key={p.url}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {p.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Submission tracker + downloads */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <h3 className="font-bold">Assignment submissions ({currentAssignmentSession})</h3>
            </div>
            <div className="mt-4 space-y-2">
              {subjects.map((s) => {
                const status = submissionMap[s.courseCode] ?? "pending";
                return (
                  <div
                    key={s.courseCode}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{s.title}</p>
                      <p className="font-mono text-xs text-muted-foreground">{s.courseCode}</p>
                    </div>
                    {status === "pending" ? (
                      <Button size="sm" variant="outline" onClick={() => markSubmission(s.courseCode, "submitted")}>
                        Mark submitted
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-success/15 text-success hover:bg-success/15">Submitted</Badge>
                        <Button size="sm" variant="ghost" onClick={() => markSubmission(s.courseCode, "pending")}>
                          Undo
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="font-bold">My downloads</h3>
            </div>
            <ul className="mt-4 space-y-2">
              {(records.data?.downloads ?? []).map((d) => (
                <li key={d.id} className="rounded-lg border border-border bg-background px-3 py-2">
                  <p className="text-sm font-semibold">{d.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.course_code} · {d.resource_type} ·{" "}
                    {d.pdf_url ? (
                      <a href={d.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary">
                        open again
                      </a>
                    ) : (
                      "no link"
                    )}
                  </p>
                </li>
              ))}
              {(records.data?.downloads ?? []).length === 0 && (
                <li className="text-sm text-muted-foreground">
                  Nothing yet — every paper or assignment you open gets saved here.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
