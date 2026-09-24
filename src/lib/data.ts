// Central course data for IGNOU BCA Master Hub.
// Two programmes are supported: the older BCA (revised syllabus) and the
// current BCA_NEWOL / BCA_NEW structure (120 credits, July 2024 onwards).

export type Session = "June" | "December";

export type Programme = "BCA" | "BCA_NEWOL";

export const programmes: { code: Programme; label: string; description: string }[] = [
  {
    code: "BCA_NEWOL",
    label: "BCA_NEWOL (current)",
    description: "New 120-credit BCA structure — July 2024 onwards",
  },
  {
    code: "BCA",
    label: "BCA (old)",
    description: "Earlier BCA revised syllabus — pre-2024 admissions",
  },
];

export interface Subject {
  courseCode: string;
  title: string;
  semester: number;
  credits: number;
  units: number;
  programme: Programme;
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
  actionLabel?: string;
  actionUrl?: string;
}


export interface RepeatTrend {
  topic: string;
  subject: string;
  years: number[];
  importance: "HIGH" | "MEDIUM" | "LOW";
  probability: number; // 0-100
}

/** Older BCA (pre-2024) syllabus. */
export const oldBcaSubjects: Subject[] = [
  { programme: "BCA", courseCode: "BCS-011", title: "Computer Basics & PC Software", semester: 1, credits: 4, units: 16, importantTopics: ["Number systems", "MS Office", "Operating systems"] },
  { programme: "BCA", courseCode: "BCS-012", title: "Basic Mathematics", semester: 1, credits: 4, units: 12, importantTopics: ["Matrices", "Determinants", "Differentiation"] },
  { programme: "BCA", courseCode: "ECO-01", title: "Business Organisation", semester: 1, credits: 4, units: 14, importantTopics: ["Forms of business", "Stock exchange"] },
  { programme: "BCA", courseCode: "FEG-02", title: "Foundation Course in English", semester: 1, credits: 4, units: 10, importantTopics: ["Comprehension", "Grammar", "Essay writing"] },

  { programme: "BCA", courseCode: "BCS-031", title: "Programming in C++", semester: 2, credits: 4, units: 18, importantTopics: ["OOP concepts", "Inheritance", "Polymorphism", "Templates"] },
  { programme: "BCA", courseCode: "BCS-040", title: "Statistical Techniques", semester: 2, credits: 4, units: 14, importantTopics: ["Probability", "Hypothesis testing", "Correlation"] },
  { programme: "BCA", courseCode: "MCS-011", title: "Problem Solving and Programming", semester: 2, credits: 3, units: 12, importantTopics: ["Pointers", "Arrays", "File handling"] },
  { programme: "BCA", courseCode: "MCS-012", title: "Computer Organisation & Assembly", semester: 2, credits: 4, units: 20, importantTopics: ["Number systems", "ALU", "Memory organisation"] },

  { programme: "BCA", courseCode: "MCS-013", title: "Discrete Mathematics", semester: 3, credits: 2, units: 10, importantTopics: ["Sets", "Graph theory", "Boolean algebra"] },
  { programme: "BCA", courseCode: "MCS-014", title: "Systems Analysis and Design", semester: 3, credits: 3, units: 14, importantTopics: ["SDLC", "DFD", "ER diagrams"] },
  { programme: "BCA", courseCode: "MCS-015", title: "Communication Skills", semester: 3, credits: 2, units: 8, importantTopics: ["Listening", "Presentation skills"] },
  { programme: "BCA", courseCode: "BCS-053", title: "Web Programming", semester: 3, credits: 4, units: 16, importantTopics: ["HTML/CSS", "JavaScript", "DHTML"] },

  { programme: "BCA", courseCode: "MCS-021", title: "Data and File Structures", semester: 4, credits: 4, units: 18, importantTopics: ["Trees", "Sorting", "Hashing", "Graphs"] },
  { programme: "BCA", courseCode: "MCS-023", title: "Database Management Systems", semester: 4, credits: 3, units: 16, importantTopics: ["Normalization", "SQL", "ER model", "Transactions"] },
  { programme: "BCA", courseCode: "BCSL-045", title: "Web Programming Lab", semester: 4, credits: 2, units: 6, importantTopics: ["Practical web apps"] },

  { programme: "BCA", courseCode: "MCS-024", title: "Object Oriented Tech & Java", semester: 5, credits: 4, units: 18, importantTopics: ["JVM", "Collections", "Exception handling", "Threads"] },
  { programme: "BCA", courseCode: "BCS-051", title: "Introduction to Software Engineering", semester: 5, credits: 4, units: 16, importantTopics: ["Process models", "Testing", "Project management"] },
  { programme: "BCA", courseCode: "BCS-052", title: "Network Programming & Administration", semester: 5, credits: 4, units: 16, importantTopics: ["TCP/IP", "Sockets", "Routing"] },
  { programme: "BCA", courseCode: "BCS-054", title: "Computer Oriented Numerical Techniques", semester: 5, credits: 4, units: 12, importantTopics: ["Interpolation", "Numerical integration"] },

  { programme: "BCA", courseCode: "MCS-022", title: "Operating System Concepts & Networking", semester: 6, credits: 4, units: 20, importantTopics: ["Scheduling", "Deadlocks", "Memory management"] },
  { programme: "BCA", courseCode: "BCS-062", title: "E-Commerce", semester: 6, credits: 4, units: 14, importantTopics: ["EDI", "Payment systems", "Security"] },
  { programme: "BCA", courseCode: "BCSP-064", title: "Project", semester: 6, credits: 8, units: 0, importantTopics: ["Synopsis", "Implementation", "Report"] },
];

/** Current BCA_NEWOL / BCA_NEW structure (120 credits, July 2024 onwards). */
export const newBcaSubjects: Subject[] = [
  { programme: "BCA_NEWOL", courseCode: "BEVAE-181", title: "Environmental Studies", semester: 1, credits: 4, units: 16, importantTopics: ["Ecosystems", "Biodiversity", "Pollution control"] },
  { programme: "BCA_NEWOL", courseCode: "BEGLA-136", title: "English at Work Place", semester: 1, credits: 6, units: 14, importantTopics: ["Business writing", "Presentation", "Grammar"] },
  { programme: "BCA_NEWOL", courseCode: "BCS-111", title: "Computer Basics and PC Software", semester: 1, credits: 4, units: 16, importantTopics: ["Number systems", "MS Office", "Operating systems"] },
  { programme: "BCA_NEWOL", courseCode: "BCSL-013", title: "Computer Basics and PC Software Lab", semester: 1, credits: 2, units: 6, importantTopics: ["Word/Excel practicals", "Presentations"] },
  { programme: "BCA_NEWOL", courseCode: "BCS-012", title: "Basic Mathematics", semester: 1, credits: 4, units: 12, importantTopics: ["Matrices", "Determinants", "Differentiation"] },

  { programme: "BCA_NEWOL", courseCode: "FEG-02", title: "Foundation Course in English-2", semester: 2, credits: 4, units: 10, importantTopics: ["Comprehension", "Grammar", "Essay writing"] },
  { programme: "BCA_NEWOL", courseCode: "MCS-201", title: "Programming in C and Python", semester: 2, credits: 4, units: 18, importantTopics: ["Pointers", "Functions", "Python data types", "File handling"] },
  { programme: "BCA_NEWOL", courseCode: "MCS-202", title: "Computer Organisation", semester: 2, credits: 4, units: 16, importantTopics: ["ALU design", "Memory hierarchy", "Instruction cycle"] },
  { programme: "BCA_NEWOL", courseCode: "MCS-203", title: "Operating Systems", semester: 2, credits: 4, units: 16, importantTopics: ["Scheduling", "Deadlocks", "Memory management"] },
  { programme: "BCA_NEWOL", courseCode: "MCSL-204", title: "WINDOWS and LINUX Lab", semester: 2, credits: 2, units: 6, importantTopics: ["Shell commands", "System administration"] },
  { programme: "BCA_NEWOL", courseCode: "MCSL-205", title: "C and Python Lab", semester: 2, credits: 2, units: 6, importantTopics: ["C programs", "Python scripts"] },

  { programme: "BCA_NEWOL", courseCode: "MCS-207", title: "Database Management Systems", semester: 3, credits: 4, units: 16, importantTopics: ["Normalization", "SQL", "ER model", "Transactions"] },
  { programme: "BCA_NEWOL", courseCode: "MCS-208", title: "Data Structures and Algorithms", semester: 3, credits: 4, units: 18, importantTopics: ["Trees", "Sorting", "Hashing", "Graphs"] },
  { programme: "BCA_NEWOL", courseCode: "MCSL-209", title: "Data Structures and Algorithms Lab", semester: 3, credits: 2, units: 6, importantTopics: ["Implementation practicals"] },
  { programme: "BCA_NEWOL", courseCode: "BCS-131", title: "Programming in C++", semester: 3, credits: 4, units: 18, importantTopics: ["OOP concepts", "Inheritance", "Polymorphism", "Templates"] },
  { programme: "BCA_NEWOL", courseCode: "BCSL-135", title: "DBMS and C++ Lab", semester: 3, credits: 2, units: 6, importantTopics: ["SQL queries", "C++ programs"] },
  { programme: "BCA_NEWOL", courseCode: "BCS-040", title: "Statistical Techniques", semester: 3, credits: 4, units: 14, importantTopics: ["Probability", "Hypothesis testing", "Correlation"] },

  { programme: "BCA_NEWOL", courseCode: "MCS-206", title: "Object Oriented Programming using Java", semester: 4, credits: 4, units: 18, importantTopics: ["JVM", "Collections", "Exception handling", "Threads"] },
  { programme: "BCA_NEWOL", courseCode: "BCSL-146", title: "Object Oriented Programming using Java Lab", semester: 4, credits: 2, units: 6, importantTopics: ["Java practicals"] },
  { programme: "BCA_NEWOL", courseCode: "BCS-053", title: "Web Programming", semester: 4, credits: 2, units: 12, importantTopics: ["HTML/CSS", "JavaScript", "PHP basics"] },
  { programme: "BCA_NEWOL", courseCode: "BCSL-147", title: "Web Programming Lab", semester: 4, credits: 2, units: 6, importantTopics: ["Web app practicals"] },
  { programme: "BCA_NEWOL", courseCode: "BCS-041", title: "Fundamentals of Computer Networks", semester: 4, credits: 4, units: 16, importantTopics: ["OSI/TCP-IP", "Routing", "Network security"] },
  { programme: "BCA_NEWOL", courseCode: "BCOC-131", title: "Financial Accounting", semester: 4, credits: 6, units: 18, importantTopics: ["Journal & ledger", "Final accounts", "Depreciation"] },

  { programme: "BCA_NEWOL", courseCode: "BCS-151", title: "Introduction to Software Engineering", semester: 5, credits: 4, units: 16, importantTopics: ["Process models", "Testing", "Project management"] },
  { programme: "BCA_NEWOL", courseCode: "BCS-042", title: "Introduction to Algorithm Design", semester: 5, credits: 2, units: 10, importantTopics: ["Complexity", "Greedy", "Divide and conquer"] },
  { programme: "BCA_NEWOL", courseCode: "BCSL-159", title: "Introduction to Algorithm Design Lab", semester: 5, credits: 2, units: 6, importantTopics: ["Algorithm practicals"] },
  { programme: "BCA_NEWOL", courseCode: "BCOS-184", title: "E-Commerce", semester: 5, credits: 4, units: 14, importantTopics: ["EDI", "Payment systems", "E-commerce security"] },
  { programme: "BCA_NEWOL", courseCode: "MSEI-023", title: "Cyber Security", semester: 5, credits: 4, units: 14, importantTopics: ["Threats", "Cryptography", "IT Act"] },
  { programme: "BCA_NEWOL", courseCode: "BECS-184", title: "Data Analysis", semester: 5, credits: 4, units: 14, importantTopics: ["Descriptive statistics", "Regression", "Index numbers"] },

  { programme: "BCA_NEWOL", courseCode: "BCOS-185", title: "Entrepreneurship", semester: 6, credits: 4, units: 14, importantTopics: ["Business plan", "Startup finance", "MSME schemes"] },
  { programme: "BCA_NEWOL", courseCode: "MSEI-027", title: "Digital Forensics", semester: 6, credits: 4, units: 14, importantTopics: ["Evidence handling", "Disk forensics", "Cyber law"] },
  { programme: "BCA_NEWOL", courseCode: "BCSP-165", title: "Project", semester: 6, credits: 12, units: 0, importantTopics: ["Synopsis", "Implementation", "Report"] },
];

export const subjects: Subject[] = [...newBcaSubjects, ...oldBcaSubjects];

export const defaultProgramme: Programme = "BCA_NEWOL";

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
  { courseCode: "BCS-111", title: "Computer Basics and PC Software Assignment", semester: 1, session: "2025-26", deadline: "2026-07-31", solved: true },
  { courseCode: "BCS-012", title: "Basic Mathematics Assignment", semester: 1, session: "2025-26", deadline: "2026-07-31", solved: true },
  { courseCode: "MCS-201", title: "C and Python Assignment", semester: 2, session: "2025-26", deadline: "2026-07-31", solved: true },
  { courseCode: "MCS-207", title: "DBMS Assignment", semester: 3, session: "2025-26", deadline: "2026-08-15", solved: true },
  { courseCode: "MCS-206", title: "Java Assignment", semester: 4, session: "2025-26", deadline: "2026-08-15", solved: false },
  { courseCode: "BCS-151", title: "Software Engineering Assignment", semester: 5, session: "2025-26", deadline: "2026-08-31", solved: false },
  { courseCode: "BCSP-165", title: "Project Guidelines", semester: 6, session: "2025-26", deadline: "2026-08-31", solved: false },
];

export const updates: UpdateItem[] = [
  { id: "u1", title: "June 2026 TEE Exam Form Open", category: "Exam", date: "2026-06-10", summary: "Submit your Term End Exam form before the last date without late fee.", actionLabel: "Fill exam form", actionUrl: "https://exam.ignou.ac.in/" },
  { id: "u2", title: "Hall Ticket June 2026 Released", category: "Hall Ticket", date: "2026-06-14", summary: "Download your June 2026 hall ticket from the IGNOU portal.", actionLabel: "Download hall ticket", actionUrl: "https://exam.ignou.ac.in/" },
  { id: "u3", title: "December 2025 Result Declared", category: "Result", date: "2026-06-02", summary: "Check your December 2025 TEE results and grade card online.", actionLabel: "Check result", actionUrl: "https://termendresult.ignou.ac.in/" },
  { id: "u4", title: "Assignment Submission Extended", category: "Assignment", date: "2026-05-28", summary: "Last date for 2025-26 assignment submission extended to 31 Aug 2026.", actionLabel: "Check assignment status", actionUrl: "https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP" },
  { id: "u5", title: "Re-registration July 2026 Cycle", category: "Registration", date: "2026-05-20", summary: "Re-register for the next semester to continue your BCA programme.", actionLabel: "Re-register now", actionUrl: "https://onlinerr.ignou.ac.in/" },
];


export const repeatTrends: RepeatTrend[] = [
  { topic: "Normalization", subject: "MCS-207 DBMS", years: [2025, 2024, 2022, 2020, 2019], importance: "HIGH", probability: 92 },
  { topic: "Inheritance & Polymorphism", subject: "BCS-131 C++", years: [2025, 2024, 2023, 2021], importance: "HIGH", probability: 88 },
  { topic: "Process Scheduling", subject: "MCS-203 Operating Systems", years: [2024, 2023, 2022, 2020], importance: "HIGH", probability: 85 },
  { topic: "Trees & Traversal", subject: "MCS-208 Data Structures", years: [2025, 2023, 2021], importance: "MEDIUM", probability: 70 },
  { topic: "Exception Handling", subject: "MCS-206 Java", years: [2024, 2022], importance: "MEDIUM", probability: 64 },
  { topic: "TCP/IP & Routing", subject: "BCS-041 Computer Networks", years: [2025, 2023, 2020], importance: "MEDIUM", probability: 62 },
  { topic: "Cryptography Basics", subject: "MSEI-023 Cyber Security", years: [2024, 2023], importance: "LOW", probability: 48 },
];

export const semesters = [1, 2, 3, 4, 5, 6];

export function subjectsBySemester(sem: number, programme: Programme = defaultProgramme) {
  return subjects.filter((s) => s.semester === sem && s.programme === programme);
}

export function findSubject(courseCode: string) {
  return subjects.find((s) => s.courseCode.toUpperCase() === courseCode.toUpperCase());
}

export function papersForCourse(courseCode: string) {
  return papers
    .filter((p) => p.courseCode === courseCode)
    .sort((a, b) => b.year - a.year || (a.session === "December" ? -1 : 1));
}

/** Current IGNOU assignment session (July 2025 – June 2026 cycle). */
export const currentAssignmentSession = "2025-26";

export function assignmentsBySemester(sem: number, programme: Programme = defaultProgramme) {
  return subjectsBySemester(sem, programme).map((s) => {
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

/** Programme codes exactly as listed on the IGNOU grade card portal. */
export const IGNOU_PROGRAMME_CODES = ["BCA_NEWOL", "BCA_NEW", "BCAOL", "BCA"] as const;
export type IgnouProgrammeCode = (typeof IGNOU_PROGRAMME_CODES)[number];
