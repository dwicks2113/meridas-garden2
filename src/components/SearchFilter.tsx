"use client";

import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

interface Props {
  search: string;
  onSearchChange: (val: string) => void;
  category: Category;
  onCategoryChange: (val: Category) => void;
  totalResults: number;
}

const categoryStyles: Record<Category, { active: string; inactive: string }> = {
  all: { active: "bg-gray-700 text-white", inactive: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
  flowers: { active: "bg-pink-600 text-white", inactive: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
  "edible-flowers": { active: "bg-orange-600 text-white", inactive: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
  vegetables: { active: "bg-green-700 text-white", inactive: "bg-green-50 text-green-700 hover:bg-green-100" },
  fruits: { active: "bg-purple-600 text-white", inactive: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
  medicinal: { active: "bg-teal-600 text-white", inactive: "bg-teal-50 text-teal-700 hover:bg-teal-100" },
};

export default function SearchFilter({ search, onSearchChange, category, onCategoryChange, totalResults }: Props) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" placeholder="Search plants by name, description, or care notes..."
          value={search} onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-garden-earth-pale
                     focus:border-garden-green focus:ring-2 focus:ring-garden-green-pale
                     transition-colors bg-white text-sm" />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
          <button key={cat} onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${category === cat ? categoryStyles[cat].active : categoryStyles[cat].inactive}`}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Showing {totalResults} plant{totalResults !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
