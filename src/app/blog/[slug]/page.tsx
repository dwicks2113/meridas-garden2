"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import blogData from "@/data/blog.json";

interface Comment {
  id: string;
  author: string;
  date: string;
  text: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogData.find((p) => p.slug === slug);

  const [comments, setComments] = useState<Comment[]>(post?.comments || []);
  const [newAuthor, setNewAuthor] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Post not found</h1>
        <Link href="/blog" className="btn-primary">Back to Blog</Link>
      </div>
    );
  }

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const comment: Comment = {
      id: `c${Date.now()}`,
      author: newAuthor.trim(),
      date: new Date().toISOString().split("T")[0],
      text: newComment.trim(),
    };

    setComments((prev) => [...prev, comment]);
    setNewAuthor("");
    setNewComment("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-garden-sky to-garden-sky/80 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-white/70 hover:text-white text-sm inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </section>

      <article className="py-10 md:py-16 bg-garden-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Post Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
              <span>{formatDate(post.date)}</span>
              <span>&middot;</span>
              <span>By {post.author}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-garden-green-dark mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-garden-green-pale text-garden-green-dark px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none">
            {post.content.map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-5">{paragraph}</p>
            ))}
          </div>

          {/* Comments Section */}
          <section className="mt-12 pt-8 border-t border-garden-earth-pale">
            <h2 className="text-2xl font-heading font-bold text-garden-green-dark mb-6">
              Comments ({comments.length})
            </h2>

            {/* Existing Comments */}
            {comments.length > 0 ? (
              <div className="space-y-4 mb-8">
                {comments.map((comment) => (
                  <div key={comment.id} className="card p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-garden-green-pale rounded-full flex items-center justify-center">
                        <span className="text-garden-green-dark font-bold text-sm">
                          {comment.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-garden-green-dark">{comment.author}</span>
                        <span className="text-xs text-gray-400 ml-2">{formatDate(comment.date)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 ml-11">{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-8">No comments yet. Be the first to share your thoughts!</p>
            )}

            {/* New Comment Form */}
            <div className="card p-6">
              <h3 className="font-heading font-bold text-garden-green-dark mb-4">Leave a Comment</h3>

              {submitted && (
                <div className="bg-garden-green-pale border border-garden-green rounded-lg p-3 mb-4 text-sm text-garden-green-dark">
                  Comment added! (Note: In-session comments are stored in memory. To make them permanent, add them to blog.json.)
                </div>
              )}

              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" id="author" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)}
                    required placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-lg border border-garden-earth-pale
                               focus:border-garden-green focus:ring-2 focus:ring-garden-green-pale
                               transition-colors bg-white text-sm" />
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea id="comment" rows={4} value={newComment} onChange={(e) => setNewComment(e.target.value)}
                    required placeholder="Share your thoughts, tips, or questions..."
                    className="w-full px-4 py-2.5 rounded-lg border border-garden-earth-pale
                               focus:border-garden-green focus:ring-2 focus:ring-garden-green-pale
                               transition-colors bg-white text-sm resize-vertical" />
                </div>
                <button type="submit" className="btn-primary text-sm">Post Comment</button>
              </form>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
