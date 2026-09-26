import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bca-lesson-progress";
const CHANGE_EVENT = "bca-lesson-progress-change";

type ProgressStore = Record<string, string[]>;

function readStore(): ProgressStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ProgressStore) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage full / unavailable — progress simply won't persist */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Tracks which syllabus lessons of a course the student has marked as watched. */
export function useLessonProgress(courseCode: string) {
  const [watched, setWatched] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setWatched(readStore()[courseCode] ?? []);
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [courseCode]);

  const toggle = useCallback(
    (lessonId: string) => {
      const store = readStore();
      const current = new Set(store[courseCode] ?? []);
      if (current.has(lessonId)) current.delete(lessonId);
      else current.add(lessonId);
      store[courseCode] = Array.from(current);
      writeStore(store);
    },
    [courseCode],
  );

  const markWatched = useCallback(
    (lessonId: string) => {
      const store = readStore();
      const current = new Set(store[courseCode] ?? []);
      if (current.has(lessonId)) return;
      current.add(lessonId);
      store[courseCode] = Array.from(current);
      writeStore(store);
    },
    [courseCode],
  );

  const isWatched = useCallback((lessonId: string) => watched.includes(lessonId), [watched]);

  return { watched, count: watched.length, isWatched, toggle, markWatched };
}
