# Working links, dual syllabus, and enrolment-based auto-fetch

Three things: every link/button on the site actually does something, the course
database covers both the old BCA and the revised online BCA (BCA_NEWOL), and after
login a student's enrolment number pulls their grade card + registered courses and
saves them.

## 1. Link and button audit

Go through header, footer, homepage, and every page section and make sure each
link points to a real route or a real external page:

- Internal links: confirm each `to=` matches an existing route file. Any label
  without a page (e.g. resource/PDF library style links in the footer) either gets
  wired to the closest real page or is removed instead of sitting dead.
- External IGNOU portal links (eGyanKosh, Samarth, assignment upload, grade card,
  re-registration, exam form) get `target="_blank"` + `rel="noopener noreferrer"`
  everywhere they appear, and the same portal list is reused on the auth page,
  footer, and dashboard so nothing drifts.
- Download buttons on papers/assignments pages: keep current fetch behaviour, but
  never leave a button with no click handler.

## 2. Subjects: both syllabuses

The course database becomes programme-aware:

- Full revised online BCA (BCA_NEWOL) course list, semester 1-6, with course code,
  title, credits, and key topics.
- Existing old-BCA list stays as a second programme.
- A programme switch ("BCA (old)" / "BCA_NEWOL") on the Courses, Papers,
  Assignments, and Analysis pages filters the subject lists. Semester tabs and
  subject search keep working inside the selected programme.
- A student's saved programme (from their profile) becomes their default selection.

## 3. Enrolment number -> auto-fetch grade card + registered courses

New flow on the dashboard:

1. Student enters enrolment number once (saved to their profile along with
   programme code, default `BCA_NEWOL`).
2. "Fetch my records" pulls the public IGNOU grade card for that
   enrolment + programme, parses the result table, and saves each row: course code,
   assignment marks, theory/practical marks, status.
3. The saved rows drive: a marks table, subjects auto-marked as registered/completed,
   and the study-plan/progress views pre-filled with the student's actual courses
   instead of a manual list.
4. Results are cached in the database, shown with a "last fetched" time, and can be
   refreshed manually. If IGNOU's page is down or the enrolment number has no data,
   a clear message appears and previously saved rows stay visible.

Note: IGNOU's grade card is a public page and its layout changes occasionally. The
parser will be defensive, and when a fetch cannot be parsed the app says so rather
than showing wrong marks. Only the marks IGNOU publishes for that enrolment number
are stored, and only that student can read their own rows.

## Technical details

- Data: `src/lib/data.ts` gains a `programme: "BCA" | "BCA_NEWOL"` field on subjects,
  plus the full BCA_NEWOL course list and programme-aware helpers
  (`subjectsBySemester(sem, programme)`), keeping existing exports working.
- Migration: new `grade_card_records` table (`user_id`, `programme`, `course_code`,
  `assignment_marks`, `theory_marks`, `practical_marks`, `total`, `status`,
  `fetched_at`) with GRANTs to `authenticated`/`service_role`, RLS scoped to
  `auth.uid() = user_id`, and a unique key on `(user_id, programme, course_code)`.
  `profiles` gains `programme_code`.
- Server: `src/lib/gradecard.server.ts` fetches
  `gradecard.ignou.ac.in` for the given enrolment + programme, with the existing
  Firecrawl connector as fallback when the raw fetch is blocked, and parses rows
  with tolerant HTML/text parsing. `src/lib/gradecard.functions.ts` exposes
  `fetchMyGradeCard` and `getMyGradeCard` via `createServerFn` +
  `requireSupabaseAuth`, validating the enrolment number with Zod and upserting
  rows as the signed-in user.
- Dashboard: enrolment/programme fields in the profile card, a Grade Card section
  (fetch button, marks table, last-fetched stamp, error state), and registered
  courses derived from saved rows feeding progress + plan pickers. Query is
  invalidated after a successful fetch.
- Links: audit `Header.tsx`, `Footer.tsx`, `index.tsx`, and page CTAs; centralise
  external portals through `src/lib/portals.ts`.
