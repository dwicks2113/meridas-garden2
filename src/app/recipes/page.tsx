"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import recipesData from "@/data/recipes.json";
import BoxerLogo from "@/components/BoxerLogo";
import { useAdmin } from "@/components/AdminContext";

type RecipeType = "herbal-tea" | "tincture" | "salve" | "culinary";

interface Recipe {
  id: string;
  name: string;
  type: string;
  description: string;
  prepTime: string;
  steepTime?: string;
  yield: string;
  difficulty: string;
  image: string;
  plants: string[];
  plantIds: string[];
  ingredients: string[];
  instructions: string[];
  benefits: string[];
  caution?: string;
  storageNotes?: string;
}

const typeLabels: Record<string, { label: string; emoji: string; color: string }> = {
  "herbal-tea": { label: "Herbal Tea", emoji: "🍵", color: "bg-teal-100 text-teal-800" },
  "tincture":   { label: "Tincture",   emoji: "🌿", color: "bg-green-100 text-green-800" },
  "salve":      { label: "Salve / Oil", emoji: "🫙", color: "bg-amber-100 text-amber-800" },
  "culinary":   { label: "Culinary",   emoji: "🍽️", color: "bg-orange-100 text-orange-800" },
  "pets":       { label: "Pets",       emoji: "🐾", color: "bg-rose-100 text-rose-800" },
};

const difficultyColor: Record<string, string> = {
  easy:     "bg-green-100 text-green-700",
  medium:   "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

const emptyForm = {
  name: "",
  type: "herbal-tea" as RecipeType,
  description: "",
  prepTime: "",
  steepTime: "",
  yield: "",
  difficulty: "easy",
  plants: "",
  ingredients: "",
  instructions: "",
  benefits: "",
  caution: "",
  storageNotes: "",
};

export default function RecipesPage() {
  const { isAdmin, adminPassword } = useAdmin();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string>("all");
  const [recipes, setRecipes] = useState<Recipe[]>(recipesData as Recipe[]);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const filtered = useMemo(() => {
    let list = recipes;
    if (activeType !== "all") list = list.filter((r) => r.type === activeType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.plants.some((p) => p.toLowerCase().includes(q))
      );
    }
    return list;
  }, [recipes, search, activeType]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": adminPassword },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const { recipe } = await res.json();
      setRecipes((prev) => [recipe, ...prev]);
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

  const typeKeys = Object.keys(typeLabels);

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Header */}
      <div className="bg-gradient-to-br from-garden-green-dark via-garden-green to-teal-600 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <BoxerLogo size={90} showBee showButterfly />
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                🌿 Garden Recipes
              </h1>
              <p className="text-garden-green-pale text-lg max-w-2xl">
                Herbal teas, tinctures, salves, and culinary recipes made from plants
                grown right here in Clearwater, FL.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Success / Error banners */}
        {saveStatus === "success" && (
          <div className="mb-6 bg-green-50 border border-green-300 text-green-800 rounded-lg p-4">
            ✅ <strong>Recipe saved!</strong> It&apos;s live in your browser now.
            The site will rebuild on Vercel in ~1–2 minutes so the new recipe
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
            placeholder="Search recipes, plants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
          />
          {isAdmin && (
            <button
              onClick={() => { setShowForm(!showForm); setSaveStatus("idle"); }}
              className="bg-garden-green-dark text-white px-5 py-2 rounded-lg font-semibold hover:bg-garden-green transition-colors whitespace-nowrap"
            >
              {showForm ? "✕ Cancel" : "+ Add New Recipe"}
            </button>
          )}
        </div>

        {/* Add Recipe Form */}
        {isAdmin && showForm && (
          <div className="bg-white border border-garden-green/30 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-5">Add New Recipe</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Recipe Name *</label>
                  <input required name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Rosemary & Lemon Balm Relaxation Tea"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
                  <select required name="type" value={form.type} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green">
                    <option value="herbal-tea">🍵 Herbal Tea</option>
                    <option value="tincture">🌿 Tincture</option>
                    <option value="salve">🫙 Salve / Oil</option>
                    <option value="culinary">🍽️ Culinary</option>
                    <option value="pets">🐾 Pets</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty *</label>
                  <select required name="difficulty" value={form.difficulty} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Prep time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Prep Time *</label>
                  <input required name="prepTime" value={form.prepTime} onChange={handleChange}
                    placeholder="e.g. 10 minutes"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
                </div>

                {/* Steep / Cook time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Steep / Cook Time</label>
                  <input name="steepTime" value={form.steepTime} onChange={handleChange}
                    placeholder="e.g. 15 minutes (or '4–6 weeks' for tinctures)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
                </div>

                {/* Yield */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Yield *</label>
                  <input required name="yield" value={form.yield} onChange={handleChange}
                    placeholder="e.g. 2 cups, 1 jar"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
                </div>

                {/* Plants */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Plants Used *</label>
                  <input required name="plants" value={form.plants} onChange={handleChange}
                    placeholder="e.g. Lemongrass, Ginger, Holy Basil"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea required name="description" value={form.description} onChange={handleChange}
                  rows={2} placeholder="Brief description of this recipe and its benefits…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ingredients * <span className="font-normal text-gray-500">(one per line)</span></label>
                <textarea required name="ingredients" value={form.ingredients} onChange={handleChange}
                  rows={4} placeholder={"2 stalks lemongrass\n1-inch piece ginger\n2 cups water"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green font-mono text-sm" />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Instructions * <span className="font-normal text-gray-500">(one step per line)</span></label>
                <textarea required name="instructions" value={form.instructions} onChange={handleChange}
                  rows={5} placeholder={"Bring water to a boil.\nAdd lemongrass and ginger.\nSimmer 10 minutes.\nStrain and serve."}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green font-mono text-sm" />
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Benefits <span className="font-normal text-gray-500">(one per line)</span></label>
                <textarea name="benefits" value={form.benefits} onChange={handleChange}
                  rows={3} placeholder={"Aids digestion\nReduces inflammation\nCalming"}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green font-mono text-sm" />
              </div>

              {/* Caution */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Caution / Safety Notes</label>
                <input name="caution" value={form.caution} onChange={handleChange}
                  placeholder="e.g. Avoid during pregnancy. May interact with blood thinners."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
              </div>

              {/* Storage */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Storage Notes</label>
                <input name="storageNotes" value={form.storageNotes} onChange={handleChange}
                  placeholder="e.g. Refrigerate up to 5 days. Freeze for longer storage."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="bg-garden-green-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-garden-green transition-colors disabled:opacity-50">
                  {saving ? "Saving…" : "💾 Save Recipe"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }}
                  className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Type filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveType("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeType === "all"
                ? "bg-garden-green-dark text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:border-garden-green hover:text-garden-green-dark"
            }`}
          >
            All Recipes ({recipes.length})
          </button>
          {typeKeys.map((t) => {
            const info = typeLabels[t];
            const count = recipes.filter((r) => r.type === t).length;
            return (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeType === t
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
          {filtered.length} recipe{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Recipe cards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">🌿</div>
            <p className="text-lg">No recipes match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((recipe) => {
              const typeInfo = typeLabels[recipe.type] || { label: recipe.type, emoji: "🌱", color: "bg-gray-100 text-gray-700" };
              return (
                <div key={recipe.id} className="relative flex flex-col">
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  {/* Colored category strip */}
                  <div className={`flex items-center justify-between gap-2 px-4 py-3 ${typeInfo.color}`}>
                    <span className="text-sm font-semibold">
                      {typeInfo.emoji} {typeInfo.label}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${difficultyColor[recipe.difficulty] || "bg-white/70 text-gray-700"}`}>
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-heading font-bold text-garden-green-dark text-lg mb-2 group-hover:text-garden-green transition-colors leading-snug">
                      {recipe.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-1">{recipe.description}</p>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span>⏱ {recipe.prepTime}</span>
                      {recipe.steepTime && <span>• 🫖 {recipe.steepTime}</span>}
                      <span>• {recipe.yield}</span>
                    </div>

                    {/* Plants */}
                    <div className="flex flex-wrap gap-1">
                      {recipe.plants.slice(0, 4).map((p) => (
                        <span key={p} className="text-xs bg-garden-green-pale/40 text-garden-green-dark px-2 py-0.5 rounded-full">
                          {p}
                        </span>
                      ))}
                      {recipe.plants.length > 4 && (
                        <span className="text-xs text-gray-400">+{recipe.plants.length - 4} more</span>
                      )}
                    </div>
                  </div>
                </Link>
                {isAdmin && (
                  <button
                    onClick={async () => {
                      if (!confirm(`Delete "${recipe.name}"?`)) return;
                      const res = await fetch(`/api/recipes?id=${recipe.id}`, {
                        method: "DELETE",
                        headers: { "x-admin-password": adminPassword },
                      });
                      if (res.ok) setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
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
