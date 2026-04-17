"use client";

import { useState } from "react";
import Link from "next/link";
import type { JournalEntry } from "@/lib/types";
import journalData from "@/data/journal.json";
import plantsData from "@/data/plants.json";
import medicinalData from "@/data/medicinal.json";
import BoxerLogo from "@/components/BoxerLogo";

type Plant = { id: string; name: string };

const allPlants: Plant[] = [
  ...(plantsData as Plant[]),
  ...(medicinalData as Plant[]),
].sort((a, b) => a.name.localeCompare(b.name));

const methodColors: Record<string, string> = {
  seed: "bg-yellow-100 text-yellow-800",
  transplant: "bg-blue-100 text-blue-800",
  cutting: "bg-green-100 text-green-800",
  division: "bg-purple-100 text-purple-800",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function daysSince(dateStr: string): number {
  const planted = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return Math.floor((now.getTime() - planted.getTime()) / (1000 * 60 * 60 * 24));
}

const today = new Date().toISOString().split("T")[0];

const emptyForm = {
  plantName: "",
  plantId: "",
  datePlanted: today,
  method: "seed" as "seed" | "transplant" | "cutting" | "division",
  variety: "",
  location: "",
  daysToFruit: "",
  notes: "",
};

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(journalData as JournalEntry[]);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Auto-fill plantId when selecting from dropdown
    if (name === "plantName") {
      const match = allPlants.find((p) => p.name === value);
      setForm((prev) => ({ ...prev, plantName: value, plantId: match ? match.id : "" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveStatus("idle");

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");

      const { entry } = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-garden-earth-dark to-garden-earth py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <BoxerLogo size={90} showButterfly />
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                Planting Journal
              </h1>
              <p className="text-lg text-garden-earth-pale max-w-2xl">
                Track your garden&apos;s progress. Record what you planted, when, how, and watch it grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-garden-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Success banner */}
          {saveStatus === "success" && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-3 flex items-center gap-3">
              <span className="text-xl">✅</span>
              <p className="text-sm font-medium">Entry saved! It&apos;s been added to your journal.</p>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-3 flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium">Something went wrong. Please try again.</p>
            </div>
          )}

          {/* Add Entry button */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">{entries.length} {entries.length === 1 ? "entry" : "entries"}</p>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                showForm
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-garden-green-dark text-white hover:bg-garden-green"
              }`}
            >
              {showForm ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Entry
                </>
              )}
            </button>
          </div>

          {/* Add Entry Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="card p-6 mb-8 border-2 border-garden-green/30">
              <h2 className="font-heading font-bold text-garden-green-dark text-xl mb-5">
                🌱 New Journal Entry
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Plant Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    list="plant-suggestions"
                    name="plantName"
                    value={form.plantName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Tomato, Hibiscus..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green/40"
                  />
                  <datalist id="plant-suggestions">
                    {allPlants.map((p) => (
                      <option key={p.id} value={p.name} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-400 mt-1">Start typing to see plants from your database, or enter any plant name.</p>
                </div>

                {/* Date Planted */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Planted <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="datePlanted"
                    value={form.datePlanted}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green/40"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planting Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="method"
                    value={form.method}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green/40 bg-white"
                  >
                    <option value="seed">Seed</option>
                    <option value="transplant">Transplant</option>
                    <option value="cutting">Cutting</option>
                    <option value="division">Division</option>
                  </select>
                </div>

                {/* Variety */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variety <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="variety"
                    value={form.variety}
                    onChange={handleChange}
                    placeholder="e.g. Cherokee Purple, Sweet 100..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green/40"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Raised bed #1, Back yard..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green/40"
                  />
                </div>

                {/* Days to Fruit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Est. Days to Fruit/Bloom <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    name="daysToFruit"
                    value={form.daysToFruit}
                    onChange={handleChange}
                    min="1"
                    max="999"
                    placeholder="e.g. 75"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green/40"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Planting Notes <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Soil prep, spacing, where you got the seeds, anything you want to remember..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-garden-green/40 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Entry"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setForm(emptyForm); setShowForm(false); }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Entries list */}
          {entries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🌱</p>
              <p className="text-gray-500 text-lg mb-2">No journal entries yet.</p>
              <p className="text-gray-400 text-sm">Click &quot;Add New Entry&quot; above to record your first planting!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => {
                const isExpanded = expandedEntry === entry.id;
                const days = daysSince(entry.datePlanted);

                return (
                  <div key={entry.id} className="card overflow-hidden">
                    {/* Header */}
                    <button onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-garden-green-pale/20 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-heading font-bold text-garden-green-dark">
                            {entry.plantName}
                          </h3>
                          <span className={`badge ${methodColors[entry.method] || "bg-gray-100"}`}>
                            {entry.method}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                          <span>Planted {formatDate(entry.datePlanted)}</span>
                          <span className="text-garden-green font-medium">{days} days ago</span>
                          {entry.variety && <span>Variety: {entry.variety}</span>}
                          {entry.location && <span>📍 {entry.location}</span>}
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4 ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-5 border-t border-garden-earth-pale/40">
                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                          <div className="bg-garden-green-pale/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600">Location</p>
                            <p className="text-sm text-garden-green-dark">{entry.location}</p>
                          </div>
                          <div className="bg-garden-earth-pale/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600">Method</p>
                            <p className="text-sm capitalize">{entry.method}</p>
                          </div>
                          <div className="bg-garden-sky-pale/50 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-600">Days Growing</p>
                            <p className="text-sm text-garden-sky">{days} days</p>
                          </div>
                          {entry.daysToFruit && (
                            <div className="bg-garden-sun/10 rounded-lg p-3">
                              <p className="text-xs font-semibold text-gray-600">Est. Days to Fruit</p>
                              <p className="text-sm">{entry.daysToFruit} days</p>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {entry.notes && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-1">Planting Notes</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{entry.notes}</p>
                          </div>
                        )}

                        {/* Progress bar for days to fruit */}
                        {entry.daysToFruit && (
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress to fruit</span>
                              <span>{Math.min(100, Math.round((days / entry.daysToFruit) * 100))}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-garden-green rounded-full h-2 transition-all duration-500"
                                style={{ width: `${Math.min(100, (days / entry.daysToFruit) * 100)}%` }} />
                            </div>
                          </div>
                        )}

                        {/* Timeline of updates */}
                        {entry.updates && entry.updates.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">Growth Timeline</h4>
                            <div className="space-y-3">
                              {entry.updates.map((update, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 bg-garden-green rounded-full flex-shrink-0" />
                                    {idx < entry.updates.length - 1 && (
                                      <div className="w-0.5 flex-1 bg-garden-green-pale mt-1" />
                                    )}
                                  </div>
                                  <div className="pb-3">
                                    <p className="text-xs text-gray-500">{formatDate(update.date)}</p>
                                    <p className="text-sm text-gray-700">{update.note}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Link to plant database */}
                        {entry.plantId && (
                          <Link href={`/plants/${entry.plantId}`}
                            className="inline-flex items-center gap-1 text-sm text-garden-green hover:text-garden-green-dark">
                            View in Plant Database
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
