"use client";

import { useState, useMemo, useRef, DragEvent, ChangeEvent } from "react";
import photosData from "@/data/garden-photos.json";
import BoxerLogo from "@/components/BoxerLogo";
import { useAdmin } from "@/components/AdminContext";

type Season = "spring" | "summer" | "fall" | "winter";

interface Photo {
  id: string;
  filename: string;
  season: Season;
  year: number;
  dateTaken?: string;
  location?: string;
  uploadedAt: string;
}

const seasonLabel: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

const seasonEmoji: Record<Season, string> = {
  spring: "🌷",
  summer: "🌻",
  fall: "🍂",
  winter: "❄️",
};

function albumKey(p: Pick<Photo, "season" | "year">): string {
  return `${p.season}-${p.year}`;
}

function albumLabel(season: Season, year: number): string {
  return `${seasonEmoji[season]} ${seasonLabel[season]} ${year}`;
}

function guessSeason(date: Date): Season {
  const m = date.getMonth() + 1; // 1-12
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "fall";
  return "winter";
}

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
      "image/jpeg",
      0.85
    );
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode.apply(null, Array.from(slice));
  }
  return btoa(binary);
}

export default function PhotosPage() {
  const { isAdmin, adminPassword } = useAdmin();
  const [photos, setPhotos] = useState<Photo[]>(photosData as Photo[]);
  const [activeAlbum, setActiveAlbum] = useState<string>("all");

  // Upload form state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const today = new Date();
  const [season, setSeason] = useState<Season>(guessSeason(today));
  const [year, setYear] = useState<number>(today.getFullYear());
  const [dateTaken, setDateTaken] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  // Build unique album list from photos, sorted by year desc then by season order
  const albums = useMemo(() => {
    const seasonOrder: Record<Season, number> = { spring: 0, summer: 1, fall: 2, winter: 3 };
    const seen = new Map<string, { season: Season; year: number; count: number }>();
    for (const p of photos) {
      const k = albumKey(p);
      const cur = seen.get(k);
      if (cur) cur.count++;
      else seen.set(k, { season: p.season, year: p.year, count: 1 });
    }
    return Array.from(seen.values()).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return seasonOrder[a.season] - seasonOrder[b.season];
    });
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeAlbum === "all") return photos;
    return photos.filter((p) => albumKey(p) === activeAlbum);
  }, [photos, activeAlbum]);

  function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setPendingFiles((prev) => [...prev, ...list]);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function onFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files);
    // Reset so selecting the same file again triggers onChange
    e.target.value = "";
  }

  function removePending(idx: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleUpload() {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    setUploadStatus("idle");
    setUploadError("");
    setUploadProgress({ done: 0, total: pendingFiles.length });

    const successes: Photo[] = [];
    try {
      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        const compressed = await compressImage(file);
        const base64 = await blobToBase64(compressed);
        const res = await fetch("/api/photos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-password": adminPassword,
          },
          body: JSON.stringify({
            season,
            year,
            dateTaken: dateTaken || undefined,
            location: location || undefined,
            originalName: file.name,
            base64,
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Upload failed (${res.status})`);
        }
        const { photo } = await res.json();
        successes.push(photo);
        setUploadProgress({ done: i + 1, total: pendingFiles.length });
      }
      setPhotos((prev) => [...successes, ...prev]);
      setPendingFiles([]);
      setDateTaken("");
      setLocation("");
      setUploadStatus("success");
      setTimeout(() => setUploadStatus("idle"), 5000);
    } catch (err) {
      setUploadStatus("error");
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photo: Photo) {
    if (!confirm(`Delete this photo? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/photos?id=${photo.id}`, {
        method: "DELETE",
        headers: { "x-admin-password": adminPassword },
      });
      if (!res.ok) throw new Error("Delete failed");
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="min-h-screen bg-garden-cream">
      {/* Hero */}
      <div className="bg-gradient-to-br from-garden-green-dark via-garden-green to-emerald-600 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <BoxerLogo size={90} showBee showButterfly />
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                📸 Garden Photos
              </h1>
              <p className="text-garden-green-pale text-lg max-w-2xl">
                A seasonal album of what&apos;s blooming, growing, and visiting
                Merida&apos;s Garden in Clearwater, FL.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Admin upload form */}
        {isAdmin && (
          <div className="mb-10 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-heading font-bold text-garden-green-dark mb-4">
              Upload Photos
            </h2>

            {/* Drop zone */}
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                dragOver
                  ? "border-garden-green bg-garden-green-pale/30"
                  : "border-gray-300 bg-gray-50 hover:border-garden-green hover:bg-garden-green-pale/20"
              }`}
            >
              <div className="text-4xl mb-2">📷</div>
              <p className="text-gray-700 font-medium">
                Drag photos here, or click to select
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG, or WebP. Photos auto-resize to fit web limits.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onFileInputChange}
                className="hidden"
              />
            </div>

            {/* Pending file thumbnails */}
            {pendingFiles.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  {pendingFiles.length} photo{pendingFiles.length !== 1 ? "s" : ""} ready to upload:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
                  {pendingFiles.map((f, i) => (
                    <div key={i} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePending(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs font-bold hover:bg-red-700"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata fields — applied to whole batch */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Season *</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as Season)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-garden-green"
                >
                  <option value="spring">🌷 Spring</option>
                  <option value="summer">🌻 Summer</option>
                  <option value="fall">🍂 Fall</option>
                  <option value="winter">❄️ Winter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || today.getFullYear())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-garden-green"
                  min={2000}
                  max={2100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date taken (optional)</label>
                <input
                  type="date"
                  value={dateTaken}
                  onChange={(e) => setDateTaken(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-garden-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured plant or location (optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. pollinator garden, monarch on milkweed"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-garden-green"
                />
              </div>
            </div>

            {/* Status messages */}
            {uploadStatus === "success" && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800">
                ✅ <strong>Photos uploaded!</strong> They&apos;re live in your browser now.
                The site will rebuild on Vercel in ~1–2 minutes so the photos
                also show up when anyone else visits.
              </div>
            )}
            {uploadStatus === "error" && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                ❌ <strong>Upload failed.</strong> {uploadError}
              </div>
            )}

            {/* Submit */}
            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {uploading
                  ? `Uploading ${uploadProgress.done + 1}/${uploadProgress.total}…`
                  : pendingFiles.length === 0
                  ? "Add photos above to enable upload"
                  : `Ready to upload ${pendingFiles.length} photo${pendingFiles.length !== 1 ? "s" : ""}`}
              </span>
              <button
                onClick={handleUpload}
                disabled={uploading || pendingFiles.length === 0}
                className="px-5 py-2 bg-garden-green-dark text-white rounded-md font-medium hover:bg-garden-green disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? "Uploading…" : "Upload Photos"}
              </button>
            </div>
          </div>
        )}

        {/* Album filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveAlbum("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeAlbum === "all"
                ? "bg-garden-green-dark text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:border-garden-green hover:text-garden-green-dark"
            }`}
          >
            All Photos ({photos.length})
          </button>
          {albums.map((a) => {
            const k = `${a.season}-${a.year}`;
            return (
              <button
                key={k}
                onClick={() => setActiveAlbum(k)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeAlbum === k
                    ? "bg-garden-green-dark text-white"
                    : "bg-white border border-gray-300 text-gray-600 hover:border-garden-green hover:text-garden-green-dark"
                }`}
              >
                {albumLabel(a.season, a.year)} ({a.count})
              </button>
            );
          })}
        </div>

        {/* Gallery */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-4">📸</div>
            <p className="text-lg">No photos in this album yet.</p>
            {isAdmin && (
              <p className="text-sm mt-2">Use the upload form above to add some!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPhotos.map((p) => (
              <div
                key={p.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={`/images/garden-photos/${p.filename}`}
                    alt={p.location || `${seasonLabel[p.season]} ${p.year}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(p)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 text-sm font-bold opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-opacity"
                      title="Delete photo"
                    >
                      🗑
                    </button>
                  )}
                </div>
                <div className="p-3 text-sm">
                  <div className="font-medium text-garden-green-dark">
                    {albumLabel(p.season, p.year)}
                  </div>
                  {p.dateTaken && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(p.dateTaken + "T12:00:00").toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  {p.location && (
                    <div className="text-gray-600 mt-1">{p.location}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
