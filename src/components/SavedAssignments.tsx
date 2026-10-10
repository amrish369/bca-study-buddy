import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FileText, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSaved, listSaved, onSavedChange, type SavedAssignment } from "@/lib/savedAssignments";

export function SavedAssignments() {
  const [items, setItems] = useState<SavedAssignment[]>([]);
  useEffect(() => { const load = () => setItems(listSaved()); load(); return onSavedChange(load); }, []);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" /> My Saved Assignments</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Abhi koi assignment save nahi hai. <Link to="/assignment-maker" className="text-primary underline">Assignment Maker</Link> se banao.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
              <div>
                <p className="font-medium">{a.courseCode} — {a.title}</p>
                <p className="text-xs text-muted-foreground">
                  {a.answers.length} questions · {a.status === "completed" ? "Complete" : "Adhoora (resume karo)"} · {new Date(a.updatedAt).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/assignment-maker" search={{ id: a.id }}><Pencil className="h-4 w-4" /> Open / Edit / PDF</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete karna hai?")) deleteSaved(a.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
