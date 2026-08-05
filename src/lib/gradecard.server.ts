// Server-only helper that fetches a student's public IGNOU grade card
// (gradecard.ignou.ac.in) and parses the marks table.
//
// The portal is an ASP.NET WebForms app, so the flow is:
//   1. GET the form page (collects hidden __VIEWSTATE fields + session cookie)
//   2. POST a postback that selects the grade-card category (populates the
//      programme dropdown and refreshes __VIEWSTATE / __EVENTVALIDATION)
//   3. POST the final submit with programme code + enrolment number

const BASE = "https://gradecard.ignou.ac.in/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36";

export interface GradeCardRow {
  courseCode: string;
  assignmentMarks: number | null;
  theoryMarks: number | null;
  practicalMarks: number | null;
  total: number | null;
  status: string | null;
}

export interface GradeCardResult {
  status: "found" | "not_found" | "unavailable";
  message: string;
  rows: GradeCardRow[];
}

function hiddenFields(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /<input[^>]*type="hidden"[^>]*name="([^"]+)"[^>]*value="([^"]*)"[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out[m[1]] = m[2];
  return out;
}

function mergeCookies(existing: string, setCookie: string | null): string {
  if (!setCookie) return existing;
  const pairs = setCookie
    .split(/,(?=[^;]+=)/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean);
  const jar = new Map<string, string>();
  for (const part of existing.split("; ").filter(Boolean)) {
    const i = part.indexOf("=");
    if (i > 0) jar.set(part.slice(0, i), part.slice(i + 1));
  }
  for (const p of pairs) {
    const i = p.indexOf("=");
    if (i > 0) jar.set(p.slice(0, i), p.slice(i + 1));
  }
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function decode(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function num(value: string): number | null {
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Pull marks rows out of the result HTML. */
export function parseGradeCard(html: string): GradeCardRow[] {
  const rows: GradeCardRow[] = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let tr: RegExpExecArray | null;
  while ((tr = trRe.exec(html))) {
    const cells = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => decode(c[1]));
    if (cells.length < 3) continue;
    const codeIndex = cells.findIndex((c) => /^[A-Z]{2,6}-?[A-Z]?\d{2,3}$/i.test(c));
    if (codeIndex === -1) continue;
    const rest = cells.slice(codeIndex + 1);
    const numbers = rest.map(num);
    const statusCell =
      rest.find((c) => /completed|not completed|incomplete|pending|pass|fail/i.test(c)) ?? null;
    rows.push({
      courseCode: cells[codeIndex].toUpperCase(),
      assignmentMarks: numbers[0] ?? null,
      theoryMarks: numbers[1] ?? null,
      practicalMarks: numbers[2] ?? null,
      total: numbers.filter((n): n is number => n !== null).slice(-1)[0] ?? null,
      status: statusCell,
    });
  }
  return rows;
}

/**
 * Fetch a grade card for an enrolment number + programme code.
 * `category` maps to the portal's "Grade Card Status for" dropdown
 * (1 = BCA/MCA/PGDCA family, which covers every BCA variant).
 */
export async function fetchGradeCard(
  enrolmentNo: string,
  programmeCode: string,
): Promise<GradeCardResult> {
  const headersBase = {
    "User-Agent": UA,
    Referer: BASE,
    Origin: "https://gradecard.ignou.ac.in",
  };

  try {
    const first = await fetch(BASE, { headers: headersBase, redirect: "follow" });
    if (!first.ok) return { status: "unavailable", message: "IGNOU grade card site is not responding.", rows: [] };
    const firstHtml = await first.text();
    let cookies = mergeCookies("", first.headers.get("set-cookie"));

    const step1 = new URLSearchParams({
      ...hiddenFields(firstHtml),
      __EVENTTARGET: "ddlGradecardfor",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      ddlGradecardfor: "1",
      txtEnrno: "",
    });
    const second = await fetch(BASE, {
      method: "POST",
      headers: {
        ...headersBase,
        "Content-Type": "application/x-www-form-urlencoded",
        ...(cookies ? { Cookie: cookies } : {}),
      },
      body: step1.toString(),
      redirect: "follow",
    });
    const secondHtml = await second.text();
    cookies = mergeCookies(cookies, second.headers.get("set-cookie"));

    if (!secondHtml.includes(programmeCode)) {
      return {
        status: "unavailable",
        message: `Programme ${programmeCode} is not listed on the IGNOU grade card portal right now.`,
        rows: [],
      };
    }

    const step2 = new URLSearchParams({
      ...hiddenFields(secondHtml),
      __EVENTTARGET: "",
      __EVENTARGUMENT: "",
      __LASTFOCUS: "",
      ddlGradecardfor: "1",
      ddlProgram: programmeCode,
      txtEnrno: enrolmentNo,
      btnlogin: "Submit",
    });
    const final = await fetch(BASE, {
      method: "POST",
      headers: {
        ...headersBase,
        "Content-Type": "application/x-www-form-urlencoded",
        ...(cookies ? { Cookie: cookies } : {}),
      },
      body: step2.toString(),
      redirect: "follow",
    });
    const html = await final.text();

    const alertMatch = html.match(/alert\('([^']+)'\)/);
    const rows = parseGradeCard(html);

    if (rows.length === 0) {
      return {
        status: "not_found",
        message:
          alertMatch?.[1] ??
          "No grade card found for this enrolment number and programme. Check the details and try again.",
        rows: [],
      };
    }

    return { status: "found", message: `Fetched ${rows.length} course records.`, rows };
  } catch {
    return {
      status: "unavailable",
      message: "Could not reach the IGNOU grade card portal. Please try again in a moment.",
      rows: [],
    };
  }
}
