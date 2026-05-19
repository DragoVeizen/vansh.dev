import type { ReactNode } from "react";
import { Card } from "@/components/Card";
import {
  AsteriskIcon,
  DiamondIcon,
  PipelineIcon,
} from "@/components/icons";
import {
  formatPostDate,
  getAllPosts,
  POST_CATEGORY_LABEL,
  type PostCategory,
} from "@/lib/posts";

// Bypasses <Section> so we can dual-render the visible heading
// ("Writing" / "Notes") while keeping section chrome stable.
// If Section.tsx ever changes, keep this section's chrome in sync.

const categoryIcon: Record<PostCategory, ReactNode> = {
  technical: <PipelineIcon className="h-5 w-5" />,
  "case-study": <DiamondIcon className="h-5 w-5" />,
  fun: <AsteriskIcon className="h-5 w-5" />,
};

export async function Writing() {
  const posts = await getAllPosts();

  return (
    <section
      id="writing"
      aria-label="Writing"
      className="scroll-mt-16 py-16 first:pt-0 lg:py-20 lg:scroll-mt-24"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-10 bg-bg/80 px-6 py-4 backdrop-blur md:-mx-12 md:px-12 lg:static lg:mx-0 lg:mb-8 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          <span className="recruiter-only">Writing</span>
          <span className="play-only">Notes</span>
        </h2>
      </div>

      <ul className="grid grid-cols-1 gap-4">
        {posts.map((p) => (
          <li key={p.slug} data-post-category={p.category}>
            <Card
              href={`/writing/${p.slug}`}
              icon={categoryIcon[p.category]}
              label={`${POST_CATEGORY_LABEL[p.category]} · ${formatPostDate(p.date)}`}
              title={p.title}
              description={p.excerpt}
            />
          </li>
        ))}
        <li className="recruiter-only">
          <Card
            icon={<DiamondIcon className="h-5 w-5" />}
            label="Case Study · Upcoming"
            title="Rebuilding Hudle's payment pipeline without downtime"
            description="A 9-table entity split, dual-write, and middleware-rebinding — how we replaced a monolithic payment schema in production with feature flags and zero customer impact."
          />
        </li>
      </ul>
    </section>
  );
}
