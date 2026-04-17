"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Comment = {
  id: string;
  name: string;
  date: string;
  text: string;
};

type BlogPost = {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  comments: Comment[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function categoryColor(cat: string): string {
  switch (cat) {
    case "Planting Tips":    return "bg-green-100 text-green-800";
    case "Recipes":          return "bg-amber-100 text-amber-800";
    case "Pests & Diseases": return "bg-red-100 text-red-800";
    case "Seasonal":         return "bg-blue-100 text-blue-800";
    default:                 return "bg-purple-100 text-purple-800";
  }
}

/** Render content: split on blank lines → paragraphs; **bold** → <strong> */
function renderContent(content: string) {
  const paragraphs = content.split(/\n\n+/);
  return paragraphs.map((para, i) => {
    // Headings: lines starting with **text:** treated as a bold heading paragraph
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-4 leading-relaxed text-gray-700">
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
      </p>
    );
  });
}

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();

  const [post, setPost]           = useState<BlogPost | null>(null);
  const [notFound, setNotFound]   = useState(false);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    import("@/data/blog.json").then((mod) => {
      const all = mod.default as BlogPost[];
      const found = all.find((p) => p.id === id);
      if (found) {
        setPost(found);
      } else {
        setNotFound(true);
      }
    });
  }, [id]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!post) return;
    setSubmitting(true);
    setSubmitStatus("idle");
    try {
      const res = await fetch(`/api/blog/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: commentName, text: commentText }),
      });
      if (!res.ok) throw new Error("Failed");
      const { comment } = await res.json();
      setPost((prev) =>
        prev ? { ...prev, comments: [...prev.comments, comment] } : prev
      );
      setCommentName("");
      setCommentText("");
      setSubmitStatus("success");
      setTimeout(() => setSubmitStatus("idle"), 4000);
    } catch {
      setSubmitStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-garden-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-500 mb-4">Post not found.</p>
          <Link href="/blog" className="text-garden-green hover:text-garden-green-dark underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-garden-cream flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Hero */}
      <section className="bg-gradient-to-br from-garden-green-dark to-garden-green py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-garden-green-pale hover:text-white text-sm mb-4 inline-block">
            ← Back to Blog
          </Link>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor(post.category)}`}>
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">
            {post.title}
          </h1>
          <p className="text-garden-green-pale text-sm">
            By {post.author} &middot; {formatDate(post.date)}
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Post content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10 mb-10">
            <div className="prose-garden text-base leading-relaxed">
              {renderContent(post.content)}
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-6">
              💬 Comments ({post.comments.length})
            </h2>

            {post.comments.length === 0 ? (
              <p className="text-gray-400 italic mb-8">No comments yet — be the first!</p>
            ) : (
              <div className="space-y-5 mb-8">
                {post.comments.map((c) => (
                  <div key={c.id} className="border-l-4 border-garden-green/30 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800 text-sm">{c.name}</span>
                      <span className="text-gray-400 text-xs">{formatDate(c.date)}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add comment form */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Leave a Comment</h3>

              {submitStatus === "success" && (
                <div className="mb-4 bg-green-50 border border-green-300 text-green-800 rounded-lg p-3 text-sm">
                  ✅ Comment posted — thanks!
                </div>
              )}
              {submitStatus === "error" && (
                <div className="mb-4 bg-red-50 border border-red-300 text-red-800 rounded-lg p-3 text-sm">
                  ❌ Couldn&apos;t post your comment. Please try again.
                </div>
              )}

              <form onSubmit={handleComment} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="e.g. Sandra K."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Comment *
                  </label>
                  <textarea
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    placeholder="Share your thoughts…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-garden-green-dark text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-garden-green transition-colors disabled:opacity-50"
                >
                  {submitting ? "Posting…" : "Post Comment"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
