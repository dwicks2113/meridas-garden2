import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-garden-green-dark text-garden-green-pale py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-heading font-bold text-lg mb-3">Merida&apos;s Garden</h3>
            <p className="text-sm leading-relaxed">
              A plant database and planting journal for Clearwater, FL (USDA Zone 10b).
              Track your garden, explore what thrives in our climate, and discover medicinal plant recipes.
            </p>
          </div>
          <div>
            <h3 className="text-white font-heading font-bold text-lg mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/plants?category=flowers", label: "Flowers" },
                { href: "/plants?category=edible-flowers", label: "Edible Flowers" },
                { href: "/plants?category=vegetables", label: "Vegetables" },
                { href: "/plants?category=fruits", label: "Fruits" },
                { href: "/plants?category=medicinal", label: "Medicinal Plants" },
                { href: "/journal", label: "Planting Journal" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-heading font-bold text-lg mb-3">Zone 10b Info</h3>
            <p className="text-sm leading-relaxed">
              USDA Hardiness Zone 10b means minimum winter temperatures of 35-40&deg;F.
              Clearwater, FL enjoys a subtropical climate ideal for tropical plants, year-round flowers,
              and two growing seasons for vegetables.
            </p>
          </div>
        </div>
        <div className="border-t border-garden-green mt-8 pt-6 text-center text-xs flex items-center justify-center gap-4">
          <span>&copy; {new Date().getFullYear()} Merida&apos;s Garden &mdash; Clearwater, FL</span>
          <Link href="/admin" className="opacity-30 hover:opacity-70 transition-opacity">🔐</Link>
        </div>
      </div>
    </footer>
  );
}
