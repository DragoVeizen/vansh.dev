import type { ReactNode } from "react";
import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
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

const categoryIcon: Record<PostCategory, ReactNode> = {
  technical: <PipelineIcon className="h-5 w-5" />,
  "case-study": <DiamondIcon className="h-5 w-5" />,
  fun: <AsteriskIcon className="h-5 w-5" />,
};

export async function Writing() {
  const posts = await getAllPosts();

  return (
    <Section id="writing" label="Writing">
      <ul className="grid grid-cols-1 gap-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Card
              href={`/writing/${p.slug}`}
              icon={categoryIcon[p.category]}
              label={`${POST_CATEGORY_LABEL[p.category]} · ${formatPostDate(p.date)}`}
              title={p.title}
              description={p.excerpt}
            />
          </li>
        ))}
        <li>
          <Card
            icon={<DiamondIcon className="h-5 w-5" />}
            label="Case Study · Upcoming"
            title="Rebuilding Hudle's payment pipeline without downtime"
            description="A 9-table entity split, dual-write, and middleware-rebinding — how we replaced a monolithic payment schema in production with feature flags and zero customer impact."
          />
        </li>
      </ul>
    </Section>
  );
}
