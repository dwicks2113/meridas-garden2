import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { isAdmin } from "@/lib/adminAuth";

const blogPath = join(process.cwd(), "src", "data", "blog.json");

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

    const raw     = readFileSync(blogPath, "utf-8");
    const entries = JSON.parse(raw);

    // Unique slug ID
    const baseId = toSlug(title) || `post-${Date.now()}`;
    const existingIds = new Set(entries.map((e: { id: string }) => e.id));
    let newId = baseId;
    let counter = 2;
    while (existingIds.has(newId)) newId = `${baseId}-${counter++}`;

    const today = new Date().toISOString().split("T")[0];

    const newPost = {
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

    // Prepend so newest shows first
    entries.unshift(newPost);
    writeFileSync(blogPath, JSON.stringify(entries, null, 2));

    return NextResponse.json({ success: true, post: newPost });
  } catch (err) {
    console.error("Blog post save error:", err);
    return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
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

    const raw     = readFileSync(blogPath, "utf-8");
    const entries = JSON.parse(raw) as { id: string }[];
    const index   = entries.findIndex((e) => e.id === id);
    if (index === -1) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    entries.splice(index, 1);
    writeFileSync(blogPath, JSON.stringify(entries, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Blog delete error:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
