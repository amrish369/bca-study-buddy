// Official IGNOU portals — external quick links for students.
// All URLs verified reachable; keep this list as the single source of truth.
export interface Portal {
  name: string;
  url: string;
  description: string;
}

export const ignouPortals: Portal[] = [
  {
    name: "Grade Card / Marks",
    url: "https://gradecard.ignou.ac.in/",
    description: "Course-wise assignment, theory and practical marks",
  },
  {
    name: "Term-End Exam Result",
    url: "https://termendresult.ignou.ac.in/",
    description: "Check your TEE result by enrolment number",
  },
  {
    name: "Assignment Status & Marks",
    url: "https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP",
    description: "Official assignment / project submission status",
  },
  {
    name: "Assignment Question Papers",
    url: "https://webservices.ignou.ac.in/assignments/",
    description: "Download the latest session assignment questions",
  },
  {
    name: "Admission / Registration Status",
    url: "https://isms.ignou.ac.in/changeadmdata/AdmissionStatusNew.ASP",
    description: "Confirm your admission and registered courses",
  },
  {
    name: "Exam Form & Hall Ticket (TEE)",
    url: "https://exam.ignou.ac.in/",
    description: "Submit the exam form and download your hall ticket",
  },
  {
    name: "Re-registration",
    url: "https://onlinerr.ignou.ac.in/",
    description: "Register for your next semester",
  },
  {
    name: "IGNOU Samarth Student Portal",
    url: "https://ignou.samarth.edu.in/",
    description: "Main student login — profile, fees, services",
  },
  {
    name: "eGyanKosh (Study Material)",
    url: "https://egyankosh.ac.in/",
    description: "Free official IGNOU blocks and study material",
  },
  {
    name: "IGNOU Official Website",
    url: "https://www.ignou.ac.in/",
    description: "Announcements, circulars and programme pages",
  },
];

/** Quick lookup for action buttons elsewhere in the app. */
export const portalUrls = {
  gradeCard: "https://gradecard.ignou.ac.in/",
  result: "https://termendresult.ignou.ac.in/",
  assignmentStatus: "https://isms.ignou.ac.in/changeadmdata/StatusAssignment.ASP",
  assignmentQuestions: "https://webservices.ignou.ac.in/assignments/",
  examForm: "https://exam.ignou.ac.in/",
  reRegistration: "https://onlinerr.ignou.ac.in/",
  samarth: "https://ignou.samarth.edu.in/",
  egyankosh: "https://egyankosh.ac.in/",
} as const;
