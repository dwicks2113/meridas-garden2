"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/plants", label: "Plant Database" },
  { href: "/plants?category=medicinal", label: "Medicinal Plants" },
  { href: "/butterflies", label: "Butterflies" },
  { href: "/bees", label: "Bees" },
  { href: "/garden-planning", label: "Garden Plans" },
  { href: "/pests", label: "Pests & Diseases" },
  { href: "/recipes", label: "Recipes" },
  { href: "/blog",    label: "Blog"            },
  { href: "/journal", label: "Planting Journal" },
  { href: "/photos",  label: "Photos"           },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-garden-green-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-lg font-heading font-bold">
            Merida&apos;s Garden
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-garden-green-pale hover:text-white text-sm font-medium transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded hover:bg-garden-green"
            aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 border-t border-garden-green">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="block px-4 py-2 text-garden-green-pale hover:bg-garden-green rounded mt-1"
                onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
