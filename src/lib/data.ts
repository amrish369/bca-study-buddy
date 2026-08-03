// Central mock data for IGNOU BCA Master Hub.
// Once Lovable Cloud is enabled, these arrays are replaced by live DB queries.

export type Session = "June" | "December";

export interface Subject {
  courseCode: string;
  title: string;
  semester: number;
  credits: number;
  units: number;
  importantTopics: string[];
}

export interface Paper {
  courseCode: string;
  year: number;
  session: Session;
  hasSolution: boolean;
}

export interface Assignment {
  courseCode: string;
  title: string;
  semester: number;
  session: string;
  deadline: string; // ISO date
  solved: boolean;
}

export interface UpdateItem {
  id: string;
  title: string;
  category: "Exam" | "Result" | "Assignment" | "Registration" | "Hall Ticket";
  date: string; // ISO date
  summary: string;
}

export interface RepeatTrend {
  topic: string;
  subject: string;
  years: number[];
  importance: "HIGH" | "MEDIUM" | "LOW";
  probability: number; // 0-100
}

export const subjects: Subject[] = [
  { courseCode: "BCS-011", title: "Computer Basics & PC Software", semester: 1, credits: 4, units: 16, importantTopics: ["Number systems", "MS Office", "Operating systems"] },
  { courseCode: "BCS-012", title: "Basic Mathematics", semester: 1, credits: 4, units: 12, importantTopics: ["Matrices", "Determinants", "Differentiation"] },
  { courseCode: "ECO-01", title: "Business Organisation", semester: 1, credits: 4, units: 14, importantTopics: ["Forms of business", "Stock exchange"] },
  { courseCode: "FEG-02", title: "Foundation Course in English", semester: 1, credits: 4, units: 10, importantTopics: ["Comprehension", "Grammar", "Essay writing"] },

  { courseCode: "BCS-031", title: "Programming in C++", semester: 2, credits: 4, units: 18, importantTopics: ["OOP concepts", "Inheritance", "Polymorphism", "Templates"] },
  { courseCode: "BCS-040", title: "Statistical Techniques", semester: 2, credits: 4, units: 14, importantTopics: ["Probability", "Hypothesis testing", "Correlation"] },
  { courseCode: "MCS-011", title: "Problem Solving and Programming", semester: 2, credits: 3, units: 12, importantTopics: ["Pointers", "Arrays", "File handling"] },
  { courseCode: "MCS-012", title: "Computer Organisation & Assembly", semester: 2, credits: 4, units: 20, importantTopics: ["Number systems", "ALU", "Memory organisation"] },

  { courseCode: "MCS-013", title: "Discrete Mathematics", semester: 3, credits: 2, units: 10, importantTopics: ["Sets", "Graph theory", "Boolean algebra"] },
  { courseCode: "MCS-014", title: "Systems Analysis and Design", semester: 3, credits: 3, units: 14, importantTopics: ["SDLC", "DFD", "ER diagrams"] },
  { courseCode: "MCS-015", title: "Communication Skills", semester: 3, credits: 2, units: 8, importantTopics: ["Listening", "Presentation skills"] },
  { courseCode: "BCS-053", title: "Web Programming", semester: 3, credits: 4, units: 16, importantTopics: ["HTML/CSS", "JavaScript", "DHTML"] },

  { courseCode: "MCS-021", title: "Data and File Structures", semester: 4, credits: 4, units: 18, importantTopics: ["Trees", "Sorting", "Hashing", "Graphs"] },
  { courseCode: "MCS-023", title: "Database Management Systems", semester: 4, credits: 3, units: 16, importantTopics: ["Normalization", "SQL", "ER model", "Transactions"] },
  { courseCode: "BCS-040", title: "Statistical Techniques", semester: 4, credits: 4, units: 14, importantTopics: ["Regression", "Sampling"] },
  { courseCode: "BCSL-045", title: "Web Programming Lab", semester: 4, credits: 2, units: 6, importantTopics: ["Practical web apps"] },

  { courseCode: "MCS-024", title: "Object Oriented Tech & Java", semester: 5, credits: 4, units: 18, importantTopics: ["JVM", "Collections", "Exception handling", "Threads"] },
  { courseCode: "BCS-051", title: "Introduction to Software Engineering", semester: 5, credits: 4, units: 16, importantTopics: ["Process models", "Testing", "Project management"] },
  { courseCode: "BCS-052", title: "Network Programming & Administration", semester: 5, credits: 4, units: 16, importantTopics: ["TCP/IP", "Sockets", "Routing"] },
  { courseCode: "BCS-054", title: "Computer Oriented Numerical Techniques", semester: 5, credits: 4, units: 12, importantTopics: ["Interpolation", "Numerical integration"] },

  { courseCode: "MCS-022", title: "Operating System Concepts & Networking", semester: 6, credits: 4, units: 20, importantTopics: ["Scheduling", "Deadlocks", "Memory management"] },
  { courseCode: "BCS-062", title: "E-Commerce", semester: 6, credits: 4, units: 14, importantTopics: ["EDI", "Payment systems", "Security"] },
  { courseCode: "BCSP-064", title: "Project", semester: 6, credits: 8, units: 0, importantTopics: ["Synopsis", "Implementation", "Report"] },
];

const yearsRange = [2025, 2024, 2023, 2022, 2021];
export const papers: Paper[] = subjects.flatMap((s) =>
  yearsRange.flatMap((year) =>
    (["June", "December"] as Session[]).map((session) => ({
      courseCode: s.courseCode,
      year,
      session,
      hasSolution: (year + (session === "June" ? 0 : 1)) % 2 === 0,
    })),
  ),
);

export const assignments: Assignment[] = [
  { courseCode: "BCS-011", title: "Computer Basics Assignment", semester: 1, session: "2025-26", deadline: "2026-07-31", solved: true },
  { courseCode: "BCS-031", title: "Programming in C++ Assignment", semester: 2, session: "2025-26", deadline: "2026-07-31", solved: true },
  { courseCode: "MCS-023", title: "DBMS Assignment", semester: 4, session: "2025-26", deadline: "2026-08-15", solved: true },
  { courseCode: "MCS-024", title: "Java Assignment", semester: 5, session: "2025-26", deadline: "2026-08-15", solved: false },
  { courseCode: "MCS-022", title: "OS & Networking Assignment", semester: 6, session: "2025-26", deadline: "2026-08-31", solved: false },
];

export const updates: UpdateItem[] = [
  { id: "u1", title: "June 2026 TEE Exam Form Open", category: "Exam", date: "2026-06-10", summary: "Submit your Term End Exam form before the last date without late fee." },
  { id: "u2", title: "Hall Ticket June 2026 Released", category: "Hall Ticket", date: "2026-06-14", summary: "Download your June 2026 hall ticket from the IGNOU portal." },
  { id: "u3", title: "December 2025 Result Declared", category: "Result", date: "2026-06-02", summary: "Check your December 2025 TEE results and grade card online." },
  { id: "u4", title: "Assignment Submission Extended", category: "Assignment", date: "2026-05-28", summary: "Last date for 2025-26 assignment submission extended to 31 Aug 2026." },
  { id: "u5", title: "Re-registration July 2026 Cycle", category: "Registration", date: "2026-05-20", summary: "Re-register for the next semester to continue your BCA programme." },
];

export const repeatTrends: RepeatTrend[] = [
  { topic: "Normalization", subject: "MCS-023 DBMS", years: [2025, 2024, 2022, 2020, 2019], importance: "HIGH", probability: 92 },
  { topic: "Inheritance & Polymorphism", subject: "BCS-031 C++", years: [2025, 2024, 2023, 2021], importance: "HIGH", probability: 88 },
  { topic: "Process Scheduling", subject: "MCS-022 OS", years: [2024, 2023, 2022, 2020], importance: "HIGH", probability: 85 },
  { topic: "Trees & Traversal", subject: "MCS-021 DFS", years: [2025, 2023, 2021], importance: "MEDIUM", probability: 70 },
  { topic: "Exception Handling", subject: "MCS-024 Java", years: [2024, 2022], importance: "MEDIUM", probability: 64 },
  { topic: "Graph Theory", subject: "MCS-013 Discrete Maths", years: [2023, 2020], importance: "LOW", probability: 45 },
];

export const semesters = [1, 2, 3, 4, 5, 6];

export function subjectsBySemester(sem: number) {
  return subjects.filter((s) => s.semester === sem);
}

export function papersForCourse(courseCode: string) {
  return papers
    .filter((p) => p.courseCode === courseCode)
    .sort((a, b) => b.year - a.year || (a.session === "December" ? -1 : 1));
}

/** Current IGNOU assignment session (July 2025 – June 2026 cycle). */
export const currentAssignmentSession = "2025-26";

export function assignmentsBySemester(sem: number) {
  return subjectsBySemester(sem).map((s) => {
    const meta = assignments.find((a) => a.courseCode === s.courseCode);
    return {
      courseCode: s.courseCode,
      title: s.title,
      semester: s.semester,
      credits: s.credits,
      session: currentAssignmentSession,
      deadline: meta?.deadline ?? "2026-08-31",
      solved: meta?.solved ?? false,
    };
  });
}
