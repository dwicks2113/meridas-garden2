import Link from "next/link";
import type { Plant } from "@/lib/types";
import plantsData from "@/data/plants.json";
import medicinalData from "@/data/medicinal.json";
import pestsData from "@/data/pests.json";
import recipesData from "@/data/recipes.json";
import butterfliesData from "@/data/butterflies.json";
import BoxerLogo from "@/components/BoxerLogo";

const allPlants: Plant[] = [...(plantsData as Plant[]), ...(medicinalData as Plant[])];
const pestCount = pestsData.length;
const recipeCount = recipesData.length;
const butterflyCount = butterfliesData.length;
const flowerCount = allPlants.filter((p) => p.category === "flowers").length;
const edibleCount = allPlants.filter((p) => p.category === "edible-flowers").length;
const vegCount = allPlants.filter((p) => p.category === "vegetables").length;
const fruitCount = allPlants.filter((p) => p.category === "fruits").length;
const medCount = allPlants.filter((p) => p.category === "medicinal").length;

const categories = [
  { name: "Flowers", count: flowerCount, href: "/plants?category=flowers", color: "from-pink-400 to-pink-600", desc: "Ornamental beauties that thrive in Florida sun" },
  { name: "Edible Flowers", count: edibleCount, href: "/plants?category=edible-flowers", color: "from-orange-400 to-orange-600", desc: "Beautiful blooms you can eat" },
  { name: "Vegetables", count: vegCount, href: "/plants?category=vegetables", color: "from-green-500 to-green-700", desc: "Cool-season and warm-season veggies" },
  { name: "Fruits", count: fruitCount, href: "/plants?category=fruits", color: "from-purple-500 to-purple-700", desc: "Tropical fruits for your backyard" },
  { name: "Medicinal Plants", count: medCount, href: "/plants?category=medicinal", color: "from-teal-500 to-teal-700", desc: "Healing herbs with recipes and uses" },
  { name: "Butterflies", count: butterflyCount, href: "/butterflies", color: "from-indigo-400 to-indigo-600", desc: "Butterflies of Zone 10b with host & nectar plants" },
  { name: "Pests & Diseases", count: pestCount, href: "/pests", color: "from-amber-600 to-amber-800", desc: "Identify, treat, and prevent common garden pests" },
  { name: "Garden Recipes", count: recipeCount, href: "/recipes", color: "from-emerald-500 to-emerald-800", desc: "Herbal teas, tinctures, salves, and culinary recipes" },
];

const monthTips: Record<string, string> = {
  "0": "January: Plant cool-season veggies like lettuce, spinach, and carrots. Great time for citrus tree planting.",
  "1": "February: Last chance for cool-season crops. Start warm-season transplants indoors. Plant tropical fruit trees.",
  "2": "March: Transition month! Plant okra, peppers, and sweet potatoes. Great time for tropical plants and herbs.",
  "3": "April: Warm season is here. Plant heat-lovers like bananas, papayas, and lemongrass. Mulch heavily.",
  "4": "May: Focus on heat-tolerant plants. Maintain irrigation. Harvest spring vegetables before heat sets in.",
  "5": "June: Peak heat. Focus on maintenance, watering, and harvesting tropical fruits. Mangoes ripening!",
  "6": "July: Hot and humid. Minimal planting. Maintain existing gardens. Watch for pests.",
  "7": "August: Start fall vegetable planning. Plant squash and tomato seeds for fall harvest.",
  "8": "September: Fall planting begins! Start cool-season crops. Plant kale, lettuce seeds, squash.",
  "9": "October: Prime planting season. Cool-season veggies in full swing. Great weather for garden work.",
  "10": "November: Continue cool-season planting. Lettuce, spinach, carrots all go in now.",
  "11": "December: Plant cool-weather crops. Eggplant transplants. Enjoy mild gardening weather.",
};

const currentMonth = new Date().getMonth().toString();

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-garden-green-dark via-garden-green to-garden-green-light py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Mascot — left side */}
            <div className="flex-shrink-0">
              <BoxerLogo size={220} showBee showButterfly />
            </div>
            {/* Text — right side */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-3">
                Merida&apos;s Garden
              </h1>
              <p className="text-xl md:text-2xl text-garden-green-pale mb-2">
                Clearwater, Florida
              </p>
              <p className="text-lg text-garden-green-pale/80 max-w-xl mb-8">
                A Zone 10b plant database, medicinal herb guide, and planting journal
                for Clearwater, Florida.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/plants" className="bg-garden-earth-pale text-garden-green-dark px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white transition-colors">
                  Explore Plants
                </Link>
                <Link href="/blog" className="bg-garden-green-dark/30 backdrop-blur text-white border border-white/30 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-garden-green-dark/50 transition-colors">
                  My Garden Blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Tip */}
      <section className="bg-garden-sun/20 border-b border-garden-sun/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-center text-garden-earth-dark">
            <span className="font-bold">This Month&apos;s Tip:</span>{" "}
            {monthTips[currentMonth]}
          </p>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 md:py-20 bg-garden-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-heading">Browse by Category</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              {allPlants.length} plants across 5 categories, all suited for Clearwater&apos;s
              subtropical climate.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href}
                className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
                <div className={`bg-gradient-to-br ${cat.color} p-8 text-white`}>
                  <h3 className="text-2xl font-heading font-bold mb-2">{cat.name}</h3>
                  <p className="text-white/80 text-sm mb-4">{cat.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{cat.count}</span>
                    <span className="text-white/60 group-hover:translate-x-1 transition-transform">
                      Explore &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Blog card */}
            <Link href="/blog"
              className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="bg-gradient-to-br from-garden-sky to-garden-sky/80 p-8 text-white">
                <h3 className="text-2xl font-heading font-bold mb-2">Garden Blog</h3>
                <p className="text-white/80 text-sm mb-4">Tips, stories, and seasonal updates</p>
                <span className="text-white/60 group-hover:translate-x-1 transition-transform inline-block">
                  Read posts &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Zone 10b Info */}
      <section className="py-16 bg-garden-green-pale/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="section-heading">What is Zone 10b?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">&#x1F321;&#xFE0F;</div>
              <h3 className="font-heading font-bold text-garden-green-dark mb-2">Min Temp: 35-40&deg;F</h3>
              <p className="text-sm text-gray-600">Rare freezes mean you can grow tropical plants year-round.</p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">&#x2600;&#xFE0F;</div>
              <h3 className="font-heading font-bold text-garden-green-dark mb-2">Subtropical Climate</h3>
              <p className="text-sm text-gray-600">Hot summers, mild winters, and afternoon thunderstorms define our growing conditions.</p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-3xl mb-3">&#x1F4C5;</div>
              <h3 className="font-heading font-bold text-garden-green-dark mb-2">Two Growing Seasons</h3>
              <p className="text-sm text-gray-600">Cool-season veggies Oct-Apr, warm-season tropicals year-round.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Butterfly Feature */}
      <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-garden-green-pale/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Text */}
            <div>
              <span className="inline-block text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full mb-4">
                NEW 🦋
              </span>
              <h2 className="section-heading">Butterflies of Zone 10b</h2>
              <p className="text-gray-700 leading-relaxed mb-5">
                Meet the {butterflyCount} butterflies commonly found in Pinellas County gardens — including
                Florida&apos;s state butterfly, the Zebra Longwing. Each profile shows both the adult
                and caterpillar forms, plus the host and nectar plants you can grow to welcome them.
              </p>
              <Link
                href="/butterflies"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Explore Butterflies &rarr;
              </Link>
            </div>

            {/* Preview cards */}
            <div className="grid grid-cols-2 gap-4">
              {butterfliesData.slice(0, 4).map((b) => (
                <Link
                  key={b.id}
                  href={`/butterflies/${b.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-garden-earth-pale/60 transition-all"
                >
                  <div className="h-28 bg-garden-green-pale/30 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.image}
                      alt={b.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-heading font-bold text-garden-green-dark leading-tight">
                      {b.name}
                    </p>
                    <p className="text-xs italic text-gray-500 truncate">{b.scientificName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
