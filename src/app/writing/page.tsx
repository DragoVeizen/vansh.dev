import Link from "next/link";
import { formatPostDate, getAllPosts } from "@/lib/posts";

export const metadata = { title: "Writing" };

export default async function WritingIndex() {
  const posts = await getAllPosts();
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:px-12 md:py-20 lg:py-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-dim transition-colors hover:text-accent"
      >
        <span aria-hidden>←</span>
        <span>vansh.dev</span>
      </Link>

      <div className="mt-16">
        <h1 className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          Writing
        </h1>
        <ul className="mt-10 space-y-12">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/writing/${p.slug}`} className="group block">
                <time className="font-mono text-[11px] uppercase tracking-[0.22em] text-dim">
                  {formatPostDate(p.date)}
                </time>
                <h2 className="mt-2 text-2xl font-medium leading-tight text-fg-strong transition-colors group-hover:text-accent">
                  {p.title}
                </h2>
                <p className="mt-2 text-muted">{p.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
