import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import {
  updateRepoJson,
  writeRepoBinary,
  deleteRepoFile,
} from "@/lib/repoStorage";

const PHOTOS_REPO_PATH = "src/data/garden-photos.json";

interface Photo {
  id: string;
  filename: string;          // relative to /images/garden-photos/, e.g. "spring-2026/2026-04-15-abc123.jpg"
  season: "spring" | "summer" | "fall" | "winter";
  year: number;
  dateTaken?: string;        // ISO date "2026-04-15" — optional
  location?: string;         // free-text caption / featured plant or location
  uploadedAt: string;        // ISO timestamp set by server
}

const VALID_SEASONS = new Set(["spring", "summer", "fall", "winter"]);

function randomId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function safeExt(name: string): string {
  const m = name.match(/\.(jpe?g|png|webp|gif)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      season,
      year,
      dateTaken,
      location,
      originalName,
      base64,            // image data, base64-encoded (no data: prefix)
    } = body as {
      season?: string;
      year?: number;
      dateTaken?: string;
      location?: string;
      originalName?: string;
      base64?: string;
    };

    if (!season || !VALID_SEASONS.has(season)) {
      return NextResponse.json({ error: "Invalid season" }, { status: 400 });
    }
    if (!year || typeof year !== "number" || year < 1900 || year > 2100) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }
    if (!base64 || typeof base64 !== "string") {
      return NextResponse.json({ error: "Missing photo data" }, { status: 400 });
    }

    const buffer = Buffer.from(base64, "base64");
    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty photo data" }, { status: 400 });
    }
    if (buffer.length > 4_500_000) {
      return NextResponse.json(
        { error: "Photo too large after compression — try a smaller image" },
        { status: 413 }
      );
    }

    const ext = safeExt(originalName || "photo.jpg");
    const id = `${Date.now()}-${randomId()}`;
    const datePart = (dateTaken && dateTaken.match(/^\d{4}-\d{2}-\d{2}$/))
      ? dateTaken
      : new Date().toISOString().slice(0, 10);
    const folder = `${season}-${year}`;
    const filename = `${folder}/${datePart}-${id}.${ext}`;
    const repoPath = `public/images/garden-photos/${filename}`;

    // 1. Commit the binary file
    await writeRepoBinary(
      repoPath,
      buffer,
      `Add photo: ${folder}/${datePart}`
    );

    // 2. Append metadata entry
    let savedPhoto: Photo | null = null;
    await updateRepoJson<Photo[]>(
      PHOTOS_REPO_PATH,
      (entries) => {
        const newPhoto: Photo = {
          id,
          filename,
          season: season as Photo["season"],
          year,
          dateTaken: dateTaken?.trim() || undefined,
          location: location?.trim() || undefined,
          uploadedAt: new Date().toISOString(),
        };
        savedPhoto = newPhoto;
        return [newPhoto, ...entries];
      },
      `Add photo metadata: ${folder}/${datePart}`
    );

    return NextResponse.json({ success: true, photo: savedPhoto });
  } catch (err) {
    console.error("Photo upload error:", err);
    const message = err instanceof Error ? err.message : "Failed to upload photo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    let photoToDelete: Photo | null = null;

    await updateRepoJson<Photo[]>(
      PHOTOS_REPO_PATH,
      (entries) => {
        const index = entries.findIndex((e) => e.id === id);
        if (index === -1) return entries;
        photoToDelete = entries[index];
        const next = [...entries];
        next.splice(index, 1);
        return next;
      },
      `Delete photo metadata: ${id}`
    );

    if (!photoToDelete) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // photoToDelete is set above but TS narrows it to never inside the closure;
    // re-cast for safety.
    const p = photoToDelete as Photo;
    const repoPath = `public/images/garden-photos/${p.filename}`;
    await deleteRepoFile(repoPath, `Delete photo file: ${p.filename}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Photo delete error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete photo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
