import { NextRequest, NextResponse } from "next/server";
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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, text } = await req.json();

    if (!name || !text) {
      return NextResponse.json({ error: "Name and comment text are required" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    const newComment: BlogComment = {
      id:   `comment-${Date.now()}`,
      name: name.trim(),
      date: today,
      text: text.trim(),
    };

    let postFound = false;

    await updateRepoJson<BlogPost[]>(
      BLOG_REPO_PATH,
      (entries) => {
        const idx = entries.findIndex((p) => p.id === params.id);
        if (idx === -1) return entries;
        postFound = true;
        const next = [...entries];
        next[idx] = { ...next[idx], comments: [...next[idx].comments, newComment] };
        return next;
      },
      `Comment on ${params.id}: by ${name.trim()}`
    );

    if (!postFound) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, comment: newComment });
  } catch (err) {
    console.error("Comment save error:", err);
    const message = err instanceof Error ? err.message : "Failed to save comment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
