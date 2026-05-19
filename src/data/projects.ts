export type ProjectItem = {
  title: string;
  description: string;
  url?: string;
  status?: "Live" | "Private" | "WIP";
  tags?: string[];
};

export const projects: ProjectItem[] = [
  {
    title: "Hudle Payment Pipeline",
    status: "Private",
    description:
      "Rebuilt Hudle's payment infrastructure from a monolithic single-record model into a 9-table entity-split schema with rank-based refund ordering. Rolled out behind a feature flag using dual-write and middleware-rebinding for zero downtime. Companion write-up coming soon.",
    tags: ["PHP", "Laravel", "MySQL", "Feature Flags"],
  },
  {
    title: "hudle.in",
    status: "Live",
    url: "https://hudle.in",
    description:
      "Hudle's primary acquisition surface. Programmatic SEO across 20+ cities × 40+ sports, B2B funnels for venue partners and corporate clients. Currently drives 10K–20K weekly organic sessions and 500–750 weekly venue enquiries.",
    tags: ["Next.js", "TypeScript", "Programmatic SEO"],
  },
  {
    title: "Keylytics",
    status: "Live",
    url: "https://keylytics-web.onrender.com/",
    description:
      "Keystroke telemetry analytics. A side project I started to understand how my own typing changes across sessions. TypeScript + React on the front, Python + FastAPI on the back.",
    tags: ["TypeScript", "React", "Python", "FastAPI"],
  },
];
