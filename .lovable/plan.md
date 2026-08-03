# Assignments Download + Student Login + IGNOU Portal Links

## 1. Assignment PDFs — same auto-fetch as question papers

Assignments page abhi 5 hardcoded cards dikhata hai aur dono Download buttons kuch nahi karte. Papers wala working system yahan bhi lagayenge:

- Naya cache table `assignments_files` (course code, session, type: question/solved, PDF link, status, last checked).
- Server-side resolver jo IGNOU ke official assignment URL patterns probe karega (ignou.ac.in assignment section + webservices path), na mile to Firecrawl search fallback — bilkul papers.server.ts jaisa.
- Do server functions: ek single assignment ke liye, ek poore semester ke liye.
- Har assignment card ke "Question PDF" aur "Solved Guide" button ab loading spinner + toast ke saath asli PDF naye tab me kholenge; na milne par saaf message.

## 2. Semester-wise subjects + search on Assignments

- Sem 1–6 pills (papers page jaisa) + search box (subject name ya course code).
- Assignment list poore BCA syllabus ke subjects se generate hogi (sirf 5 nahi), current session ke saath — har semester ke sabhi subjects ka assignment card.

## 3. Student login (account + records)

- Email/password + Google sign-in (Google provider usi turn me configure hoga).
- `/auth` page: sign in / sign up, password reset ke saath `/reset-password` page.
- Header me session-aware button: signed out → "Student Login", signed in → account menu (Dashboard, Sign out).
- Tables (sab RLS ke saath, sirf apna data dikhega):
  - `profiles` — name, enrolment number, current semester, study centre (signup par auto ban jayega).
  - `study_progress` — subject-wise progress + weak topics (dashboard ka localStorage data yahan migrate).
  - `study_plan` — user ka banaya plan: subject, target date, daily target, status.
  - `download_history` — kaun paper/assignment kholi, saved/bookmark flag.
  - `assignment_submissions` — kaun assignment submit kiya, date, marks/status.
- Dashboard `/dashboard` protected area me jayega: profile ke semester se pages auto-filter, progress rings, plan builder, downloads history, submission tracker. Signed-out user ko login CTA dikhega.

## 4. IGNOU official portals section

Header dropdown + dashboard/footer me quick links card:
- eGyanKosh (study material)
- IGNOU Samarth student portal
- Online assignment submission portal
- Grade card / result, Re-registration, Exam form
Sabhi external links `target="_blank"` + `rel="noopener"`.

## Technical notes

- Auth: Lovable Cloud auth; protected routes `src/routes/_authenticated/` ke andar, dashboard wahan move hoga; public landing/papers/courses SSR public rahenge.
- Roles/admin panel is scope me nahi (baad me ho sakta hai).
- Assignment resolver ke liye wahi Firecrawl connector use hoga jo papers ke liye already connected hai.
- Har naye table par GRANT + RLS policies `auth.uid()` se scoped.
- Nayi routes (`/auth`, `/reset-password`, `/lms` links) par apna SEO head metadata.
