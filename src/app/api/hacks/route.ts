import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { updateRepoJson } from "@/lib/repoStorage";

const HACKS_REPO_PATH = "src/data/hacks.json";

interface Hack {
  id: string;
  name: string;
  category: string;
  description: string;
  materials: string[];
  instructions: string[];
  addedAt: string;
}

const VALID_CATEGORIES = new Set([
  "pest-control",
  "soil-fertilizer",
  "watering",
  "companion-planting",
  "weather-wisdom",
  "seed-starting",
  "harvesting-storage",
  "general",
]);

function toArray(value: string | undefined): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();

    const {
      name,
      category,
      description,
      materials,
      instructions,
    } = body as {
      name?: string;
      category?: string;
      description?: string;
      materials?: string;
      instructions?: string;
    };

    if (!name || !category || !description || !instructions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!VALID_CATEGORIES.has(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    let savedHack: Hack | null = null;

    await updateRepoJson<Hack[]>(
      HACKS_REPO_PATH,
      (entries) => {
        const baseId = toSlug(name) || `hack-${Date.now()}`;
        const existingIds = new Set(entries.map((e) => e.id));
        let newId = baseId;
        let counter = 2;
        while (existingIds.has(newId)) {
          newId = `${baseId}-${counter++}`;
        }

        const newHack: Hack = {
          id: newId,
          name: name.trim(),
          category,
          description: description.trim(),
          materials: toArray(materials),
          instructions: toArray(instructions),
          addedAt: new Date().toISOString(),
        };
        savedHack = newHack;
        return [newHack, ...entries];
      },
      `Add garden hack: ${name.trim()}`
    );

    return NextResponse.json({ success: true, hack: savedHack });
  } catch (err) {
    console.error("Hack save error:", err);
    const message = err instanceof Error ? err.message : "Failed to save hack";
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

    let found = false;
    let deletedName = "";

    await updateRepoJson<Hack[]>(
      HACKS_REPO_PATH,
      (entries) => {
        const index = entries.findIndex((e) => e.id === id);
        if (index === -1) return entries;
        found = true;
        deletedName = entries[index].name;
        const next = [...entries];
        next.splice(index, 1);
        return next;
      },
      `Delete garden hack: ${id}`
    );

    if (!found) return NextResponse.json({ error: "Hack not found" }, { status: 404 });
    return NextResponse.json({ success: true, deletedName });
  } catch (err) {
    console.error("Hack delete error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete hack";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
