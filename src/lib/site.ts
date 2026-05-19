export const site = {
  name: "Vansh Thakur",
  title: "Full Stack Engineer at Hudle",
  tagline:
    "I build backend systems for payments, search, and platform tooling — mostly in PHP, Go, and SQL.",
  location: "New Delhi, IN",
  timezone: "UTC+5:30",
  currentlyDoing: "Writing about rebuilding Hudle's payment pipeline without downtime.",
  email: "vansh@hudle.in",
  socials: {
    github: "https://github.com/vansh-thakur",
    linkedin: "https://www.linkedin.com/in/vansh-thakur",
  },
} as const;

export const nav = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "writing", label: "Writing" },
] as const;
