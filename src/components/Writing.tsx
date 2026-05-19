import { Card } from "@/components/Card";
import { Section } from "@/components/Section";
import { DiamondIcon, TerminalIcon } from "@/components/icons";
import { formatPostDate, getAllPosts } from "@/lib/posts";

export async function Writing() {
  const posts = await getAllPosts();

  return (
    <Section id="writing" label="Writing">
      <ul className="grid grid-cols-1 gap-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Card
              href={`/writing/${p.slug}`}
              icon={<TerminalIcon className="h-5 w-5" />}
              label={formatPostDate(p.date)}
              title={p.title}
              description={p.excerpt}
            />
          </li>
        ))}
        <li>
          <Card
            icon={<DiamondIcon className="h-5 w-5" />}
            label="Upcoming · May 2026"
            title="Rebuilding Hudle's payment pipeline without downtime"
            description="A 9-table entity split, dual-write, and middleware-rebinding — how we replaced a monolithic payment schema in production with feature flags and zero customer impact."
          />
        </li>
      </ul>
    </Section>
  );
}
