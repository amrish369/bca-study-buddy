import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getPaperQuestions, solveAssignmentQuestion } from "@/lib/prep.functions";

type Q = { qno: string; question: string; marks: number; answer?: string; loading?: boolean };

export function PaperSolution({ courseCode, year, session }: { courseCode: string; year: number; session: "June" | "December" }) {
  const getQs = useServerFn(getPaperQuestions);
  const solve = useServerFn(solveAssignmentQuestion);
  const [qs, setQs] = useState<Q[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState(false);

  async function load() {
    setBusy(true);
    setMissing(false);
    try {
      const r = await getQs({ data: { courseCode, year, session } });
      if (!r.found) { setMissing(true); toast.error("Original paper IGNOU server par nahi mila"); return; }
      setQs(r.questions);
      toast.success(`Original PDF se ${r.questions.length} questions padhe gaye`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Solution nahi mila"); }
    finally { setBusy(false); }
  }

  async function answer(i: number) {
    if (!qs) return;
    const q = qs[i];
    setQs((p) => p!.map((x, j) => (j === i ? { ...x, loading: true } : x)));
    try {
      const r = await solve({ data: { courseCode, title: courseCode, question: q.question, marks: Math.min(20, Math.max(5, q.marks || 10)) } });
      setQs((p) => p!.map((x, j) => (j === i ? { ...x, answer: r.answer, loading: false } : x)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Answer nahi bana");
      setQs((p) => p!.map((x, j) => (j === i ? { ...x, loading: false } : x)));
    }
  }

  if (!qs) {
    return (
      <div className="w-full">
        <Button size="sm" variant="secondary" className="h-8" onClick={load} disabled={busy}>
          {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1 h-3.5 w-3.5" />}
          {busy ? "Original PDF padh rahe hain…" : "Full AI Solution"}
        </Button>
        {missing && <p className="mt-1 text-xs text-muted-foreground">Yeh original paper IGNOU ke server par uplabdh nahi hai.</p>}
      </div>
    );
  }

  return (
    <div className="mt-2 w-full space-y-2">
      <p className="text-xs text-muted-foreground">Questions original IGNOU PDF se liye gaye. Answers AI se bane hain — ek baar check kar lein.</p>
      {qs.map((q, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
          <p className="font-semibold">Q{q.qno}. {q.question} <span className="text-xs text-muted-foreground">({q.marks} marks)</span></p>
          {q.answer ? (
            <>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed">{q.answer}</pre>
              <Button size="sm" variant="ghost" className="mt-1 h-7" onClick={() => { navigator.clipboard.writeText(q.answer!); toast.success("Copy ho gaya"); }}>
                <Copy className="mr-1 h-3 w-3" /> Copy
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" className="mt-2 h-7" onClick={() => answer(i)} disabled={q.loading}>
              {q.loading ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Likha ja raha hai…</> : "Answer dekho"}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
