// Official IGNOU portals — external quick links for students.
export interface Portal {
  name: string;
  url: string;
  description: string;
}

export const ignouPortals: Portal[] = [
  {
    name: "eGyanKosh (Study Material)",
    url: "https://egyankosh.ac.in/",
    description: "Free official IGNOU blocks and study material",
  },
  {
    name: "IGNOU Samarth Student Portal",
    url: "https://ignou.samarth.edu.in/",
    description: "Main student login — profile, fees, re-registration",
  },
  {
    name: "Online Assignment Submission",
    url: "https://onlineassignment.ignou.ac.in/",
    description: "Upload your completed assignments",
  },
  {
    name: "Grade Card / Result",
    url: "https://gradecard.ignou.ac.in/gradecardM/index.asp",
    description: "Check assignment marks and TEE results",
  },
  {
    name: "Re-registration",
    url: "https://onlinerr.ignou.ac.in/",
    description: "Register for your next semester",
  },
  {
    name: "Exam Form (TEE)",
    url: "https://exam.ignou.ac.in/",
    description: "Submit Term End Exam form and hall ticket",
  },
];
