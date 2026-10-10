import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Printer, Sparkles, Pencil, Check } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { semesters, subjectsBySemester, findSubject, currentAssignmentSession } from "@/lib/data";
import { listAssignmentQuestions, solveAssignmentQuestion, type AssignmentAnswer } from "@/lib/prep.functions";
import { getSaved, upsertSaved, type HandStyle } from "@/lib/savedAssignments";
import { SavedAssignments } from "@/components/SavedAssignments";
import { z } from "zod";

export const Route = createFileRoute("/assignment-maker")({
  head: () => ({
    meta: [
      { title: "IGNOU BCA Assignment Maker — Handwritten Style PDF" },
      { name: "description", content: "Cover page, ID card, question paper and handwritten-style solved pages in one IGNOU assignment PDF." },
      { property: "og:title", content: "IGNOU BCA Assignment Maker" },
      { property: "og:description", content: "Make a complete IGNOU assignment PDF: cover, ID card, questions and solved ruled pages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => z.object({ id: z.string().optional() }).parse(s),
  component: MakerPage,
});

type Details = { name: string; enrolment: string; programme: string; studyCentre: string; regionalCentre: string; mobile: string; email: string; address: string };
const emptyDetails: Details = { name: "", enrolment: "", programme: "BCA_NEWOL", studyCentre: "", regionalCentre: "", mobile: "", email: "", address: "" };
const KEY = "bca-assignment-details";

const BLACK = "#1a1a1a";
const BLUE = "#1d3fa8";
const STYLES: Record<HandStyle, { label: string; font: string; size: string; inks: string[]; slant: number }> = {
  neat: { label: "Neat (topper jaisi saaf)", font: "'Patrick Hand', cursive", size: "17px", inks: ["#1e3a8a", "#1d3fa8", "#1e40af"], slant: 0.4 },
  cursive: { label: "Cursive (jaldi wali jhuki)", font: "'Caveat', cursive", size: "21px", inks: ["#1a365d", "#1e3a8a", "#22409a"], slant: 1.2 },
  casual: { label: "Casual ballpen (Indian)", font: "'Kalam', cursive", size: "15px", inks: ["#1d3fa8", "#2343b0", "#1a3796"], slant: 0.8 },
};
// Deterministic pseudo-random so print and preview look the same.
function rnd(seed: number) { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
function HandText({ text, style, ink, seed }: { text: string; style: HandStyle; ink?: string; seed: number }) {
  const st = STYLES[style];
  return (
    <>
      {text.split("\n").map((line, i) => {
        const r = rnd(seed + i), r2 = rnd(seed + i + 77);
        const code = /^\s{2,}|[;{}]\s*$/.test(line);
        return (
          <div key={i} style={{
            minHeight: "9mm", whiteSpace: "pre-wrap",
            color: ink ?? st.inks[Math.floor(r * st.inks.length)],
            transform: `rotate(${((r - 0.5) * st.slant).toFixed(2)}deg) translateY(${((r2 - 0.5) * 2).toFixed(1)}px)`,
            transformOrigin: "left center",
            marginLeft: `${(r2 * 3).toFixed(1)}px`,
            letterSpacing: `${((r - 0.5) * 0.5).toFixed(2)}px`,
            wordSpacing: `${(r2 * 3).toFixed(1)}px`,
            opacity: 0.88 + r * 0.12,
            fontWeight: /^[A-Z][^.]{2,50}:?$/.test(line.trim()) ? 700 : 400,
            fontFamily: code ? "'Patrick Hand', cursive" : undefined,
          }}>{line || "\u00a0"}</div>
        );
      })}
    </>
  );
}
const ruled: React.CSSProperties = {
  backgroundColor: "#ffffff",
  backgroundImage: "linear-gradient(to right, transparent 22mm, #e05656 22mm, #e05656 calc(22mm + 1px), transparent calc(22mm + 1px)), repeating-linear-gradient(to bottom, transparent 0, transparent calc(9mm - 1px), #9fc2e6 calc(9mm - 1px), #9fc2e6 9mm)",
  backgroundPosition: "0 0, 0 24mm",
  lineHeight: "9mm",
};

function readImages(files: FileList | null, cb: (urls: string[]) => void) {
  if (!files) return;
  Promise.all(Array.from(files).map((f) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(f); }))).then(cb);
}

function MakerPage() {
  const [sem, setSem] = useState(1);
  const subs = subjectsBySemester(sem);
  const [course, setCourse] = useState(subs[0]?.courseCode ?? "");
  const [d, setD] = useState<Details>(emptyDetails);
  const [idCard, setIdCard] = useState<string[]>([]);
  const [qpImgs, setQpImgs] = useState<string[]>([]);
  const [qText, setQText] = useState("");
  const [instr, setInstr] = useState("");
  const [answers, setAnswers] = useState<AssignmentAnswer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [style, setStyle] = useState<HandStyle>("casual");
  const [progress, setProgress] = useState("");
  const [editing, setEditing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const listQs = useServerFn(listAssignmentQuestions);
  const solveQ = useServerFn(solveAssignmentQuestion);
  const subject = findSubject(course);
  const { id } = Route.useSearch();

  useEffect(() => {
    if (!id) return;
    const a = getSaved(id);
    if (!a) return;
    setSavedId(a.id); setSem(a.semester); setCourse(a.courseCode); setStyle(a.style); setAnswers(a.answers);
  }, [id]);

  function persist(list: AssignmentAnswer[], status: "processing" | "completed", sid: string) {
    if (!subject) return;
    upsertSaved({ id: sid, courseCode: subject.courseCode, title: subject.title, semester: subject.semester, session: currentAssignmentSession, style, status, answers: list, createdAt: getSaved(sid)?.createdAt ?? new Date().toISOString(), updatedAt: "" });
  }

  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setD({ ...emptyDetails, ...JSON.parse(s) }); } catch { /* ignore */ } }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(d)); }, [d]);

  async function run() {
    if (!subject) return;
    setLoading(true); setAnswers(null); setEditing(false);
    const sid = crypto.randomUUID(); setSavedId(sid);
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    try {
      setProgress("Questions nikale ja rahe hain…");
      const { questions } = await listQs({ data: { courseCode: subject.courseCode, title: subject.title, session: currentAssignmentSession, questionsText: qText } });
      if (!questions.length) throw new Error("Questions nahi mile, dobara try karo");
      const done: AssignmentAnswer[] = [];
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        let answer = "";
        for (let attempt = 0; attempt < 5 && !answer; attempt++) {
          setProgress(`Q${i + 1}/${questions.length} likha ja raha hai… ${Math.round((i / questions.length) * 100)}% ${attempt ? `(limit aayi, ${attempt * 20}s ruk kar dobara)` : ""}`);
          try {
            answer = (await solveQ({ data: { courseCode: subject.courseCode, title: subject.title, question: q.question, marks: q.marks || 10, instructions: instr } })).answer;
          } catch { await wait(20000 * (attempt + 1)); }
        }
        done.push({ ...q, answer: answer || "(Is question ka answer abhi nahi bana — Edit karke likho ya baad me dobara try karo.)" });
        setAnswers([...done]);
        persist(done, i === questions.length - 1 ? "completed" : "processing", sid);
      }
      setProgress("");
      toast.success("Assignment taiyaar aur Dashboard me save ho gaya!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); setProgress(""); }
    finally { setLoading(false); }
  }

  const field = (k: keyof Details, label: string) => (
    <label className="text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input className="mt-1 w-full rounded-lg border border-input bg-background p-2" value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} />
    </label>
  );
  const today = new Date().toLocaleDateString("en-IN");
  let pageNo = 0;

  return (
    <SiteLayout>
      <style>{`
        .a4 { width: 210mm; min-height: 297mm; margin: 0 auto 16px; box-shadow: 0 2px 12px rgba(0,0,0,.15); padding: 24mm 12mm 14mm 26mm; position: relative; color: ${BLACK}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @media print {
          @page { size: A4; margin: 0; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; }
          .a4 { box-shadow: none; margin: 0; page-break-after: always; }
        }
      `}</style>
      <PageHeader eyebrow="Assignment Maker" title="Complete IGNOU Assignment PDF"
        subtitle="Cover page + ID card + question paper + handwriting-style solved pages — ek click me." />
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="font-semibold">1. Student details (cover page)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {field("name", "Name")}{field("enrolment", "Enrolment No.")}{field("programme", "Programme")}
            {field("studyCentre", "Study Centre (code & name)")}{field("regionalCentre", "Regional Centre")}
            {field("mobile", "Mobile")}{field("email", "Email")}{field("address", "Address")}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h2 className="font-semibold">2. Subject & question paper</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="rounded-lg border border-input bg-background p-2" value={sem}
              onChange={(e) => { const s = Number(e.target.value); setSem(s); setCourse(subjectsBySemester(s)[0]?.courseCode ?? ""); }}>
              {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <select className="rounded-lg border border-input bg-background p-2" value={course} onChange={(e) => setCourse(e.target.value)}>
              {subs.map((s) => <option key={s.courseCode} value={s.courseCode}>{s.courseCode} — {s.title}</option>)}
            </select>
          </div>
          <textarea className="w-full rounded-lg border border-input bg-background p-2 text-sm" rows={5} value={qText} onChange={(e) => setQText(e.target.value)}
            placeholder="Assignment ke questions yahan paste karo (best result). Khali chhodoge to AI typical IGNOU questions khud lega." />
          <label className="block text-sm">
            <span className="text-muted-foreground">Instructions (optional) — AI ko batao kya badlav chahiye</span>
            <textarea className="mt-1 w-full rounded-lg border border-input bg-background p-2 text-sm" rows={3} value={instr} onChange={(e) => setInstr(e.target.value)}
              placeholder="Jaise: Answers Hindi me likho / Q2 ka answer chhota karo / har answer me diagram ka explanation do / C program comments ke saath" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <label>ID card photo (page 2)<input type="file" accept="image/*" className="mt-1 block" onChange={(e) => readImages(e.target.files, setIdCard)} /></label>
            <label>Question paper photos (optional)<input type="file" accept="image/*" multiple className="mt-1 block" onChange={(e) => readImages(e.target.files, setQpImgs)} /></label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Likha ja raha hai…</> : <><Sparkles className="h-4 w-4" /> Assignment solve karo</>}</Button>
            {answers && <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Download PDF</Button>}
            {answers && !loading && <Button variant="outline" onClick={() => { if (editing && savedId) { persist(answers, "completed", savedId); toast.success("Save ho gaya"); } setEditing(!editing); }}>
              {editing ? <><Check className="h-4 w-4" /> Save edits</> : <><Pencil className="h-4 w-4" /> Edit answers</>}</Button>}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Handwriting style: </span>
            {(Object.keys(STYLES) as HandStyle[]).map((k) => (
              <button key={k} onClick={() => setStyle(k)} className={`mr-2 mt-1 rounded-full border px-3 py-1 ${style === k ? "border-primary bg-primary/10" : "border-border"}`} style={{ fontFamily: STYLES[k].font }}>{STYLES[k].label}</button>
            ))}
          </div>
          {progress && <p className="text-sm font-medium text-primary">{progress} — page band mat karo, har question save hota ja raha hai.</p>}
          <p className="text-xs text-muted-foreground">"Download PDF" me print window khulega — Destination me "Save as PDF" chuno. Note: IGNOU apni handwriting maangta hai — is PDF ko dekhkar khud likhna sabse safe hai. AI answers ek baar check zaroor karo.</p>
        </div>

        <SavedAssignments />
        {editing && answers && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            {answers.map((a, i) => (
              <label key={i} className="block text-sm">
                <span className="font-medium">Q.{a.qno} {a.question}</span>
                <textarea className="mt-1 w-full rounded-lg border border-input bg-background p-2" rows={8} value={a.answer}
                  onChange={(e) => setAnswers(answers.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} />
              </label>
            ))}
          </div>
        )}
        {answers && subject && (
          <div className="overflow-x-auto">
            <div id="print-area">
              <div className="a4" style={{ background: "#fff", fontFamily: "'Times New Roman', serif", padding: "18mm" }}>
                <div style={{ border: `3px double ${BLACK}`, padding: "12mm", minHeight: "255mm" }}>
                  <p style={{ textAlign: "center", fontSize: 26, fontWeight: 700 }}>INDIRA GANDHI NATIONAL OPEN UNIVERSITY</p>
                  <p style={{ textAlign: "center", fontSize: 18, marginTop: 6 }}>School of Computer and Information Sciences</p>
                  <p style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginTop: 30, textDecoration: "underline" }}>ASSIGNMENT</p>
                  <p style={{ textAlign: "center", fontSize: 18, marginTop: 8 }}>Session: {currentAssignmentSession}</p>
                  <table style={{ width: "100%", marginTop: 36, fontSize: 17, borderCollapse: "collapse" }}>
                    <tbody>
                      {[["Name", d.name], ["Enrolment No.", d.enrolment], ["Programme", d.programme], ["Course Code", subject.courseCode], ["Course Title", subject.title], ["Semester", String(subject.semester)], ["Study Centre", d.studyCentre], ["Regional Centre", d.regionalCentre], ["Mobile", d.mobile], ["Email", d.email], ["Address", d.address], ["Date of Submission", today]].map(([k, v]) => (
                        <tr key={k}><td style={{ padding: "8px 4px", fontWeight: 700, width: "40%", borderBottom: "1px solid #999" }}>{k}</td><td style={{ padding: "8px 4px", borderBottom: "1px solid #999" }}>{v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: 60, display: "flex", justifyContent: "space-between", fontSize: 16 }}>
                    <span>Student's Signature: ____________</span><span>Evaluator: ____________</span>
                  </div>
                </div>
              </div>
              {idCard.length > 0 && (
                <div className="a4" style={{ background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 18 }}>IGNOU Identity Card</p>
                  {idCard.map((src, i) => <img key={i} src={src} alt="ID card" style={{ maxWidth: "100%", maxHeight: "120mm", border: "1px solid #ccc" }} />)}
                </div>
              )}
              {qpImgs.map((src, i) => (
                <div key={i} className="a4" style={{ background: "#fff", padding: "8mm" }}>
                  <img src={src} alt={`Question paper page ${i + 1}`} style={{ width: "100%", maxHeight: "280mm", objectFit: "contain" }} />
                </div>
              ))}
              {answers.map((a) => {
                pageNo += 1;
                return (
                  <div key={a.qno + a.question} className="a4" style={{ ...ruled, fontFamily: STYLES[style].font, fontSize: STYLES[style].size, breakBefore: "page" }}>
                    <div style={{ position: "absolute", top: "8mm", right: "12mm", fontSize: 13, color: BLACK }}>Date: {today} &nbsp; Page No. {pageNo}</div>
                    <div style={{ position: "absolute", top: "8mm", left: "26mm", fontSize: 13, color: BLACK }}>{subject.courseCode}</div>
                    <div style={{ fontWeight: 700 }}><HandText text={`Q.${a.qno.replace(/^Q\.?\s*/i, "")} ${a.question}  (${a.marks} Marks)`} style={style} ink={BLACK} seed={pageNo * 31} /></div>
                    <p style={{ color: BLACK, fontWeight: 700 }}>Ans.</p>
                    <HandText text={a.answer} style={style} seed={pageNo * 97} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
