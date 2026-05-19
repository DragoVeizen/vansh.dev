import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src/content/writing");

export type PostCategory = "technical" | "case-study" | "fun";

export const POST_CATEGORY_LABEL: Record<PostCategory, string> = {
  technical: "Technical",
  "case-study": "Case Study",
  fun: "Fun",
};

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: PostCategory;
};

export type Post = PostMeta & { content: string };

function normalizeCategory(value: unknown): PostCategory {
  const v = String(value ?? "").toLowerCase().replace(/_/g, "-");
  if (v === "technical" || v === "case-study" || v === "fun") return v;
  return "technical";
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const files = await fs.readdir(POSTS_DIR);
  const mdx = files.filter((f) => f.endsWith(".mdx"));
  const posts = await Promise.all(
    mdx.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = await fs.readFile(path.join(POSTS_DIR, file), "utf8");
      const { data } = matter(raw);
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? ""),
        excerpt: String(data.excerpt ?? ""),
        category: normalizeCategory(data.category),
      };
    })
  );
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const raw = await fs.readFile(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");
    const { data, content } = matter(raw);
    return {
      slug,
      title: String(data.title ?? slug),
      date: String(data.date ?? ""),
      excerpt: String(data.excerpt ?? ""),
      category: normalizeCategory(data.category),
      content,
    };
  } catch {
    return null;
  }
}

export function formatPostDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
