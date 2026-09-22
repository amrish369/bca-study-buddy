// Server-only helper that reads a student's official IGNOU
// "Assignment/Project/Practical Awards/Marks Transmission Status" page.
//
// The portal (isms.ignou.ac.in) is a classic ASP page with a simple POST:
//   EnrNo=<enrolment>&program=<programme code>&Submit=Submit
// A successful lookup renders an HTML table of course-wise rows; a miss
// renders a plain "... Status Not found." sentence.

const STATUS_URL = "https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36";

export interface AssignmentStatusRow {
  courseCode: string;
  session: string | null;
  status: string | null;
  marks: string | null;
  remarks: string | null;
}

export interface AssignmentStatusResult {
  status: "found" | "not_found" | "unavailable";
  message: string;
  rows: AssignmentStatusRow[];
}

function decode(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const COURSE_RE = /^[A-Z]{2,6}-?[A-Z]?\d{2,3}[A-Z]?$/;
const SESSION_RE = /^(0?[1-9]|1[0-2])[-/ ]?(19|20)?\d{2}$|^(January|February|March|April|May|June|July|August|September|October|November|December)[ -]?\d{2,4}$/i;

/** Pull course-wise assignment status rows out of the result HTML. */
export function parseAssignmentStatus(html: string): AssignmentStatusRow[] {
  const rows: AssignmentStatusRow[] = [];
  const seen = new Set<string>();
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let tr: RegExpExecArray | null;
  while ((tr = trRe.exec(html))) {
    const cells = [...tr[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) =>
      decode(c[1]),
    );
    if (cells.length < 2) continue;
    const codeIndex = cells.findIndex((c) => COURSE_RE.test(c.toUpperCase()));
    if (codeIndex === -1) continue;

    const courseCode = cells[codeIndex].toUpperCase();
    const rest = cells.slice(codeIndex + 1).filter(Boolean);
    const session = rest.find((c) => SESSION_RE.test(c)) ?? null;
    const marks = rest.find((c) => /^\d{1,3}(\.\d+)?$/.test(c) && c !== session) ?? null;
    const status =
      rest.find((c) =>
        /received|submitted|evaluat|transmit|pending|not received|complete|award/i.test(c),
      ) ?? null;
    const remarks = rest.filter((c) => c !== session && c !== marks && c !== status).join(" · ") || null;

    const key = `${courseCode}::${session ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ courseCode, session, status, marks, remarks });
  }
  return rows;
}

/**
 * Fetch the official assignment / project / practical marks-transmission
 * status for an enrolment number + programme code.
 */
export async function fetchAssignmentStatus(
  enrolmentNo: string,
  programmeCode: string,
): Promise<AssignmentStatusResult> {
  try {
    const response = await fetch(STATUS_URL, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: STATUS_URL,
        Origin: "https://isms.ignou.ac.in",
      },
      body: new URLSearchParams({
        EnrNo: enrolmentNo,
        program: programmeCode,
        Submit: "Submit",
      }).toString(),
      redirect: "follow",
    });

    if (!response.ok) {
      return {
        status: "unavailable",
        message: "IGNOU assignment status portal is not responding right now.",
        rows: [],
      };
    }

    const html = await response.text();
    const rows = parseAssignmentStatus(html);

    if (rows.length === 0) {
      const notFound = /Status\s*Not\s*found/i.test(html);
      return {
        status: notFound ? "not_found" : "unavailable",
        message: notFound
          ? "IGNOU has not transmitted any assignment / project marks for this enrolment number yet. Check with your Study Centre if you have already submitted."
          : "Could not read the assignment status page. Please try again in a moment.",
        rows: [],
      };
    }

    return {
      status: "found",
      message: `Found ${rows.length} assignment records.`,
      rows,
    };
  } catch {
    return {
      status: "unavailable",
      message: "Could not reach the IGNOU assignment status portal. Please try again shortly.",
      rows: [],
    };
  }
}
