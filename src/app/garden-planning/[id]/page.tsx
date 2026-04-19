import Link from "next/link";
import { notFound } from "next/navigation";
import plansData from "@/data/gardenPlans.json";
import butterfliesData from "@/data/butterflies.json";
import beesData from "@/data/bees.json";

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
  size: string;
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

interface Butterfly {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  image: string;
}

interface Bee {
  id: string;
  name: string;
  scientificName: string;
  image: string;
}

const ROLE_LABEL: Record<string, { label: string; color: string; icon: string }> = {
  structure:  { label: "Structure / Backbone",  color: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: "🌳" },
  nectar:     { label: "Nectar Flowers",        color: "bg-pink-50 text-pink-800 border-pink-200",           icon: "🌸" },
  host:       { label: "Host Plants",           color: "bg-amber-50 text-amber-800 border-amber-200",        icon: "🐛" },
  ground:     { label: "Groundcover",           color: "bg-sky-50 text-sky-800 border-sky-200",              icon: "🌿" },
  edible:     { label: "Edibles",               color: "bg-red-50 text-red-800 border-red-200",              icon: "🥕" },
  herb:       { label: "Herbs",                 color: "bg-violet-50 text-violet-800 border-violet-200",     icon: "🌱" },
};

export function generateStaticParams() {
  return (plansData as GardenPlan[]).map((p) => ({ id: p.id }));
}

export default function GardenPlanDetailPage({ params }: { params: { id: string } }) {
  const plan = (plansData as GardenPlan[]).find((p) => p.id === params.id);
  if (!plan) notFound();

  const butterflies = butterfliesData as Butterfly[];
  const bees = beesData as Bee[];

  const attractedButterflies = plan.attractsButterflies
    .map((id) => butterflies.find((b) => b.id === id))
    .filter(Boolean) as Butterfly[];

  const attractedBees = plan.attractsBees
    .map((id) => bees.find((b) => b.id === id))
    .filter(Boolean) as Bee[];

  // Group plants by role
  const byRole = plan.plants.reduce<Record<string, Plant[]>>((acc, p) => {
    if (!acc[p.role]) acc[p.role] = [];
    acc[p.role].push(p);
    return acc;
  }, {});

  const roleOrder = ["structure", "host", "nectar", "herb", "edible", "ground"];
  const sortedRoles = roleOrder.filter((r) => byRole[r]?.length);

  return (
    <div className="min-h-screen bg-garden-cream">
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/garden-planning" className="text-garden-green-dark hover:text-garden-green text-sm font-medium flex items-center gap-1">
            ← Back to Garden Plans
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title + meta */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-garden-green-dark mb-3">
            {plan.name}
          </h1>
          <p className="text-lg text-gray-700 mb-4">{plan.description}</p>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="bg-white rounded-lg border border-garden-earth-pale px-3 py-2">
              <p className="text-xs text-gray-500 leading-none mb-0.5">Focus</p>
              <p className="font-semibold text-garden-green-dark capitalize">{plan.focus === "both" ? "Butterflies & Bees" : plan.focus}</p>
            </div>
            <div className="bg-white rounded-lg border border-garden-earth-pale px-3 py-2">
              <p className="text-xs text-gray-500 leading-none mb-0.5">Size</p>
              <p className="font-semibold text-garden-green-dark">{plan.sizeLabel}</p>
            </div>
            <div className="bg-white rounded-lg border border-garden-earth-pale px-3 py-2">
              <p className="text-xs text-gray-500 leading-none mb-0.5">Difficulty</p>
              <p className="font-semibold text-garden-green-dark capitalize">{plan.difficulty}</p>
            </div>
            <div className="bg-white rounded-lg border border-garden-earth-pale px-3 py-2">
              <p className="text-xs text-gray-500 leading-none mb-0.5">Sun</p>
              <p className="font-semibold text-garden-green-dark">{plan.sun}</p>
            </div>
            <div className="bg-white rounded-lg border border-garden-earth-pale px-3 py-2">
              <p className="text-xs text-gray-500 leading-none mb-0.5">Water</p>
              <p className="font-semibold text-garden-green-dark">{plan.water}</p>
            </div>
          </div>
        </div>

        {/* Layout diagram */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-4 flex items-center gap-2">
            📐 Layout Diagram
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Numbers on circles show plant count. Circle size is proportional to
            mature spread.
          </p>
          <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-garden-green-pale/40 to-garden-earth-pale/40 rounded-xl border-2 border-garden-earth-pale overflow-hidden">
            {/* Subtle grid */}
            <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="10%" height="10%" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#c5d7bd" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Sun indicator */}
            <div className="absolute top-2 right-3 text-2xl opacity-70">☀️</div>
            <div className="absolute bottom-2 left-3 text-xs text-gray-600 font-semibold bg-white/80 px-2 py-0.5 rounded">
              ↑ Back of bed
            </div>

            {/* Plants */}
            {plan.plants.map((p, idx) => {
              const sizePct = Math.min(16, 7 + p.count * 1.5);
              return (
                <div
                  key={idx}
                  className="absolute flex items-center justify-center rounded-full border-2 border-white shadow-md text-white font-bold text-xs"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${sizePct}%`,
                    height: `${sizePct}%`,
                    transform: "translate(-50%, -50%)",
                    backgroundColor: p.color,
                    minWidth: "32px",
                    minHeight: "32px",
                  }}
                  title={`${p.displayName} — ${p.count} plant${p.count === 1 ? "" : "s"} (${p.role})`}
                >
                  {p.count > 1 ? `×${p.count}` : ""}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {plan.plants.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-white/70 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-gray-700 truncate">
                  {p.displayName}
                  {p.count > 1 && <span className="text-gray-500"> ×{p.count}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plant list grouped by role */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-4 flex items-center gap-2">
            🌱 Plant List
          </h2>
          <div className="space-y-5">
            {sortedRoles.map((role) => (
              <div key={role}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{ROLE_LABEL[role]?.icon}</span>
                  <h3 className="font-heading font-bold text-garden-green-dark">
                    {ROLE_LABEL[role]?.label ?? role}
                  </h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ROLE_LABEL[role]?.color ?? "bg-gray-50 text-gray-700 border-gray-200"}`}>
                    {byRole[role].reduce((sum, p) => sum + p.count, 0)} plant{byRole[role].reduce((sum, p) => sum + p.count, 0) === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="space-y-1 ml-7">
                  {byRole[role].map((p, idx) => (
                    <li key={idx} className="text-sm flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      <Link
                        href={`/plants/${p.plantId}`}
                        className="text-garden-green-dark hover:text-garden-green underline decoration-dotted underline-offset-2"
                      >
                        {p.displayName}
                      </Link>
                      {p.count > 1 && (
                        <span className="text-gray-500 text-xs">× {p.count}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {plan.tips.length > 0 && (
          <div className="bg-garden-sun/10 border border-garden-sun/30 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-heading font-bold text-garden-earth-dark mb-3 flex items-center gap-2">
              💡 Gardener&apos;s Tips
            </h2>
            <ul className="space-y-2">
              {plan.tips.map((tip, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-garden-earth mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Attracted butterflies */}
        {attractedButterflies.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border-t-4 border-indigo-400">
            <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-1 flex items-center gap-2">
              🦋 Butterflies this plan attracts
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {attractedButterflies.length} species expected to visit this garden.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {attractedButterflies.map((b) => (
                <Link
                  key={b.id}
                  href={`/butterflies/${b.id}`}
                  className="group bg-garden-cream rounded-lg p-3 hover:bg-indigo-50 transition-colors border border-garden-earth-pale/60"
                >
                  <p className="font-semibold text-sm text-garden-green-dark group-hover:text-indigo-700 transition-colors">
                    {b.name}
                  </p>
                  <p className="italic text-xs text-gray-500">{b.scientificName}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Attracted bees */}
        {attractedBees.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border-t-4 border-amber-400">
            <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-1 flex items-center gap-2">
              🐝 Bees this plan attracts
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {attractedBees.length} species expected to forage here.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {attractedBees.map((b) => (
                <Link
                  key={b.id}
                  href={`/bees/${b.id}`}
                  className="group bg-garden-cream rounded-lg p-3 hover:bg-amber-50 transition-colors border border-garden-earth-pale/60"
                >
                  <p className="font-semibold text-sm text-garden-green-dark group-hover:text-amber-700 transition-colors">
                    {b.name}
                  </p>
                  <p className="italic text-xs text-gray-500">{b.scientificName}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {plan.notes && (
          <div className="bg-garden-green-pale/30 border border-garden-green-pale rounded-xl p-5 mb-8">
            <p className="text-sm text-garden-green-dark italic">{plan.notes}</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/garden-planning"
            className="inline-flex items-center gap-2 bg-garden-green-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-garden-green transition-colors"
          >
            ← Browse All Plans
          </Link>
        </div>
      </div>
    </div>
  );
}
