import { useState } from "react";
import { CheckCircle2, ChevronDown, Circle, ListOrdered } from "lucide-react";
import { StudyVideos } from "@/components/StudyVideos";
import { lessonVideoQuery, lessonsByBlock, lessonsForCourse } from "@/lib/syllabus";
import { useLessonProgress } from "@/hooks/useLessonProgress";

export function SubjectLessons({
  courseCode,
  subjectTitle,
}: {
  courseCode: string;
  subjectTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const blocks = lessonsByBlock(courseCode);
  const lessons = lessonsForCourse(courseCode);
  const total = lessons.length;
  const { isWatched, toggle, markWatched, count } = useLessonProgress(courseCode);

  if (!total) return null;

  const done = Math.min(count, total);
  const percent = Math.round((done / total) * 100);

  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-primary" />
          Syllabus lessons &amp; video lectures
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {total}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div className="px-3 pb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {done}/{total} lessons watched
          </span>
          <span className="font-semibold text-primary">{percent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {open && (
        <div className="space-y-5 border-t border-border px-3 py-3">
          {blocks.map((group) => (
            <div key={group.block}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.block}
              </p>
              <div className="mt-2 space-y-2">
                {group.lessons.map((lesson) => {
                  const lessonId = `${lesson.unit}-${lesson.title}`;
                  const watched = isWatched(lessonId);
                  return (
                    <div
                      key={`${group.block}-${lesson.unit}`}
                      className={`rounded-lg border p-3 ${
                        watched ? "border-primary/40 bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium">
                          <span className="mr-2 font-mono text-xs text-primary">
                            Unit {lesson.unit}
                          </span>
                          {lesson.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggle(lessonId)}
                          aria-pressed={watched}
                          className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                            watched
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {watched ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Circle className="h-3.5 w-3.5" />
                          )}
                          {watched ? "Watched" : "Mark watched"}
                        </button>
                      </div>
                      <StudyVideos
                        query={lessonVideoQuery(courseCode, subjectTitle, lesson)}
                        label="Watch lecture videos"
                        chapterLabel={`${courseCode} · Unit ${lesson.unit} — ${lesson.title}`}
                        onPlay={() => markWatched(lessonId)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
