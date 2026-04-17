"use client";

import { useState } from "react";

type Comment = {
  id: string;
  name: string;
  date: string;
  text: string;
};

interface Props {
  postId: string;
  initialComments: Comment[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CommentsSection({ postId, initialComments }: Props) {
  const [comments, setComments]     = useState<Comment[]>(initialComments);
  const [name, setName]             = useState("");
  const [text, setText]             = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus]         = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");
    try {
      const res = await fetch(`/api/blog/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, text }),
      });
      if (!res.ok) throw new Error("Failed");
      const { comment } = await res.json();
      setComments((prev) => [...prev, comment]);
      setName("");
      setText("");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-6">
        💬 Comments ({comments.length})
      </h2>

      {comments.length === 0 ? (
        <p className="text-gray-400 italic mb-8">No comments yet — be the first!</p>
      ) : (
        <div className="space-y-5 mb-8">
          {comments.map((c) => (
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

        {status === "success" && (
          <div className="mb-4 bg-green-50 border border-green-300 text-green-800 rounded-lg p-3 text-sm">
            ✅ Comment posted — thanks!
          </div>
        )}
        {status === "error" && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-800 rounded-lg p-3 text-sm">
            ❌ Couldn&apos;t post your comment. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={text}
              onChange={(e) => setText(e.target.value)}
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
  );
}
