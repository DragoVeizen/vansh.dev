export type ProjectIconKey = "pipeline" | "grid" | "pulse" | "terminal" | "diamond";

export type ProjectItem = {
  title: string;
  description: string;
  url?: string;
  status?: "Live" | "Private" | "WIP";
  tags?: string[];
  iconKey: ProjectIconKey;
};

export const projects: ProjectItem[] = [
  {
    title: "Hudle Payment Pipeline",
    status: "Private",
    iconKey: "pipeline",
    description:
      "Rebuilt Hudle's payment infrastructure from a monolithic single-record model into a 9-table entity-split schema with rank-based refund ordering. Rolled out behind a feature flag using dual-write and middleware-rebinding for zero downtime.",
    tags: ["PHP", "Laravel", "MySQL", "Feature Flags"],
  },
  {
    title: "hudle.in",
    status: "Live",
    iconKey: "grid",
    url: "https://hudle.in",
    description:
      "Hudle's primary acquisition surface. Programmatic SEO across 20+ cities × 40+ sports. Drives 10K–20K weekly organic sessions and 500–750 weekly venue enquiries.",
    tags: ["Next.js", "TypeScript", "Programmatic SEO"],
  },
  {
    title: "Keylytics",
    status: "Live",
    iconKey: "pulse",
    url: "https://keylytics-web.onrender.com/",
    description:
      "Keystroke telemetry analytics. A side project I started to understand how my own typing changes across sessions.",
    tags: ["TypeScript", "React", "Python", "FastAPI"],
  },
];
