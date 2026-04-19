import Link from "next/link";
import { notFound } from "next/navigation";
import beesData from "@/data/bees.json";
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

export function generateStaticParams() {
  return (beesData as Bee[]).map((b) => ({ id: b.id }));
}

export default function BeeDetailPage({ params }: { params: { id: string } }) {
  const bee = (beesData as Bee[]).find((b) => b.id === params.id);
  if (!bee) notFound();

  return (
    <div className="min-h-screen bg-garden-cream">
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/bees" className="text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-1">
            ← Back to Bees
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="relative h-56 md:h-72 bg-amber-50">
            <SafeImage
              src={bee.image}
              alt={bee.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-garden-green-dark">
                  {bee.name}
                </h1>
                <p className="italic text-gray-500 mt-1">{bee.scientificName}</p>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  bee.native ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                }`}>
                  {bee.native ? "Native" : "Non-native"}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                  {bee.type === "social" ? "Social (hive)" : "Solitary"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">📏</span>
                <div>
                  <p className="text-xs text-gray-400 leading-none">Size</p>
                  <p className="font-semibold">{bee.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-xs text-gray-400 leading-none">Active Seasons</p>
                  <p className="font-semibold">{bee.activeSeasons.join(", ")}</p>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed mt-4">{bee.description}</p>
          </div>
        </div>

        {/* Favorite plants */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-t-4 border-garden-bloom">
          <h2 className="text-lg font-heading font-bold text-garden-green-dark mb-1 flex items-center gap-2">
            🌸 Favorite Plants
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Plant these to bring this bee to your garden.
          </p>
          <ul className="space-y-2">
            {bee.favoritePlants.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-garden-green mt-0.5">•</span>
                {p.plantId ? (
                  <Link
                    href={`/plants/${p.plantId}`}
                    className="text-garden-green-dark hover:text-garden-green underline decoration-dotted underline-offset-2"
                  >
                    {p.name}
                  </Link>
                ) : (
                  <span className="text-gray-700">{p.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Notes */}
        {bee.notes && (
          <div className="bg-garden-sun/10 border border-garden-sun/30 rounded-xl p-5 mb-6">
            <h3 className="font-heading font-bold text-garden-earth-dark mb-2 flex items-center gap-2">
              💡 Gardener&apos;s Note
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{bee.notes}</p>
          </div>
        )}

        {/* Fun fact */}
        {bee.funFact && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
            <h3 className="font-heading font-bold text-blue-800 mb-2 flex items-center gap-2">
              ✨ Fun Fact
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed">{bee.funFact}</p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/bees"
            className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            ← Browse All Bees
          </Link>
        </div>
      </div>
    </div>
  );
}
