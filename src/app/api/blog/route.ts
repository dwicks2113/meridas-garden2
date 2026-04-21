import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { updateRepoJson } from "@/lib/repoStorage";

const BLOG_REPO_PATH = "src/data/blog.json";

interface BlogComment {
  id: string;
  name: string;
  date: string;
  text: string;
}

interface BlogPost {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  comments: BlogComment[];
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { title, category, excerpt, content } = await req.json();

    if (!title || !category || !excerpt || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let savedPost: BlogPost | null = null;

    await updateRepoJson<BlogPost[]>(
      BLOG_REPO_PATH,
      (entries) => {
        const baseId = toSlug(title) || `post-${Date.now()}`;
        const existingIds = new Set(entries.map((e) => e.id));
        let newId = baseId;
        let counter = 2;
        while (existingIds.has(newId)) newId = `${baseId}-${counter++}`;

        const today = new Date().toISOString().split("T")[0];

        const newPost: BlogPost = {
          id:       newId,
          title:    title.trim(),
          date:     today,
          author:   "Merida",
          category,
          excerpt:  excerpt.trim(),
          content:  content.trim(),
          image:    `/images/blog/${newId}.jpg`,
          comments: [],
        };
        savedPost = newPost;
        return [newPost, ...entries];
      },
      `Add blog post: ${title.trim()}`
    );

    return NextResponse.json({ success: true, post: savedPost });
  } catch (err) {
    console.error("Blog post save error:", err);
    const message = err instanceof Error ? err.message : "Failed to save post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    let found = false;

    await updateRepoJson<BlogPost[]>(
      BLOG_REPO_PATH,
      (entries) => {
        const index = entries.findIndex((e) => e.id === id);
        if (index === -1) return entries;
        found = true;
        const next = [...entries];
        next.splice(index, 1);
        return next;
      },
      `Delete blog post: ${id}`
    );

    if (!found) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blog delete error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete post";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
