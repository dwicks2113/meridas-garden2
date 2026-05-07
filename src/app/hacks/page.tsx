"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import hacksData from "@/data/hacks.json";
import BoxerLogo from "@/components/BoxerLogo";
import { useAdmin } from "@/components/AdminContext";

interface Hack {
  id: string;
  name: string;
  category: string;
  description: string;
  materials: string[];
  instructions: string[];
  addedAt: string;
}

const categoryLabels: Record<string, { label: string; emoji: string; color: string }> = {
  "pest-control":         { label: "Pest Control",        emoji: "🐛", color: "bg-red-100 text-red-800" },
  "soil-fertilizer":      { label: "Soil & Fertilizer",   emoji: "🪱", color: "bg-amber-100 text-amber-800" },
  "watering":             { label: "Watering",            emoji: "💧", color: "bg-blue-100 text-blue-800" },
  "companion-planting":   { label: "Companion Planting",  emoji: "🌻", color: "bg-yellow-100 text-yellow-800" },
  "weather-wisdom":       { label: "Weather Wisdom",      emoji: "🌦️", color: "bg-sky-100 text-sky-800" },
  "seed-starting":        { label: "Seed Starting",       emoji: "🌱", color: "bg-green-100 text-green-800" },
  "harvesting-storage":   { label: "Harvest & Storage",   emoji: "🧺", color: "bg-orange-100 text-orange-800" },
  "general":              { label: "General",             emoji: "🌿", color: "bg-teal-100 text-teal-800" },
};

const emptyForm = {
  name: "",
  category: "general",
  description: "",
  materials: "",
  instructions: "",
};

export default function HacksPage() {
  const { isAdmin, adminPassword } = useAdmin();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [hacks, setHacks] = useState<Hack[]>(hacksData as Hack[]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const filtered = useMemo(() => {
    let list = hacks;
    if (activeCategory !== "all") list = list.filter((h) => h.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [hacks, search, activeCategory]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/hacks", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const { hack } = await res.json();
      setHacks((prev) => [hack, ...prev]);
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

  const categoryKeys = Object.keys(categoryLabels);

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Header */}
      <div className="bg-gradient-to-br from-garden-green-dark via-garden-green to-amber-700 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <BoxerLogo size={90} showBee showButterfly />
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                🌾 Garden Hacks from Our Ancestors
              </h1>
              <p className="text-garden-green-pale text-lg max-w-2xl">
                Time-tested gardening wisdom passed down through generations —
                old-fashioned tricks that still work today.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Success / Error banners */}
        {saveStatus === "success" && (
          <div className="mb-6 bg-green-50 border border-green-300 text-green-800 rounded-lg p-4">
            ✅ <strong>Hack saved!</strong> It&apos;s live in your browser now.
            The site will rebuild on Vercel in ~1–2 minutes so the new hack
            also shows up when anyone else visits.
          </div>
        )}
        {saveStatus === "error" && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-800 rounded-lg p-4">
            ❌ Failed to save. Please try again.
          </div>
        )}

        {/* Search + Add button row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search hacks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
          />
          {isAdmin && (
            <button
              onClick={() => { setShowForm(!showForm); setSaveStatus("idle"); }}
              className="bg-garden-green-dark text-white px-5 py-2 rounded-lg font-semibold hover:bg-garden-green transition-colors whitespace-nowrap"
            >
              {showForm ? "✕ Cancel" : "+ Add New Hack"}
            </button>
          )}
        </div>

        {/* Add Hack Form */}
        {isAdmin && showForm && (
          <div className="bg-white border border-garden-green/30 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-5">Add New Garden Hack</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hack Name *</label>
                  <input required name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Wood Ash Slug Barrier"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
                </div>

                {/* Category */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                  <select required name="category" value={form.category} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green">
                    {categoryKeys.map((k) => (
                      <option key={k} value={k}>
                        {categoryLabels[k].emoji} {categoryLabels[k].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea required name="description" value={form.description} onChange={handleChange}
                  rows={2} placeholder="Short summary of what this hack is and why it works…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
              </div>

              {/* Materials */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Materials / Ingredients <span className="font-normal text-gray-500">(one per line)</span></label>
                <textarea name="materials" value={form.materials} onChange={handleChange}
                  rows={4} placeholder={"1 cup wood ash\n1 gallon water\nSpray bottle"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green font-mono text-sm" />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instructions * <span className="font-normal text-gray-500">(one step per line)</span></label>
                <textarea required name="instructions" value={form.instructions} onChange={handleChange}
                  rows={5} placeholder={"Sprinkle wood ash in a circle around plants.\nReapply after rain.\nWorks best on dry soil."}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green font-mono text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="bg-garden-green-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-garden-green transition-colors disabled:opacity-50">
                  {saving ? "Saving…" : "💾 Save Hack"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-garden-green-dark text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:border-garden-green hover:text-garden-green-dark"
            }`}
          >
            All Hacks ({hacks.length})
          </button>
          {categoryKeys.map((c) => {
            const info = categoryLabels[c];
            const count = hacks.filter((h) => h.category === c).length;
            if (count === 0 && activeCategory !== c) return null;
            return (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === c
                    ? "bg-garden-green-dark text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:border-garden-green hover:text-garden-green-dark"
                }`}
              >
                {info.emoji} {info.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-5">
          {filtered.length} hack{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Hack list */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🌾</div>
            <p className="text-lg">No garden hacks yet.</p>
            {isAdmin && (
              <p className="text-sm mt-2">Click &quot;+ Add New Hack&quot; above to add the first one.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((hack) => {
              const catInfo = categoryLabels[hack.category] || { label: hack.category, emoji: "🌱", color: "bg-gray-100 text-gray-700" };
              return (
                <div key={hack.id} className="relative">
                  <Link
                    href={`/hacks/${hack.id}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-5 block"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-heading font-bold text-garden-green-dark text-lg group-hover:text-garden-green transition-colors leading-snug">
                        {hack.name}
                      </h3>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${catInfo.color}`}>
                        {catInfo.emoji} {catInfo.label}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{hack.description}</p>
                    <p className="text-xs text-garden-green mt-3 group-hover:text-garden-green-dark font-semibold">
                      Read more →
                    </p>
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete "${hack.name}"?`)) return;
                        const res = await fetch(`/api/hacks?id=${hack.id}`, {
                          method: "DELETE",
                          headers: { "x-admin-password": adminPassword },
                        });
                        if (res.ok) setHacks((prev) => prev.filter((h) => h.id !== hack.id));
                      }}
                      className="mt-1 text-xs text-red-400 hover:text-red-600 text-center w-full py-1"
                    >
                      🗑 Delete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
