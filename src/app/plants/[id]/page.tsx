"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Plant } from "@/lib/types";
import plantsData from "@/data/plants.json";
import medicinalData from "@/data/medicinal.json";

const allPlants: Plant[] = [...(plantsData as Plant[]), ...(medicinalData as Plant[])];

const categoryColors: Record<string, string> = {
  flowers: "bg-pink-100 text-pink-800",
  "edible-flowers": "bg-orange-100 text-orange-800",
  vegetables: "bg-green-100 text-green-800",
  fruits: "bg-purple-100 text-purple-800",
  medicinal: "bg-teal-100 text-teal-800",
};

export default function PlantDetailPage() {
  const { id } = useParams();
  const plant = allPlants.find((p) => p.id === id);
  const [imgError, setImgError] = useState(false);
  const [openRecipe, setOpenRecipe] = useState<number | null>(null);

  if (!plant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Plant not found</h1>
        <Link href="/plants" className="btn-primary">Back to Plant Database</Link>
      </div>
    );
  }

  const isMedicinal = plant.category === "medicinal";

  return (
    <>
      <section className="bg-gradient-to-br from-garden-green-dark to-garden-green py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/plants" className="text-garden-green-pale hover:text-white text-sm inline-flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Plant Database
          </Link>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-garden-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Image + Quick Info */}
            <div className="lg:col-span-2">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-garden-green-pale to-garden-green-light/30 mb-4">
                {!imgError ? (
                  <Image src={plant.image} alt={plant.name} fill className="object-cover"
                    onError={() => setImgError(true)} />
                ) : (
                  <div className="flex items-center justify-center h-full text-garden-green-dark/40">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Add a photo at</p>
                      <code className="text-xs bg-white/60 px-2 py-1 rounded">{plant.image}</code>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick stats card */}
              <div className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Category</span>
                  <span className={`badge ${categoryColors[plant.category]}`}>
                    {plant.category.replace("-", " ")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Sun</span>
                  <span className="text-sm">{plant.sun}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Water</span>
                  <span className="text-sm">{plant.water}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 block mb-1">Best Planting Months</span>
                  <div className="flex flex-wrap gap-1">
                    {plant.plantingMonths.map((m) => (
                      <span key={m} className="text-xs bg-garden-green-pale text-garden-green-dark px-2 py-1 rounded-full">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Timeline</span>
                  <span className="text-sm text-right">{plant.daysToBloom}</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-garden-green-dark">{plant.name}</h1>
                <p className="text-garden-earth italic mt-1">{plant.scientificName}</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-2">About</h2>
                <p className="text-gray-700 leading-relaxed">{plant.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-2">Care Notes</h2>
                <p className="text-gray-700 leading-relaxed">{plant.careNotes}</p>
              </div>

              {/* Medicinal Uses */}
              {isMedicinal && plant.medicinalUses && (
                <div>
                  <h2 className="text-xl font-heading font-bold text-teal-700 mb-3">Medicinal Uses</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {plant.medicinalUses.map((use) => (
                      <div key={use} className="flex items-center gap-2 bg-teal-50 rounded-lg px-4 py-2">
                        <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-teal-800">{use}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipes */}
              {isMedicinal && plant.recipes && plant.recipes.length > 0 && (
                <div>
                  <h2 className="text-xl font-heading font-bold text-teal-700 mb-4">Recipes & Preparations</h2>
                  <div className="space-y-4">
                    {plant.recipes.map((recipe, idx) => (
                      <div key={idx} className="card overflow-hidden">
                        <button onClick={() => setOpenRecipe(openRecipe === idx ? null : idx)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-teal-50/50 transition-colors">
                          <h3 className="font-semibold text-garden-green-dark">{recipe.name}</h3>
                          <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openRecipe === idx ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {openRecipe === idx && (
                          <div className="px-6 pb-6 space-y-4">
                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-2">Ingredients</h4>
                              <ul className="space-y-1">
                                {recipe.ingredients.map((ing, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="text-teal-500 mt-1">&#x2022;</span>
                                    {ing}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-sm text-gray-700 mb-2">Instructions</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">{recipe.instructions}</p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                              <h4 className="font-semibold text-sm text-amber-800 mb-1">Caution</h4>
                              <p className="text-sm text-amber-700">{recipe.caution}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
