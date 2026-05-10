import Link from "next/link";
import { notFound } from "next/navigation";
import recipesData from "@/data/recipes.json";
import PrintButton from "@/components/PrintButton";

interface Recipe {
  id: string;
  name: string;
  type: string;
  description: string;
  prepTime: string;
  steepTime?: string;
  yield: string;
  difficulty: string;
  image: string;
  plants: string[];
  plantIds: string[];
  ingredients: string[];
  instructions: string[];
  benefits: string[];
  caution?: string;
  storageNotes?: string;
}

const typeLabels: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
  "herbal-tea": { label: "Herbal Tea",  emoji: "🍵", bg: "bg-teal-50",   text: "text-teal-800"  },
  "tincture":   { label: "Tincture",   emoji: "🌿", bg: "bg-green-50",  text: "text-green-800" },
  "salve":      { label: "Salve / Oil",emoji: "🫙", bg: "bg-amber-50",  text: "text-amber-800" },
  "culinary":   { label: "Culinary",   emoji: "🍽️", bg: "bg-orange-50", text: "text-orange-800"},
  "pets":       { label: "Pets",       emoji: "🐾", bg: "bg-rose-50",   text: "text-rose-800"  },
};

const difficultyColor: Record<string, string> = {
  easy:     "bg-green-100 text-green-700",
  medium:   "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export function generateStaticParams() {
  return (recipesData as Recipe[]).map((r) => ({ id: r.id }));
}

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const recipe = (recipesData as Recipe[]).find((r) => r.id === params.id);
  if (!recipe) notFound();

  const typeInfo = typeLabels[recipe.type] || { label: recipe.type, emoji: "🌱", bg: "bg-gray-50", text: "text-gray-700" };

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Back nav */}
      <div className="no-print bg-white border-b border-gray-200 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Link href="/recipes" className="text-garden-green hover:text-garden-green-dark text-sm font-medium flex items-center gap-1">
            ← Back to Recipes
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className={`px-6 py-8 ${typeInfo.bg}`}>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-white/70 ${typeInfo.text} mb-3`}>
              {typeInfo.emoji} {typeInfo.label}
            </span>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-garden-green-dark leading-tight">
              {recipe.name}
            </h1>
          </div>

          {/* Meta row */}
          <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">⏱</span>
              <div>
                <p className="text-xs text-gray-400 leading-none">Prep Time</p>
                <p className="font-semibold">{recipe.prepTime}</p>
              </div>
            </div>
            {recipe.steepTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-lg">🫖</span>
                <div>
                  <p className="text-xs text-gray-400 leading-none">Steep / Cook</p>
                  <p className="font-semibold">{recipe.steepTime}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-lg">🥄</span>
              <div>
                <p className="text-xs text-gray-400 leading-none">Yield</p>
                <p className="font-semibold">{recipe.yield}</p>
              </div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ml-auto ${difficultyColor[recipe.difficulty] || "bg-gray-100 text-gray-700"}`}>
              {recipe.difficulty}
            </span>
          </div>

          {/* Description */}
          <div className="px-6 py-5">
            <p className="text-gray-700 leading-relaxed">{recipe.description}</p>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left column: Ingredients + Instructions */}
          <div className="lg:col-span-2 space-y-6">

            {/* Ingredients */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-4 flex items-center gap-2">
                🛒 Ingredients
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-1 w-5 h-5 rounded-full bg-garden-green-pale/60 text-garden-green-dark text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-4 flex items-center gap-2">
                📋 Instructions
              </h2>
              <ol className="space-y-4">
                {recipe.instructions.map((step, i) => (
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

          {/* Right column: sidebar */}
          <div className="space-y-5">

            {/* Plants used */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-heading font-bold text-garden-green-dark mb-3 flex items-center gap-2">
                🌱 Plants Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {recipe.plants.map((plant, i) => (
                  <Link
                    key={i}
                    href={`/plants/${recipe.plantIds[i] || plant.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm bg-garden-green-pale/40 text-garden-green-dark px-3 py-1 rounded-full hover:bg-garden-green-pale transition-colors"
                  >
                    {plant}
                  </Link>
                ))}
              </div>
            </div>

            {/* Benefits */}
            {recipe.benefits && recipe.benefits.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-heading font-bold text-garden-green-dark mb-3 flex items-center gap-2">
                  ✨ Benefits
                </h3>
                <ul className="space-y-2">
                  {recipe.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Caution */}
            {recipe.caution && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="font-heading font-bold text-amber-800 mb-2 flex items-center gap-2">
                  ⚠️ Caution
                </h3>
                <p className="text-sm text-amber-700 leading-relaxed">{recipe.caution}</p>
              </div>
            )}

            {/* Storage */}
            {recipe.storageNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="font-heading font-bold text-blue-800 mb-2 flex items-center gap-2">
                  📦 Storage
                </h3>
                <p className="text-sm text-blue-700 leading-relaxed">{recipe.storageNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="no-print mt-10 text-center">
          <Link href="/recipes"
            className="inline-flex items-center gap-2 bg-garden-green-dark text-white px-6 py-3 rounded-lg font-semibold hover:bg-garden-green transition-colors">
            ← Browse All Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
