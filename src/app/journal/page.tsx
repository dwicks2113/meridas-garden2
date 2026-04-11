"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { JournalEntry } from "@/lib/types";
import journalData from "@/data/journal.json";

const entries: JournalEntry[] = journalData as JournalEntry[];

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

export default function JournalPage() {
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  return (
    <>
      <section className="bg-gradient-to-br from-garden-earth-dark to-garden-earth py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-3">
            Planting Journal
          </h1>
          <p className="text-lg text-garden-earth-pale max-w-2xl mx-auto">
            Track your garden&apos;s progress. Record what you planted, when, how, and watch it grow.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-16 bg-garden-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* How to Add Entries */}
          <div className="bg-garden-earth-pale rounded-xl p-6 mb-8">
            <h2 className="font-heading font-bold text-garden-earth-dark mb-2">Adding Journal Entries</h2>
            <p className="text-sm text-garden-earth-dark">
              Edit <code className="bg-white/60 px-2 py-0.5 rounded text-xs">src/data/journal.json</code> to
              add entries. Each entry includes: plant name, date planted, method (seed/transplant/cutting/division),
              variety, location, days to fruit, notes, images, and updates. Drop photos into{" "}
              <code className="bg-white/60 px-2 py-0.5 rounded text-xs">public/images/journal/</code>.
            </p>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">No journal entries yet.</p>
              <p className="text-gray-400 text-sm">
                Add your first entry by editing <code>src/data/journal.json</code>
              </p>
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
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>Planted {formatDate(entry.datePlanted)}</span>
                          <span className="text-garden-green font-medium">{days} days ago</span>
                          {entry.variety && <span>Variety: {entry.variety}</span>}
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
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-1">Planting Notes</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{entry.notes}</p>
                        </div>

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
                        <Link href={`/plants/${entry.plantId}`}
                          className="inline-flex items-center gap-1 text-sm text-garden-green hover:text-garden-green-dark">
                          View in Plant Database
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
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
