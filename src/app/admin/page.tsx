"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/AdminContext";
import BoxerLogo from "@/components/BoxerLogo";

export default function AdminPage() {
  const { isAdmin, login, logout } = useAdmin();
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(password);
    setLoading(false);
    if (!ok) {
      setError("Incorrect password. Try again.");
      setPassword("");
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-garden-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex justify-center mb-5">
            <BoxerLogo size={72} showBee showButterfly />
          </div>
          <h1 className="text-2xl font-heading font-bold text-garden-green-dark text-center mb-1">
            Admin Login
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Merida&apos;s Garden — private access
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-garden-green"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-garden-green-dark text-white py-2.5 rounded-lg font-semibold hover:bg-garden-green transition-colors disabled:opacity-50"
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-6">
            <Link href="/" className="hover:text-gray-600">← Back to site</Link>
          </p>
        </div>
      </div>
    );
  }

  // Admin dashboard
  const sections = [
    { href: "/plants",  emoji: "🌱", label: "Plant Database",    desc: "Add or delete plants and medicinal herbs" },
    { href: "/recipes", emoji: "🌿", label: "Recipes",           desc: "Add or delete herbal and culinary recipes" },
    { href: "/blog",    emoji: "✏️",  label: "Blog",              desc: "Write or delete blog posts" },
    { href: "/journal", emoji: "📓", label: "Planting Journal",  desc: "Add or delete journal entries" },
  ];

  return (
    <div className="min-h-screen bg-garden-cream py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BoxerLogo size={64} showButterfly />
            <div>
              <h1 className="text-2xl font-heading font-bold text-garden-green-dark">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">Merida&apos;s Garden</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-4 py-1.5 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 text-sm text-green-800">
          ✅ You&apos;re logged in as admin. <strong>Add</strong> and <strong>Delete</strong> controls are
          now visible throughout the site. Your session lasts until you close this browser tab or log out.
        </div>

        {/* Section links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-garden-green/30 transition-all"
            >
              <div className="text-2xl mb-2">{s.emoji}</div>
              <p className="font-heading font-bold text-garden-green-dark mb-1">{s.label}</p>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-garden-green hover:text-garden-green-dark">
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
