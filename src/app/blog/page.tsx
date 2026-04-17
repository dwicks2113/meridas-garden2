"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import blogData from "@/data/blog.json";
import BoxerLogo from "@/components/BoxerLogo";

type BlogPost = {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  comments: { id: string; name: string; date: string; text: string }[];
};

const CATEGORIES = [
  "All",
  "General",
  "Planting Tips",
  "Recipes",
  "Pests & Diseases",
  "Seasonal",
];

const emptyForm = {
  title: "",
  category: "General",
  excerpt: "",
  content: "",
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
    case "Planting Tips":   return "bg-green-100 text-green-800";
    case "Recipes":         return "bg-amber-100 text-amber-800";
    case "Pests & Diseases":return "bg-red-100 text-red-800";
    case "Seasonal":        return "bg-blue-100 text-blue-800";
    default:                return "bg-purple-100 text-purple-800";
  }
}

export default function BlogPage() {
  const [posts, setPosts]           = useState<BlogPost[]>(
    [...(blogData as BlogPost[])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [saving, setSaving]         = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const filtered = useMemo(
    () =>
      activeCategory === "All"
        ? posts
        : posts.filter((p) => p.category === activeCategory),
    [posts, activeCategory]
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const { post } = await res.json();
      setPosts((prev) => [post, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-garden-green-dark to-garden-green py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <BoxerLogo size={90} showBee showButterfly />
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                Garden Blog
              </h1>
              <p className="text-lg text-garden-green-pale max-w-2xl">
                Tips, seasonal guides, recipes, and stories from the garden in Clearwater, FL.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-garden-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Status banners */}
          {saveStatus === "success" && (
            <div className="mb-5 bg-green-50 border border-green-300 text-green-800 rounded-lg p-4">
              ✅ Post published successfully!
            </div>
          )}
          {saveStatus === "error" && (
            <div className="mb-5 bg-red-50 border border-red-300 text-red-800 rounded-lg p-4">
              ❌ Failed to save. Please try again.
            </div>
          )}

          {/* Category filter + Write button */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start">
            <div className="flex flex-wrap gap-2 flex-1">
              {CATEGORIES.map((cat) => {
                const count = cat === "All"
                  ? posts.length
                  : posts.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      activeCategory === cat
                        ? "bg-garden-green-dark text-white border-garden-green-dark"
                        : "bg-white text-gray-600 border-gray-300 hover:border-garden-green"
                    }`}
                  >
                    {cat} {count > 0 && <span className="opacity-70">({count})</span>}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setSaveStatus("idle"); }}
              className="bg-garden-green-dark text-white px-5 py-2 rounded-lg font-semibold hover:bg-garden-green transition-colors whitespace-nowrap"
            >
              {showForm ? "✕ Cancel" : "✏️ Write a Post"}
            </button>
          </div>

          {/* Add post form */}
          {showForm && (
            <div className="bg-white border border-garden-green/30 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-5">
                New Blog Post
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      required
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. My Best Summer Harvest Yet"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Short Excerpt *
                    <span className="font-normal text-gray-500 ml-1">(shown on the blog listing)</span>
                  </label>
                  <textarea
                    required
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={2}
                    placeholder="A one or two sentence summary of this post…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Content *
                    <span className="font-normal text-gray-500 ml-1">
                      (use **bold** for emphasis, blank line between paragraphs)
                    </span>
                  </label>
                  <textarea
                    required
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows={10}
                    placeholder="Write your full post here…"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green font-mono text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-garden-green-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-garden-green transition-colors disabled:opacity-50"
                  >
                    {saving ? "Publishing…" : "📝 Publish Post"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setForm(emptyForm); }}
                    className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Post list */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No posts in this category yet.
            </div>
          ) : (
            <div className="space-y-8">
              {filtered.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColor(post.category)}`}
                      >
                        {post.category}
                      </span>
                      <span className="text-sm text-gray-400">{formatDate(post.date)}</span>
                      <span className="text-sm text-gray-400">by {post.author}</span>
                    </div>
                    <Link href={`/blog/${post.id}`}>
                      <h2 className="text-xl md:text-2xl font-heading font-bold text-garden-green-dark hover:text-garden-green transition-colors mb-2">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        💬 {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
                      </span>
                      <Link
                        href={`/blog/${post.id}`}
                        className="text-garden-green hover:text-garden-green-dark text-sm font-medium"
                      >
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
