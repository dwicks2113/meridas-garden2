"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PlantCard from "@/components/PlantCard";
import SearchFilter from "@/components/SearchFilter";
import type { Plant, Category } from "@/lib/types";
import plantsData from "@/data/plants.json";
import medicinalData from "@/data/medicinal.json";

const allPlants: Plant[] = [...(plantsData as Plant[]), ...(medicinalData as Plant[])];

function PlantsContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") as Category) || "all";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>(initialCategory);

  useEffect(() => {
    const cat = searchParams.get("category") as Category;
    if (cat && cat !== category) setCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return allPlants.filter((p) => {
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
  }, [search, category]);

  return (
    <section className="py-10 md:py-16 bg-garden-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchFilter
          search={search} onSearchChange={setSearch}
          category={category} onCategoryChange={setCategory}
          totalResults={filtered.length}
        />
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filtered.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No plants found matching your search.</p>
            <button onClick={() => { setSearch(""); setCategory("all"); }}
              className="mt-4 text-garden-green hover:text-garden-green-dark underline">
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
            {allPlants.length} plants suited for USDA Zone 10b in Clearwater, FL.
            Search by name or filter by category.
          </p>
        </div>
      </section>
      <Suspense fallback={
        <div className="py-20 text-center text-gray-400">Loading plants...</div>
      }>
        <PlantsContent />
      </Suspense>
    </>
  );
}
