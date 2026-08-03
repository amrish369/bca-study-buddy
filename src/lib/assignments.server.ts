// Server-only helpers that resolve real IGNOU BCA assignment PDF links,
// with a database cache (same approach as papers.server.ts).

export type AssignmentKind = "question" | "solved";

export interface ResolvedAssignment {
  courseCode: string;
  session: string;
  kind: AssignmentKind;
  pdfUrl: string | null;
  status: "found" | "not_found";
}

const CACHE_TTL_DAYS_FOUND = 30;
const CACHE_TTL_DAYS_MISSING = 2;

/** "2025-26" -> "25-26" */
function shortSession(session: string): string {
  const [a, b] = session.split("-");
  const first = (a ?? "").slice(-2);
  const second = (b ?? "").slice(-2);
  return `${first}-${second}`;
}

function buildCandidateUrls(courseCode: string, session: string): string[] {
  const code = courseCode.toUpperCase().trim();
  const short = shortSession(session);
  return [
    `https://www.ignou.ac.in/viewFile/SOCIS/assignments/${code}-${short}.pdf`,
    `https://www.ignou.ac.in/viewFile/SOCIS/assignments/${code}-BCAOL-${session}.pdf`,
    `https://webservices.ignou.ac.in/assignments/Bachelor-Degree/BCA/${session}/${code}.pdf`,
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
    const buf = new Uint8Array(await res.arrayBuffer());
    return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
  } catch {
    return false;
  }
}

/** Firecrawl web search fallback, routed through the Lovable connector gateway. */
async function firecrawlFindPdf(
  courseCode: string,
  session: string,
  kind: AssignmentKind,
): Promise<string | null> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["FIRECRAWL_API_KEY"];
  if (!lovableKey || !connectionKey) return null;

  const query =
    kind === "solved"
      ? `IGNOU ${courseCode} solved assignment ${session} pdf`
      : `IGNOU ${courseCode} assignment ${session} question pdf site:ignou.ac.in`;

  try {
    const res = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
      },
      body: JSON.stringify({ query, limit: 8 }),
    });

    if (!res.ok) {
      console.error(`Firecrawl assignment search failed [${res.status}]: ${await res.text()}`);
      return null;
    }

    const json = (await res.json()) as { data?: { web?: Array<{ url?: string }> } };
    const results = json.data?.web ?? [];
    const code = courseCode.toLowerCase();
    const match = results.find((r) => {
      const url = (r.url ?? "").toLowerCase();
      return url.endsWith(".pdf") && url.includes(code);
    });
    return match?.url ?? null;
  } catch (error) {
    console.error("Firecrawl assignment search error", error);
    return null;
  }
}

function isFresh(fetchedAt: string, status: string): boolean {
  const days = status === "found" ? CACHE_TTL_DAYS_FOUND : CACHE_TTL_DAYS_MISSING;
  return Date.now() - new Date(fetchedAt).getTime() < days * 24 * 60 * 60 * 1000;
}

export async function resolveAssignment(
  courseCode: string,
  session: string,
  kind: AssignmentKind,
): Promise<ResolvedAssignment> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: cached } = await supabaseAdmin
    .from("assignment_files")
    .select("pdf_url, status, fetched_at")
    .eq("course_code", courseCode)
    .eq("session", session)
    .eq("kind", kind)
    .maybeSingle();

  if (cached && isFresh(cached.fetched_at, cached.status)) {
    return {
      courseCode,
      session,
      kind,
      pdfUrl: cached.pdf_url,
      status: cached.status as "found" | "not_found",
    };
  }

  let pdfUrl: string | null = null;

  if (kind === "question") {
    for (const candidate of buildCandidateUrls(courseCode, session)) {
      if (await isPdfReachable(candidate)) {
        pdfUrl = candidate;
        break;
      }
    }
  }

  if (!pdfUrl) {
    const searched = await firecrawlFindPdf(courseCode, session, kind);
    if (searched && (await isPdfReachable(searched))) pdfUrl = searched;
  }

  const resolved: ResolvedAssignment = {
    courseCode,
    session,
    kind,
    pdfUrl,
    status: pdfUrl ? "found" : "not_found",
  };

  await supabaseAdmin.from("assignment_files").upsert(
    {
      course_code: courseCode,
      session,
      kind,
      pdf_url: resolved.pdfUrl,
      source_url: resolved.pdfUrl,
      status: resolved.status,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "course_code,session,kind" },
  );

  return resolved;
}
