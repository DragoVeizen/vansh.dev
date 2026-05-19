import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { formatPostDate, getAllPosts, getPost } from "@/lib/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:px-12 md:py-20 lg:py-24">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-dim transition-colors hover:text-accent"
      >
        <span aria-hidden>←</span>
        <span>vansh.dev</span>
      </Link>

      <article className="mt-16">
        <time className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
          {formatPostDate(post.date)}
        </time>
        <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-fg-strong sm:text-5xl">
          {post.title}
        </h1>
        <div className="post-prose prose mt-12 max-w-none">
          <MDXRemote
            source={post.content}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
      </article>

      <div className="mt-20 border-t border-rule pt-8">
        <Link
          href="/#writing"
          className="font-mono text-[11px] uppercase tracking-[0.22em] text-dim transition-colors hover:text-accent"
        >
          ← All writing
        </Link>
      </div>
    </main>
  );
}
