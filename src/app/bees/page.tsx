"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import beesData from "@/data/bees.json";
import BoxerLogo from "@/components/BoxerLogo";
import SafeImage from "@/components/SafeImage";

interface PlantRef {
  name: string;
  plantId?: string;
}

interface Bee {
  id: string;
  name: string;
  scientificName: string;
  type: "social" | "solitary";
  native: boolean;
  size: string;
  description: string;
  image: string;
  activeSeasons: string[];
  favoritePlants: PlantRef[];
  notes?: string;
  funFact?: string;
}

export default function BeesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "native" | "social" | "solitary">("all");

  const bees = beesData as Bee[];

  const filtered = useMemo(() => {
    let list = bees;
    if (filter === "native") list = list.filter((b) => b.native);
    if (filter === "social") list = list.filter((b) => b.type === "social");
    if (filter === "solitary") list = list.filter((b) => b.type === "solitary");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.scientificName.toLowerCase().includes(q) ||
          b.favoritePlants.some((p) => p.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [bees, search, filter]);

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-600 via-garden-sun to-yellow-500 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <BoxerLogo size={90} showBee showButterfly />
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                🐝 Bees of Zone 10b
              </h1>
              <p className="text-amber-50 text-lg max-w-2xl">
                Honeybees, bumblebees, and the native solitary bees you share your
                Pinellas County garden with — and the plants they love.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search bees, scientific names, or plants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: "all", label: `All (${bees.length})` },
            { key: "native", label: `Native (${bees.filter((b) => b.native).length})` },
            { key: "solitary", label: `Solitary (${bees.filter((b) => b.type === "solitary").length})` },
            { key: "social", label: `Social (${bees.filter((b) => b.type === "social").length})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === f.key
                  ? "bg-amber-600 text-white"
                  : "bg-white text-amber-700 border border-amber-300 hover:bg-amber-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Showing {filtered.length} {filtered.length === 1 ? "bee" : "bees"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b) => (
            <Link
              key={b.id}
              href={`/bees/${b.id}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-garden-earth-pale/60"
            >
              <div className="relative h-48 bg-amber-50 overflow-hidden">
                <SafeImage
                  src={b.image}
                  alt={b.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    b.native ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                  }`}>
                    {b.native ? "Native" : "Non-native"}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    {b.type === "social" ? "Social" : "Solitary"}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-bold text-garden-green-dark text-lg mb-1 group-hover:text-garden-green transition-colors">
                  {b.name}
                </h3>
                <p className="text-xs italic text-gray-500 mb-3">{b.scientificName}</p>
                <p className="text-sm text-gray-700 line-clamp-3 mb-3">{b.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-100">
                  <span>📏 {b.size}</span>
                  <span className="text-amber-700 group-hover:translate-x-0.5 transition-transform">
                    Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            No bees match your search. Try clearing filters.
          </div>
        )}
      </div>
    </div>
  );
}
