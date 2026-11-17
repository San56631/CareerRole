// Central career-role list. Import this everywhere instead of
// hard-coding <option> lists in individual pages.
export const ROLE_GROUPS: { group: string; roles: string[] }[] = [
  {
    group: "Software and Development",
    roles: [
      "Software Engineer",
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "Android Developer",
      "DevOps Engineer",
      "Cloud Engineer",
      "Cybersecurity Analyst",
      "QA Engineer",
    ],
  },
  {
    group: "Data and AI",
    roles: [
      "Data Analyst",
      "Data Scientist",
      "Data Engineer",
      "Machine Learning Engineer",
      "AI Engineer",
    ],
  },
  {
    group: "Business and Management",
    roles: ["Product Manager", "Business Analyst", "Project Manager", "Financial Analyst"],
  },
  {
    group: "Design and Other",
    roles: ["UI/UX Designer", "Technical Writer", "Digital Marketing Analyst"],
  },
];

export const ALL_ROLES = ROLE_GROUPS.flatMap((g) => g.roles);
