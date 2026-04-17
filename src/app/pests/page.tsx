"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import pestsData from "@/data/pests.json";
import BoxerLogo from "@/components/BoxerLogo";

type Pest = {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  severity: string;
  description: string;
  image: string;
  affectedPlants: string[];
  symptoms: string[];
  treatments: { method: string; type: string; instructions: string }[];
  prevention: string;
  quickTip: string;
};

const allPests: Pest[] = pestsData as Pest[];

const categoryLabels: Record<string, string> = {
  all: "All Pests",
  insects: "Insects",
  arachnids: "Arachnids",
  mollusks: "Mollusks",
  fungal: "Fungal Diseases",
};

const severityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  moderate: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const categoryColors: Record<string, string> = {
  insects: "bg-amber-100 text-amber-800",
  arachnids: "bg-red-100 text-red-700",
  mollusks: "bg-blue-100 text-blue-700",
  fungal: "bg-purple-100 text-purple-800",
};

function PestCard({ pest }: { pest: Pest }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-100">
        {!imgError ? (
          <Image
            src={pest.image}
            alt={pest.name}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-amber-700/50">
              <svg className="w-12 h-12 mx-auto mb-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-xs">Photo coming soon</p>
            </div>
          </div>
        )}
        <span className={`badge absolute top-3 left-3 ${categoryColors[pest.category] || "bg-gray-100 text-gray-700"}`}>
          {pest.category}
        </span>
        <span className={`badge absolute top-3 right-3 ${severityColors[pest.severity] || "bg-gray-100 text-gray-700"}`}>
          {pest.severity}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-heading font-bold text-garden-green-dark">{pest.name}</h3>
        <p className="text-xs text-garden-earth italic mb-2">{pest.scientificName}</p>
        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">{pest.description}</p>

        {/* Affected plants */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">Affects:</p>
          <div className="flex flex-wrap gap-1">
            {pest.affectedPlants.slice(0, 4).map((p) => (
              <span key={p} className="text-xs bg-garden-earth-pale text-garden-earth-dark px-2 py-0.5 rounded-full">
                {p}
              </span>
            ))}
            {pest.affectedPlants.length > 4 && (
              <span className="text-xs text-gray-400">+{pest.affectedPlants.length - 4} more</span>
            )}
          </div>
        </div>

        <Link href={`/pests/${pest.id}`} className="btn-primary text-center text-sm mt-auto">
          View Treatments
        </Link>
      </div>
    </div>
  );
}

export default function PestsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return allPests.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.scientificName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.affectedPlants.some((pl) => pl.toLowerCase().includes(q)) ||
        p.symptoms.some((s) => s.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const categories = ["all", "insects", "arachnids", "mollusks", "fungal"];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-800 to-amber-600 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <BoxerLogo size={90} showBee />
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                Garden Pests & Diseases
              </h1>
              <p className="text-lg text-amber-100 max-w-2xl">
                {allPests.length} common pests and diseases in Zone 10b — how to identify,
                treat, and prevent them in your Clearwater garden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="py-10 md:py-16 bg-garden-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search + category row */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search pests, affected plants, or symptoms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-garden-green/40 bg-white"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat
                      ? "bg-amber-700 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-amber-400"
                  }`}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-500 mb-6">
            Showing {filtered.length} of {allPests.length} pests
            {category !== "all" && ` in ${categoryLabels[category]}`}
            {search && ` matching "${search}"`}
          </p>

          {/* Quick tip callout */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3">
            <span className="text-2xl">&#x1F4A1;</span>
            <div>
              <p className="font-semibold text-amber-800 text-sm">Florida Pest Tip</p>
              <p className="text-amber-700 text-sm">
                Florida&apos;s warm, humid climate means pests are active year-round. Weekly plant
                inspections — especially the undersides of leaves — are your best defense. Catch
                problems early when they&apos;re easiest to treat organically.
              </p>
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((pest) => (
                <PestCard key={pest.id} pest={pest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No pests found matching your search.</p>
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
    </>
  );
}
