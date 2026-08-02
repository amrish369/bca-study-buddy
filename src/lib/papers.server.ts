// Server-only helpers that resolve real IGNOU BCA question paper PDF links
// from the public IGNOU websites, with a database cache.

export type PaperSession = "June" | "December";

export interface ResolvedPaper {
  courseCode: string;
  year: number;
  session: PaperSession;
  pdfUrl: string | null;
  sourceUrl: string | null;
  status: "found" | "not_found";
}

const CACHE_TTL_DAYS_FOUND = 60;
const CACHE_TTL_DAYS_MISSING = 3;

function buildCandidateUrls(courseCode: string, year: number, session: PaperSession): string[] {
  const code = courseCode.toUpperCase().trim();
  const shortSession = session === "June" ? "june" : "dec";
  const encode = (s: string) => encodeURI(s);

  return [
    // https://www.ignou.ac.in/viewFile/ldd/qpdec2025/BCS-012.pdf
    `https://www.ignou.ac.in/viewFile/ldd/qp${shortSession}${year}/${code}.pdf`,
    // https://webservices.ignou.ac.in/pre-question/Question Paper june 2024/SOCIS/BCA/BCS-012.pdf
    encode(
      `https://webservices.ignou.ac.in/pre-question/Question Paper ${session === "June" ? "june" : "December"} ${year}/SOCIS/BCA/${code}.pdf`,
    ),
    encode(
      `https://webservices.ignou.ac.in/pre-question/Question Paper ${session} ${year}/SOCIS/BCA/${code}.pdf`,
    ),
  ];
}

async function isPdfReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-1023", "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });
    if (!res.ok && res.status !== 206) return false;
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("pdf")) return true;
    // Some hosts omit the content type; fall back to the PDF magic bytes.
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
  } catch {
    return false;
  }
}

/** Firecrawl web search fallback, routed through the Lovable connector gateway. */
async function firecrawlFindPdf(
  courseCode: string,
  year: number,
  session: PaperSession,
): Promise<string | null> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["FIRECRAWL_API_KEY"];
  if (!lovableKey || !connectionKey) return null;

  try {
    const res = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
      },
      body: JSON.stringify({
        query: `IGNOU ${courseCode} ${session} ${year} question paper pdf site:ignou.ac.in`,
        limit: 8,
      }),
    });

    if (!res.ok) {
      console.error(`Firecrawl search failed [${res.status}]: ${await res.text()}`);
      return null;
    }

    const json = (await res.json()) as {
      data?: { web?: Array<{ url?: string }> };
    };
    const results = json.data?.web ?? [];
    const code = courseCode.toLowerCase();
    const yearStr = String(year);
    const sessionHints = session === "June" ? ["june"] : ["dec"];

    const match = results.find((r) => {
      const url = (r.url ?? "").toLowerCase();
      if (!url.endsWith(".pdf") || !url.includes(code)) return false;
      if (!url.includes(yearStr)) return false;
      return sessionHints.some((h) => url.includes(h));
    });

    return match?.url ?? null;
  } catch (error) {
    console.error("Firecrawl search error", error);
    return null;
  }
}

function isFresh(fetchedAt: string, status: string): boolean {
  const days = status === "found" ? CACHE_TTL_DAYS_FOUND : CACHE_TTL_DAYS_MISSING;
  return Date.now() - new Date(fetchedAt).getTime() < days * 24 * 60 * 60 * 1000;
}

export async function resolvePaper(
  courseCode: string,
  year: number,
  session: PaperSession,
): Promise<ResolvedPaper> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: cached } = await supabaseAdmin
    .from("question_papers")
    .select("pdf_url, source_url, status, fetched_at")
    .eq("course_code", courseCode)
    .eq("year", year)
    .eq("session", session)
    .maybeSingle();

  if (cached && isFresh(cached.fetched_at, cached.status)) {
    return {
      courseCode,
      year,
      session,
      pdfUrl: cached.pdf_url,
      sourceUrl: cached.source_url,
      status: cached.status as "found" | "not_found",
    };
  }

  let pdfUrl: string | null = null;
  for (const candidate of buildCandidateUrls(courseCode, year, session)) {
    if (await isPdfReachable(candidate)) {
      pdfUrl = candidate;
      break;
    }
  }

  if (!pdfUrl) {
    const searched = await firecrawlFindPdf(courseCode, year, session);
    if (searched && (await isPdfReachable(searched))) pdfUrl = searched;
  }

  const resolved: ResolvedPaper = {
    courseCode,
    year,
    session,
    pdfUrl,
    sourceUrl: pdfUrl,
    status: pdfUrl ? "found" : "not_found",
  };

  await supabaseAdmin.from("question_papers").upsert(
    {
      course_code: courseCode,
      year,
      session,
      pdf_url: resolved.pdfUrl,
      source_url: resolved.sourceUrl,
      status: resolved.status,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "course_code,year,session" },
  );

  return resolved;
}

/** Cache-only read for a whole course (fast, no network). */
export async function readCachedPapers(courseCode: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("question_papers")
    .select("course_code, year, session, pdf_url, status")
    .eq("course_code", courseCode);
  return data ?? [];
}
