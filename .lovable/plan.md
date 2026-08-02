## Problem

Abhi `/papers` page ka data `src/lib/data.ts` me hardcoded hai aur "PDF" button ka koi `onClick` nahi hai (`src/routes/papers.tsx`, line 104-106) — na koi file, na koi link. Isliye download kuch nahi karta.

## Approach

Papers internet se live fetch karenge (eGyanKosh / IGNOU public sources) Firecrawl ke through, aur result cache karke Download button ko asli PDF link par point karenge.

### 1. Connectors + Cloud
- Firecrawl connector connect karna (web search + scrape ke liye).
- Lovable Cloud enable karna — fetched paper links cache karne ke liye, taki har click par scraping na ho (fast + credit-saving).

### 2. Database
Table `question_papers`:
- `course_code`, `year`, `session` (June/December), `title`, `pdf_url`, `source_url`, `has_solution`, `fetched_at`
- Unique constraint (course_code, year, session)
- Public `SELECT` policy `anon` + `authenticated` ke liye; writes sirf server-side (service role)

### 3. Server function: paper resolve/fetch
`src/lib/papers.functions.ts`
- `searchPapers({ courseCode })` — pehle DB cache check kare; miss hone par Firecrawl `search` chalaye query jaise `IGNOU BCS-011 previous year question paper pdf site:egyankosh.ac.in` + eGyanKosh listing scrape karke `.pdf` links nikale, phir results DB me cache kare aur return kare.
- `getPaperUrl({ courseCode, year, session })` — ek specific paper ka direct PDF URL return kare (cache-first, warna on-demand fetch).
- Firecrawl calls sirf server par; API key `process.env` me handler ke andar padhi jayegi. Gateway ya direct mode connect ke baad flag dekh kar decide hoga.

### 4. Frontend `/papers`
- Subject card expand hone par us course ke papers server se load honge (TanStack Query).
- Download button:
  - PDF URL mila → naye tab me kholega / download karega
  - abhi resolve ho raha hai → spinner "Fetching…"
  - nahi mila → **toast**: "Ye paper abhi online nahi mila — hum dhoondh rahe hain" (aapka chuna hua behaviour)
- Sonner `<Toaster />` root route me mount karna (modern stack me by default nahi hota).

### 5. Reality check
IGNOU khud har purane paper ka PDF public host nahi karta; eGyanKosh par bahut milte hain par 100% coverage guarantee nahi. Jahan link na mile, wahan toast + "request paper" ka option rahega, aur baad me admin upload option add kar sakte hain.

## Technical notes
- Firecrawl `search` + `scrape` (formats: `links`) — server-side only, cached in DB to limit credits.
- PDF stream nahi karenge, direct source URL par bhejenge (fast, storage-free); zarurat pade to baad me Cloud Storage me mirror kar sakte hain.
- Mock `papers` array ko DB-backed query se replace karenge; `subjects` metadata local hi rahega.
