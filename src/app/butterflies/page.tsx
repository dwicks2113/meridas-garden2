"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import butterfliesData from "@/data/butterflies.json";
import BoxerLogo from "@/components/BoxerLogo";

interface PlantRef {
  name: string;
  plantId?: string;
}

interface Butterfly {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  wingspan: string;
  description: string;
  image: string;
  caterpillar: {
    description: string;
    image: string;
  };
  hostPlants: PlantRef[];
  nectarPlants: PlantRef[];
  bestSeasons: string[];
  notes?: string;
}

const familyInfo: Record<string, { label: string; emoji: string; color: string }> = {
  Nymphalidae:  { label: "Brush-foots",     emoji: "🦋", color: "bg-orange-100 text-orange-800" },
  Papilionidae: { label: "Swallowtails",    emoji: "🦋", color: "bg-yellow-100 text-yellow-800" },
  Pieridae:     { label: "Whites & Sulphurs", emoji: "🦋", color: "bg-lime-100 text-lime-800" },
  Lycaenidae:   { label: "Gossamer-wings",  emoji: "🦋", color: "bg-sky-100 text-sky-800" },
  Hesperiidae:  { label: "Skippers",        emoji: "🦋", color: "bg-amber-100 text-amber-800" },
};

export default function ButterfliesPage() {
  const [search, setSearch] = useState("");
  const [activeFamily, setActiveFamily] = useState<string>("all");

  const butterflies = butterfliesData as Butterfly[];

  const filtered = useMemo(() => {
    let list = butterflies;
    if (activeFamily !== "all") list = list.filter((b) => b.family === activeFamily);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.scientificName.toLowerCase().includes(q) ||
          b.hostPlants.some((p) => p.name.toLowerCase().includes(q)) ||
          b.nectarPlants.some((p) => p.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [butterflies, search, activeFamily]);

  const familyKeys = Object.keys(familyInfo);
  const familyCounts = familyKeys.reduce<Record<string, number>>((acc, k) => {
    acc[k] = butterflies.filter((b) => b.family === k).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Header */}
      <div className="bg-gradient-to-br from-garden-green-dark via-garden-green to-garden-sky py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <BoxerLogo size={90} showBee showButterfly />
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                🦋 Butterflies of Zone 10b
              </h1>
              <p className="text-garden-green-pale text-lg max-w-2xl">
                Butterflies you&apos;re likely to see in Pinellas County gardens — with
                their caterpillar forms, host plants, and favorite nectar plants.
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
            placeholder="Search butterflies, scientific names, or plants…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
          />
        </div>

        {/* Family filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveFamily("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              activeFamily === "all"
                ? "bg-garden-green-dark text-white"
                : "bg-white text-garden-green-dark border border-garden-green-dark/30 hover:bg-garden-green-pale/40"
            }`}
          >
            All ({butterflies.length})
          </button>
          {familyKeys.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFamily(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeFamily === f
                  ? "bg-garden-green-dark text-white"
                  : "bg-white text-garden-green-dark border border-garden-green-dark/30 hover:bg-garden-green-pale/40"
              }`}
            >
              {familyInfo[f].label} ({familyCounts[f] || 0})
            </button>
          ))}
        </div>

        {/* Count */}
        <p className="text-sm text-gray-600 mb-4">
          Showing {filtered.length} {filtered.length === 1 ? "butterfly" : "butterflies"}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((b) => {
            const fam = familyInfo[b.family] || { label: b.family, emoji: "🦋", color: "bg-gray-100 text-gray-700" };
            return (
              <Link
                key={b.id}
                href={`/butterflies/${b.id}`}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-garden-earth-pale/60"
              >
                <div className="relative h-48 bg-garden-green-pale/30 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.image}
                    alt={b.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${fam.color}`}>
                      {fam.label}
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
                    <span>📏 {b.wingspan}</span>
                    <span className="text-garden-green group-hover:translate-x-0.5 transition-transform">
                      Details →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            No butterflies match your search. Try clearing filters.
          </div>
        )}
      </div>
    </div>
  );
}
