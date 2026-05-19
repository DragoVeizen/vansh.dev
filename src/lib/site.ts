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
    github: "https://github.com/DragoVeizen",
    linkedin: "https://www.linkedin.com/in/vanshthakur",
  },
  // Play-mode copy. Same person, off-duty voice. The Sidebar component
  // dual-renders both variants and CSS hides the inactive one.
  play: {
    name: "vansh",
    subtitle: "off-duty · Delhi",
    tagline: "weird products, anecdotal solutions, and whatever I'm reading this week.",
    currentlyDoing: 'rereading "Tidy First?"',
    nav: [
      { id: "about", label: "About" },
      { id: "writing", label: "Notes" },
    ] as const,
  },
} as const;

export const nav = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "writing", label: "Writing" },
] as const;
