import { useState } from "react";
import { ChevronDown, ListOrdered } from "lucide-react";
import { StudyVideos } from "@/components/StudyVideos";
import { lessonVideoQuery, lessonsByBlock, lessonsForCourse } from "@/lib/syllabus";

export function SubjectLessons({
  courseCode,
  subjectTitle,
}: {
  courseCode: string;
  subjectTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const blocks = lessonsByBlock(courseCode);
  const total = lessonsForCourse(courseCode).length;

  if (!total) return null;

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

      {open && (
        <div className="space-y-5 border-t border-border px-3 py-3">
          {blocks.map((group) => (
            <div key={group.block}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.block}
              </p>
              <div className="mt-2 space-y-2">
                {group.lessons.map((lesson) => (
                  <div
                    key={`${group.block}-${lesson.unit}`}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <p className="text-sm font-medium">
                      <span className="mr-2 font-mono text-xs text-primary">
                        Unit {lesson.unit}
                      </span>
                      {lesson.title}
                    </p>
                    <StudyVideos
                      query={lessonVideoQuery(courseCode, subjectTitle, lesson)}
                      label="Watch lecture videos"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
