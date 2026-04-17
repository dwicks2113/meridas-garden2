import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const blogPath = join(process.cwd(), "src", "data", "blog.json");

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, text } = await req.json();

    if (!name || !text) {
      return NextResponse.json({ error: "Name and comment text are required" }, { status: 400 });
    }

    const raw     = readFileSync(blogPath, "utf-8");
    const entries = JSON.parse(raw);

    const postIndex = entries.findIndex((p: { id: string }) => p.id === params.id);
    if (postIndex === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const today = new Date().toISOString().split("T")[0];
    const newComment = {
      id:   `comment-${Date.now()}`,
      name: name.trim(),
      date: today,
      text: text.trim(),
    };

    entries[postIndex].comments.push(newComment);
    writeFileSync(blogPath, JSON.stringify(entries, null, 2));

    return NextResponse.json({ success: true, comment: newComment });
  } catch (err) {
    console.error("Comment save error:", err);
    return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
  }
}
