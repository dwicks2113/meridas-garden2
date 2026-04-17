"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PlantCard from "@/components/PlantCard";
import SearchFilter from "@/components/SearchFilter";
import type { Plant, Category } from "@/lib/types";
import plantsData from "@/data/plants.json";
import medicinalData from "@/data/medicinal.json";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SUN_OPTIONS    = ["Full Sun","Full Sun to Partial Shade","Partial Shade","Full Shade"];
const WATER_OPTIONS  = ["Low","Moderate","High"];
const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "flowers",        label: "🌸 Flowers"         },
  { value: "edible-flowers", label: "🌼 Edible Flowers"  },
  { value: "vegetables",     label: "🥦 Vegetables"      },
  { value: "fruits",         label: "🍋 Fruits & Trees"  },
  { value: "medicinal",      label: "🌿 Medicinal Plants" },
];

const emptyForm = {
  name:          "",
  scientificName:"",
  category:      "flowers",
  description:   "",
  sun:           "Full Sun",
  water:         "Moderate",
  plantingMonths:[] as string[],
  daysToBloom:   "",
  careNotes:     "",
  medicinalUses: "",
};

const initialPlants: Plant[] = [
  ...(plantsData as Plant[]),
  ...(medicinalData as Plant[]),
];

function PlantsContent() {
  const searchParams   = useSearchParams();
  const initialCategory = (searchParams.get("category") as Category) || "all";

  const [plants, setPlants]       = useState<Plant[]>(initialPlants);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState<Category>(initialCategory);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle"|"success"|"error">("idle");

  useEffect(() => {
    const cat = searchParams.get("category") as Category;
    if (cat && cat !== category) setCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return plants.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.careNotes.toLowerCase().includes(q) ||
        (p.medicinalUses && p.medicinalUses.some((u) => u.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [plants, search, category]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleMonth(month: string) {
    setForm((prev) => ({
      ...prev,
      plantingMonths: prev.plantingMonths.includes(month)
        ? prev.plantingMonths.filter((m) => m !== month)
        : [...prev.plantingMonths, month],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      const { plant } = await res.json();
      setPlants((prev) => [...prev, plant]);
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
    <section className="py-10 md:py-16 bg-garden-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Status banners */}
        {saveStatus === "success" && (
          <div className="mb-5 bg-green-50 border border-green-300 text-green-800 rounded-lg p-4">
            ✅ Plant added successfully!
          </div>
        )}
        {saveStatus === "error" && (
          <div className="mb-5 bg-red-50 border border-red-300 text-red-800 rounded-lg p-4">
            ❌ Failed to save. Please try again.
          </div>
        )}

        {/* Search bar + Add button row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <SearchFilter
              search={search} onSearchChange={setSearch}
              category={category} onCategoryChange={setCategory}
              totalResults={filtered.length}
            />
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setSaveStatus("idle"); }}
            className="sm:self-start bg-garden-green-dark text-white px-5 py-2 rounded-lg font-semibold hover:bg-garden-green transition-colors whitespace-nowrap mt-1"
          >
            {showForm ? "✕ Cancel" : "+ Add New Plant"}
          </button>
        </div>

        {/* ── ADD PLANT FORM ── */}
        {showForm && (
          <div className="bg-white border border-garden-green/30 rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-5">
              Add New Plant
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Plant Name *
                  </label>
                  <input
                    required name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Scarlet Sage"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                  />
                </div>

                {/* Scientific name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Scientific Name
                  </label>
                  <input
                    name="scientificName" value={form.scientificName} onChange={handleChange}
                    placeholder="e.g. Salvia coccinea"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required name="category" value={form.category} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                  >
                    {CATEGORY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sun */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Sun Requirements *
                  </label>
                  <select
                    required name="sun" value={form.sun} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                  >
                    {SUN_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Water */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Water Needs *
                  </label>
                  <select
                    required name="water" value={form.water} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                  >
                    {WATER_OPTIONS.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                {/* Days to bloom/harvest */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Days to Bloom / Harvest
                  </label>
                  <input
                    name="daysToBloom" value={form.daysToBloom} onChange={handleChange}
                    placeholder="e.g. 60-90 days or Year-round"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required name="description" value={form.description} onChange={handleChange}
                  rows={2} placeholder="Brief description of this plant…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                />
              </div>

              {/* Care Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Care Notes *
                </label>
                <textarea
                  required name="careNotes" value={form.careNotes} onChange={handleChange}
                  rows={2} placeholder="Watering, fertilizing, pruning tips…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
                />
              </div>

              {/* Medicinal uses — only shown for medicinal category */}
              {form.category === "medicinal" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Medicinal Uses{" "}
                    <span className="font-normal text-gray-500">(one per line)</span>
                  </label>
                  <textarea
                    name="medicinalUses" value={form.medicinalUses} onChange={handleChange}
                    rows={3}
                    placeholder={"Burns & sunburn relief\nSkin moisturizer\nDigestive aid"}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green font-mono text-sm"
                  />
                </div>
              )}

              {/* Planting Months */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Best Planting Months
                </label>
                <div className="flex flex-wrap gap-2">
                  {MONTHS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMonth(m)}
                      className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                        form.plantingMonths.includes(m)
                          ? "bg-garden-green-dark text-white border-garden-green-dark"
                          : "bg-white text-gray-600 border-gray-300 hover:border-garden-green"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit" disabled={saving}
                  className="bg-garden-green-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-garden-green transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "💾 Save Plant"}
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

        {/* Plant grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {filtered.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No plants found matching your search.</p>
            <button
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="mt-4 text-garden-green hover:text-garden-green-dark underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function PlantsPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-garden-green-dark to-garden-green py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">
            Plant Database
          </h1>
          <p className="text-lg text-garden-green-pale max-w-2xl mx-auto">
            {initialPlants.length} plants suited for USDA Zone 10b in Clearwater, FL.
            Search by name or filter by category.
          </p>
        </div>
      </section>
      <Suspense fallback={
        <div className="py-20 text-center text-gray-400">Loading plants…</div>
      }>
        <PlantsContent />
      </Suspense>
    </>
  );
}
