import Link from "next/link";
import { notFound } from "next/navigation";
import hacksData from "@/data/hacks.json";
import PrintButton from "@/components/PrintButton";

interface Hack {
  id: string;
  name: string;
  category: string;
  description: string;
  materials: string[];
  instructions: string[];
  addedAt: string;
}

const categoryLabels: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
  "pest-control":         { label: "Pest Control",        emoji: "🐛", bg: "bg-red-50",    text: "text-red-800"    },
  "soil-fertilizer":      { label: "Soil & Fertilizer",   emoji: "🪱", bg: "bg-amber-50",  text: "text-amber-800"  },
  "watering":             { label: "Watering",            emoji: "💧", bg: "bg-blue-50",   text: "text-blue-800"   },
  "companion-planting":   { label: "Companion Planting",  emoji: "🌻", bg: "bg-yellow-50", text: "text-yellow-800" },
  "weather-wisdom":       { label: "Weather Wisdom",      emoji: "🌦️", bg: "bg-sky-50",    text: "text-sky-800"    },
  "seed-starting":        { label: "Seed Starting",       emoji: "🌱", bg: "bg-green-50",  text: "text-green-800"  },
  "harvesting-storage":   { label: "Harvest & Storage",   emoji: "🧺", bg: "bg-orange-50", text: "text-orange-800" },
  "general":              { label: "General",             emoji: "🌿", bg: "bg-teal-50",   text: "text-teal-800"   },
};

export function generateStaticParams() {
  return (hacksData as Hack[]).map((h) => ({ id: h.id }));
}

export const dynamicParams = true;

export default function HackDetailPage({ params }: { params: { id: string } }) {
  const hack = (hacksData as Hack[]).find((h) => h.id === params.id);
  if (!hack) notFound();

  const catInfo = categoryLabels[hack.category] || { label: hack.category, emoji: "🌱", bg: "bg-gray-50", text: "text-gray-700" };

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Back nav */}
      <div className="no-print bg-white border-b border-gray-200 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link href="/hacks" className="text-garden-green hover:text-garden-green-dark text-sm font-medium flex items-center gap-1">
            ← Back to Garden Hacks
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className={`px-6 py-8 ${catInfo.bg}`}>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white/70 ${catInfo.text} mb-3`}>
              {catInfo.emoji} {catInfo.label}
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-garden-green-dark leading-tight">
              {hack.name}
            </h1>
          </div>
          <div className="px-6 py-5">
            <p className="text-gray-700 leading-relaxed text-lg">{hack.description}</p>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: instructions (wider) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-4 flex items-center gap-2">
                📋 Instructions
              </h2>
              <ol className="space-y-4">
                {hack.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-garden-green-dark text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed pt-0.5">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: materials sidebar */}
          <div className="space-y-5">
            {hack.materials && hack.materials.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-heading font-bold text-garden-green-dark mb-3 flex items-center gap-2">
                  🧰 What You&apos;ll Need
                </h3>
                <ul className="space-y-2">
                  {hack.materials.map((m, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700 text-sm">
                      <span className="mt-1 w-5 h-5 rounded-full bg-garden-green-pale/60 text-garden-green-dark text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="no-print mt-10 text-center">
          <Link href="/hacks"
            className="inline-flex items-center gap-2 bg-garden-green-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-garden-green transition-colors">
            ← Browse All Garden Hacks
          </Link>
        </div>
      </div>
    </div>
  );
}
