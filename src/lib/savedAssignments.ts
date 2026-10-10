// Saved assignments live in the browser (localStorage) so they work with or without login.
export type SavedAnswer = { qno: string; question: string; marks: number; answer: string };
export type SavedAssignment = {
  id: string;
  courseCode: string;
  title: string;
  semester: number;
  session: string;
  style: HandStyle;
  status: "processing" | "completed";
  answers: SavedAnswer[];
  createdAt: string;
  updatedAt: string;
};
export type HandStyle = "neat" | "cursive" | "casual";

const KEY = "bca-saved-assignments";
const EVT = "bca-saved-assignments-change";

export function listSaved(): SavedAssignment[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(all: SavedAssignment[]) {
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVT));
}
export function getSaved(id: string) { return listSaved().find((a) => a.id === id); }
export function upsertSaved(a: SavedAssignment) {
  const all = listSaved().filter((x) => x.id !== a.id);
  write([{ ...a, updatedAt: new Date().toISOString() }, ...all]);
}
export function deleteSaved(id: string) { write(listSaved().filter((a) => a.id !== id)); }
export function onSavedChange(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); };
}
