"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import pestsData from "@/data/pests.json";

type Treatment = {
  method: string;
  type: string;
  instructions: string;
};

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
  treatments: Treatment[];
  prevention: string;
  quickTip: string;
};

const allPests: Pest[] = pestsData as Pest[];

const severityColors: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const treatmentTypeColors: Record<string, string> = {
  organic: "bg-green-50 border-green-200 text-green-800",
  chemical: "bg-blue-50 border-blue-200 text-blue-800",
  prevention: "bg-purple-50 border-purple-200 text-purple-800",
  biological: "bg-teal-50 border-teal-200 text-teal-800",
  cultural: "bg-amber-50 border-amber-200 text-amber-800",
};

const treatmentTypeIcons: Record<string, string> = {
  organic: "🌿",
  chemical: "🧪",
  prevention: "🛡️",
  biological: "🐞",
  cultural: "🌱",
};

function TreatmentCard({ treatment }: { treatment: Treatment }) {
  const [open, setOpen] = useState(false);
  const colorClass = treatmentTypeColors[treatment.type] || "bg-gray-50 border-gray-200 text-gray-800";
  const icon = treatmentTypeIcons[treatment.type] || "💊";

  return (
    <div className={`rounded-xl border ${colorClass} overflow-hidden`}>
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="font-semibold">{treatment.method}</p>
            <span className="text-xs capitalize opacity-75">{treatment.type} treatment</span>
          </div>
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-current/10">
          <p className="text-sm mt-3 leading-relaxed">{treatment.instructions}</p>
        </div>
      )}
    </div>
  );
}

export default function PestDetailPage({ params }: { params: { id: string } }) {
  const pest = allPests.find((p) => p.id === params.id);
  const [imgError, setImgError] = useState(false);

  if (!pest) notFound();

  const organicTreatments = pest.treatments.filter((t) => t.type === "organic");
  const otherTreatments = pest.treatments.filter((t) => t.type !== "organic");

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-800 to-amber-600 py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/pests" className="text-amber-200 hover:text-white text-sm flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Pests
          </Link>
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full capitalize">
                  {pest.category}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full border capitalize font-medium ${severityColors[pest.severity]}`}>
                  {pest.severity} severity
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-1">
                {pest.name}
              </h1>
              <p className="text-amber-200 italic text-sm">{pest.scientificName}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo */}
            <div className="rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-56 bg-gradient-to-br from-amber-50 to-orange-100">
                {!imgError ? (
                  <Image
                    src={pest.image}
                    alt={pest.name}
                    fill
                    className="object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-amber-600/50">
                    <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Drop photo in<br /><code className="text-xs">public/images/pests/</code></p>
                    <p className="text-xs">as <code>{pest.id}.jpg</code></p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick tip */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="font-semibold text-amber-800 text-sm mb-1">💡 Quick Tip</p>
              <p className="text-amber-700 text-sm">{pest.quickTip}</p>
            </div>

            {/* Affected plants */}
            <div className="card p-5">
              <h3 className="font-heading font-bold text-garden-green-dark mb-3">Affected Plants</h3>
              <div className="flex flex-wrap gap-2">
                {pest.affectedPlants.map((p) => (
                  <span key={p} className="text-xs bg-garden-earth-pale text-garden-earth-dark px-2 py-1 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Prevention */}
            <div className="card p-5">
              <h3 className="font-heading font-bold text-garden-green-dark mb-3">🛡️ Prevention</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{pest.prevention}</p>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-garden-green-dark text-xl mb-3">About This Pest</h2>
              <p className="text-gray-700 leading-relaxed">{pest.description}</p>
            </div>

            {/* Symptoms */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-garden-green-dark text-xl mb-4">⚠️ Symptoms to Watch For</h2>
              <ul className="space-y-2">
                {pest.symptoms.map((symptom, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      !
                    </span>
                    <span className="text-sm text-gray-700">{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Treatments */}
            <div className="card p-6">
              <h2 className="font-heading font-bold text-garden-green-dark text-xl mb-2">Treatment Options</h2>
              <p className="text-sm text-gray-500 mb-4">Click a treatment to expand instructions. Start with organic options first.</p>

              {organicTreatments.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-2">🌿 Organic / Natural</p>
                  <div className="space-y-3">
                    {organicTreatments.map((t, i) => (
                      <TreatmentCard key={i} treatment={t} />
                    ))}
                  </div>
                </div>
              )}

              {otherTreatments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Other Options</p>
                  <div className="space-y-3">
                    {otherTreatments.map((t, i) => (
                      <TreatmentCard key={i} treatment={t} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Back link */}
            <Link href="/pests"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to all pests
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
