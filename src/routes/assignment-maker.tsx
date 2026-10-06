import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Printer, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { semesters, subjectsBySemester, findSubject, currentAssignmentSession } from "@/lib/data";
import { solveAssignment, type AssignmentAnswer } from "@/lib/prep.functions";

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
  component: MakerPage,
});

type Details = { name: string; enrolment: string; programme: string; studyCentre: string; regionalCentre: string; mobile: string; email: string; address: string };
const emptyDetails: Details = { name: "", enrolment: "", programme: "BCA_NEWOL", studyCentre: "", regionalCentre: "", mobile: "", email: "", address: "" };
const KEY = "bca-assignment-details";

const BLACK = "#1a1a1a";
const BLUE = "#1d3fa8";
const ruled: React.CSSProperties = {
  backgroundColor: "#ffffff",
  backgroundImage: "linear-gradient(to right, transparent 22mm, #e05656 22mm, #e05656 calc(22mm + 1px), transparent calc(22mm + 1px)), repeating-linear-gradient(to bottom, transparent 0, transparent calc(9mm - 1px), #9fc2e6 calc(9mm - 1px), #9fc2e6 9mm)",
  backgroundPosition: "0 0, 0 24mm",
  fontFamily: "'Kalam', cursive",
  lineHeight: "9mm",
  fontSize: "15px",
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
  const [answers, setAnswers] = useState<AssignmentAnswer[] | null>(null);
  const [loading, setLoading] = useState(false);
  const solve = useServerFn(solveAssignment);
  const subject = findSubject(course);

  useEffect(() => { try { const s = localStorage.getItem(KEY); if (s) setD({ ...emptyDetails, ...JSON.parse(s) }); } catch { /* ignore */ } }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(d)); }, [d]);

  async function run() {
    if (!subject) return;
    setLoading(true); setAnswers(null);
    try {
      const r = await solve({ data: { courseCode: subject.courseCode, title: subject.title, session: currentAssignmentSession, questionsText: qText } });
      setAnswers(r.answers);
      toast.success("Assignment taiyaar! Neeche preview dekho.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
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
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <label>ID card photo (page 2)<input type="file" accept="image/*" className="mt-1 block" onChange={(e) => readImages(e.target.files, setIdCard)} /></label>
            <label>Question paper photos (optional)<input type="file" accept="image/*" multiple className="mt-1 block" onChange={(e) => readImages(e.target.files, setQpImgs)} /></label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={run} disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Likha ja raha hai (1-2 min)…</> : <><Sparkles className="h-4 w-4" /> Assignment solve karo</>}</Button>
            {answers && <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> Download PDF</Button>}
          </div>
          <p className="text-xs text-muted-foreground">"Download PDF" me print window khulega — Destination me "Save as PDF" chuno. Note: IGNOU apni handwriting maangta hai — is PDF ko dekhkar khud likhna sabse safe hai. AI answers ek baar check zaroor karo.</p>
        </div>

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
                  <div key={a.qno + a.question} className="a4" style={{ ...ruled, breakBefore: "page" }}>
                    <div style={{ position: "absolute", top: "8mm", right: "12mm", fontSize: 13, color: BLACK }}>Date: {today} &nbsp; Page No. {pageNo}</div>
                    <div style={{ position: "absolute", top: "8mm", left: "26mm", fontSize: 13, color: BLACK }}>{subject.courseCode}</div>
                    <p style={{ color: BLACK, fontWeight: 700, whiteSpace: "pre-wrap" }}>Q.{a.qno.replace(/^Q\.?\s*/i, "")} {a.question} <span style={{ float: "right" }}>({a.marks} Marks)</span></p>
                    <p style={{ color: BLACK, fontWeight: 700 }}>Ans.</p>
                    <p style={{ color: BLUE, whiteSpace: "pre-wrap" }}>{a.answer}</p>
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
