"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Plant } from "@/lib/types";

const categoryColors: Record<string, string> = {
  flowers: "bg-pink-100 text-pink-800",
  "edible-flowers": "bg-orange-100 text-orange-800",
  vegetables: "bg-green-100 text-green-800",
  fruits: "bg-purple-100 text-purple-800",
  medicinal: "bg-teal-100 text-teal-800",
};

const waterIcons: Record<string, string> = {
  Low: "&#x1F4A7;",
  Moderate: "&#x1F4A7;&#x1F4A7;",
  High: "&#x1F4A7;&#x1F4A7;&#x1F4A7;",
  "Moderate-High": "&#x1F4A7;&#x1F4A7;",
  "Low-Moderate": "&#x1F4A7;",
};

export default function PlantCard({ plant }: { plant: Plant }) {
  const [imgError, setImgError] = useState(false);
  const isMedicinal = plant.category === "medicinal";

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image / Fallback */}
      <div className="relative h-48 bg-gradient-to-br from-garden-green-pale to-garden-green-light/30">
        {!imgError ? (
          <Image src={plant.image} alt={plant.name} fill className="object-cover"
            onError={() => setImgError(true)} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-garden-green-dark/60">
              <svg className="w-12 h-12 mx-auto mb-1 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">Add photo</p>
            </div>
          </div>
        )}
        <span className={`badge absolute top-3 left-3 ${categoryColors[plant.category] || "bg-gray-100 text-gray-800"}`}>
          {plant.category.replace("-", " ")}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-heading font-bold text-garden-green-dark">{plant.name}</h3>
        <p className="text-xs text-garden-earth italic mb-2">{plant.scientificName}</p>
        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">{plant.description}</p>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="bg-garden-earth-pale rounded-lg px-3 py-2">
            <span className="font-semibold text-garden-earth-dark">Sun:</span> {plant.sun}
          </div>
          <div className="bg-garden-sky-pale rounded-lg px-3 py-2">
            <span className="font-semibold text-garden-sky">Water:</span> {plant.water}
          </div>
          <div className="bg-garden-green-pale rounded-lg px-3 py-2 col-span-2">
            <span className="font-semibold text-garden-green-dark">Plant:</span>{" "}
            {plant.plantingMonths.join(", ")}
          </div>
        </div>

        {/* Medicinal badges */}
        {isMedicinal && plant.medicinalUses && (
          <div className="flex flex-wrap gap-1 mb-3">
            {plant.medicinalUses.slice(0, 3).map((use) => (
              <span key={use} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                {use}
              </span>
            ))}
          </div>
        )}

        <Link href={`/plants/${plant.id}`} className="btn-primary text-center text-sm mt-auto">
          {isMedicinal ? "View Details & Recipes" : "View Details"}
        </Link>
      </div>
    </div>
  );
}
