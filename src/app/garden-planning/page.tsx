"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import plansData from "@/data/gardenPlans.json";
import BoxerLogo from "@/components/BoxerLogo";

interface Plant {
  plantId: string;
  displayName: string;
  count: number;
  x: number;
  y: number;
  color: string;
  role: string;
}

interface GardenPlan {
  id: string;
  name: string;
  focus: "butterflies" | "bees" | "both";
  size: "small" | "medium" | "large";
  sizeLabel: string;
  difficulty: string;
  sun: string;
  water: string;
  description: string;
  dimensions: { width: number; height: number; unit: string };
  plants: Plant[];
  attractsButterflies: string[];
  attractsBees: string[];
  tips: string[];
  notes?: string;
}

const FOCUS_LABEL: Record<string, string> = {
  butterflies: "Butterflies",
  bees: "Bees",
  both: "Butterflies & Bees",
};

const FOCUS_BADGE: Record<string, string> = {
  butterflies: "bg-indigo-100 text-indigo-800 border-indigo-200",
  bees: "bg-amber-100 text-amber-800 border-amber-200",
  both: "bg-gradient-to-r from-indigo-100 to-amber-100 text-garden-green-dark border-garden-green-pale",
};

const SIZE_BADGE: Record<string, string> = {
  small: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  large: "bg-purple-50 text-purple-700 border-purple-200",
};

function MiniLayout({ plan }: { plan: GardenPlan }) {
  return (
    <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-garden-green-pale/40 to-garden-earth-pale/40 rounded-lg border border-garden-earth-pale overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,#86efac_0,transparent_40%),radial-gradient(circle_at_80%_70%,#fde68a_0,transparent_40%)]" />
      {plan.plants.map((p, idx) => (
        <div
          key={idx}
          className="absolute rounded-full border border-white/70 shadow-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${Math.min(14, 6 + p.count * 1.2)}%`,
            height: `${Math.min(14, 6 + p.count * 1.2)}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: p.color,
          }}
          title={`${p.displayName} (${p.count})`}
        />
      ))}
    </div>
  );
}

export default function GardenPlanningPage() {
  const [focus, setFocus] = useState<"all" | "butterflies" | "bees" | "both">("all");

  const plans = plansData as GardenPlan[];

  const filtered = useMemo(() => {
    if (focus === "all") return plans;
    if (focus === "both") return plans.filter((p) => p.focus === "both");
    // For butterflies or bees, show plans whose focus is that specific focus OR "both"
    return plans.filter((p) => p.focus === focus || p.focus === "both");
  }, [plans, focus]);

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Header */}
      <div className="bg-gradient-to-br from-garden-green-dark via-garden-green to-garden-green-light py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <BoxerLogo size={90} showBee showButterfly />
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                🌻 Pollinator Garden Plans
              </h1>
              <p className="text-garden-green-pale text-lg max-w-2xl">
                Ready-made layouts with plant lists, designed for Zone 10b /
                Pinellas County — pick the one that fits your space.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter toggle */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "all", label: `All Plans (${plans.length})` },
            { key: "butterflies", label: "🦋 For Butterflies" },
            { key: "bees", label: "🐝 For Bees" },
            { key: "both", label: "🦋 + 🐝 Both" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFocus(f.key as typeof focus)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                focus === f.key
                  ? "bg-garden-green-dark text-white"
                  : "bg-white text-garden-green-dark border border-garden-green-pale hover:bg-garden-green-pale/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Showing {filtered.length} {filtered.length === 1 ? "plan" : "plans"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((plan) => (
            <Link
              key={plan.id}
              href={`/garden-planning/${plan.id}`}
              className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-garden-earth-pale/60 flex flex-col"
            >
              <div className="p-5 pb-0">
                <MiniLayout plan={plan} />
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-heading font-bold text-garden-green-dark text-lg group-hover:text-garden-green transition-colors">
                    {plan.name}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${FOCUS_BADGE[plan.focus]}`}>
                    {FOCUS_LABEL[plan.focus]}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SIZE_BADGE[plan.size]}`}>
                    {plan.sizeLabel}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-gray-50 text-gray-700 border-gray-200 capitalize">
                    {plan.difficulty}
                  </span>
                </div>

                <p className="text-sm text-gray-700 line-clamp-3 mb-4">{plan.description}</p>

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <span>
                    {plan.plants.length} plants ·{" "}
                    {plan.attractsButterflies.length} butterflies ·{" "}
                    {plan.attractsBees.length} bees
                  </span>
                  <span className="text-garden-green-dark group-hover:translate-x-0.5 transition-transform font-semibold">
                    View plan →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-16">
            No plans match this filter.
          </div>
        )}

        {/* Intro / help section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6 border-l-4 border-garden-bloom">
          <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-3">
            🌱 How to use these plans
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-garden-green mt-0.5">1.</span>
              <span>
                <strong>Pick the plan that fits your space.</strong> Start small — a
                pollinator patio pot works on any balcony.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-garden-green mt-0.5">2.</span>
              <span>
                <strong>Click into the plan</strong> to see the full layout diagram,
                plant list, and which butterflies and bees you can expect to visit.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-garden-green mt-0.5">3.</span>
              <span>
                <strong>Every plant links back</strong> to its full database entry —
                care instructions, photos, companions, and more.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-garden-green mt-0.5">4.</span>
              <span>
                <strong>Expect year 1 to be slow.</strong> Most pollinators take a full
                season to find a new garden. Year 2 and onward explode.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
