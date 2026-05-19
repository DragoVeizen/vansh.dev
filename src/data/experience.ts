export type ExperienceItem = {
  dateRange: string;
  role: string;
  company: string;
  companyUrl: string;
  description: string;
  outcomes?: string[];
  tags?: string[];
};

export const experience: ExperienceItem[] = [
  {
    dateRange: "Aug 2024 — Present",
    role: "Full Stack Engineer",
    company: "Hudle",
    companyUrl: "https://hudle.in",
    description:
      "Working on Hudle's payment infrastructure. Rebuilt the payment pipeline from a monolithic single-record model into a 9-table entity-split schema with rank-based refund ordering, rolled out behind a feature flag using dual-write and middleware-rebinding for zero downtime. Shipped insurance as a new revenue stream — a first-class payment entity backed by an async state machine with idempotent retries and ~60 unit tests covering the transitions. Also built hudle.in, the company's primary acquisition surface, and an internal Laravel + ClickHouse analytics system that replaced our paid SaaS observability.",
    outcomes: [
      "9-table payment refactor delivered with zero downtime via dual-write + feature flag",
      "hudle.in drives 10K–20K weekly organic sessions and 500–750 weekly venue enquiries",
      "Elasticsearch search pipeline: 3× faster, 90% fewer mapping errors",
      "Onboarding time cut from 4 days to 1 hour via Docker + LocalStack dev env",
    ],
    tags: ["PHP", "Laravel", "Go", "MySQL", "Elasticsearch", "ClickHouse", "Docker", "AWS"],
  },
  {
    dateRange: "Jan 2024 — Jul 2024",
    role: "SDE Intern",
    company: "Plotline",
    companyUrl: "https://plotline.so",
    description:
      "Migrated services from Node.js to Go and built media compression for the content pipeline. The compression work used FFmpeg and Sharp to process image and video uploads, which let us downsize a 64GB EC2 instance running at 90% utilization to an 8GB instance — an 8× reduction in compute footprint for the same workload.",
    outcomes: [
      "Migrated core services from Node.js to Go",
      "Media compression cut EC2 footprint 8× (64GB → 8GB) at higher throughput",
    ],
    tags: ["Node.js", "Go", "FFmpeg", "Sharp", "AWS"],
  },
];
