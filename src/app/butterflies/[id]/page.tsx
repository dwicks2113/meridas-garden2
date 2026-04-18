import Link from "next/link";
import { notFound } from "next/navigation";
import butterfliesData from "@/data/butterflies.json";

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

const familyInfo: Record<string, { label: string; color: string }> = {
  Nymphalidae:  { label: "Brush-foots",       color: "bg-orange-100 text-orange-800" },
  Papilionidae: { label: "Swallowtails",      color: "bg-yellow-100 text-yellow-800" },
  Pieridae:     { label: "Whites & Sulphurs", color: "bg-lime-100 text-lime-800" },
  Lycaenidae:   { label: "Gossamer-wings",    color: "bg-sky-100 text-sky-800" },
  Hesperiidae:  { label: "Skippers",          color: "bg-amber-100 text-amber-800" },
};

export function generateStaticParams() {
  return (butterfliesData as Butterfly[]).map((b) => ({ id: b.id }));
}

function PlantList({ plants }: { plants: PlantRef[] }) {
  if (!plants || plants.length === 0) {
    return <p className="text-sm text-gray-500 italic">None listed.</p>;
  }
  return (
    <ul className="space-y-2">
      {plants.map((p, i) => (
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
  );
}

export default function ButterflyDetailPage({ params }: { params: { id: string } }) {
  const butterfly = (butterfliesData as Butterfly[]).find((b) => b.id === params.id);
  if (!butterfly) notFound();

  const fam = familyInfo[butterfly.family] || { label: butterfly.family, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Back nav */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/butterflies" className="text-garden-green hover:text-garden-green-dark text-sm font-medium flex items-center gap-1">
            ← Back to Butterflies
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Title card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          {/* Photos: adult + caterpillar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
            <div className="relative h-64 md:h-80 bg-garden-green-pale/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={butterfly.image}
                alt={butterfly.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <span className="absolute top-3 left-3 bg-white/90 text-garden-green-dark text-xs font-semibold px-3 py-1 rounded-full">
                Adult
              </span>
            </div>
            <div className="relative h-64 md:h-80 bg-garden-earth-pale/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={butterfly.caterpillar.image}
                alt={`${butterfly.name} caterpillar`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <span className="absolute top-3 left-3 bg-white/90 text-garden-earth-dark text-xs font-semibold px-3 py-1 rounded-full">
                Caterpillar
              </span>
            </div>
          </div>

          {/* Header block */}
          <div className="px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-garden-green-dark">
                  {butterfly.name}
                </h1>
                <p className="italic text-gray-500 mt-1">{butterfly.scientificName}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${fam.color}`}>
                {fam.label}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">📏</span>
                <div>
                  <p className="text-xs text-gray-400 leading-none">Wingspan</p>
                  <p className="font-semibold">{butterfly.wingspan}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-xs text-gray-400 leading-none">Active Seasons</p>
                  <p className="font-semibold">{butterfly.bestSeasons.join(", ")}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed mt-4">{butterfly.description}</p>
          </div>
        </div>

        {/* Caterpillar section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-3 flex items-center gap-2">
            🐛 Caterpillar Form
          </h2>
          <p className="text-gray-700 leading-relaxed">{butterfly.caterpillar.description}</p>
        </div>

        {/* Host + Nectar plants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-garden-green-light">
            <h2 className="text-lg font-heading font-bold text-garden-green-dark mb-1 flex items-center gap-2">
              🌱 Host Plants
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              What the caterpillars eat. Plant these to raise butterflies.
            </p>
            <PlantList plants={butterfly.hostPlants} />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-garden-bloom">
            <h2 className="text-lg font-heading font-bold text-garden-green-dark mb-1 flex items-center gap-2">
              🌸 Nectar Plants
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              What the adult butterflies feed on. Plant these to attract them.
            </p>
            <PlantList plants={butterfly.nectarPlants} />
          </div>
        </div>

        {/* Notes */}
        {butterfly.notes && (
          <div className="bg-garden-sun/10 border border-garden-sun/30 rounded-xl p-5 mb-8">
            <h3 className="font-heading font-bold text-garden-earth-dark mb-2 flex items-center gap-2">
              💡 Gardener&apos;s Note
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{butterfly.notes}</p>
          </div>
        )}

        {/* Back button */}
        <div className="mt-10 text-center">
          <Link
            href="/butterflies"
            className="inline-flex items-center gap-2 bg-garden-green-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-garden-green transition-colors"
          >
            ← Browse All Butterflies
          </Link>
        </div>
      </div>
    </div>
  );
}
