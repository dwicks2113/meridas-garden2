import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { updateRepoJson } from "@/lib/repoStorage";

const PLANTS_REPO_PATH    = "src/data/plants.json";
const MEDICINAL_REPO_PATH = "src/data/medicinal.json";

interface PlantEntry {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  description: string;
  sun: string;
  water: string;
  plantingMonths: number[];
  daysToBloom: string;
  careNotes: string;
  image: string;
  medicinalUses?: string[];
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function toArray(value: string | undefined): string[] {
  if (!value || !value.trim()) return [];
  return value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, scientificName, category, description, sun, water,
            plantingMonths, daysToBloom, careNotes, medicinalUses } = body;

    if (!name || !category || !description || !sun || !water || !careNotes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const isMedicinal = category === "medicinal";
    const repoPath = isMedicinal ? MEDICINAL_REPO_PATH : PLANTS_REPO_PATH;

    let savedPlant: PlantEntry | null = null;

    await updateRepoJson<PlantEntry[]>(
      repoPath,
      (entries) => {
        const baseId = toSlug(name) || `plant-${Date.now()}`;
        const existingIds = new Set(entries.map((e) => e.id));
        let newId = baseId;
        let counter = 2;
        while (existingIds.has(newId)) newId = `${baseId}-${counter++}`;

        const newPlant: PlantEntry = {
          id:             newId,
          name:           name.trim(),
          scientificName: (scientificName || "").trim(),
          category,
          description:    description.trim(),
          sun,
          water,
          plantingMonths: Array.isArray(plantingMonths) ? plantingMonths : [],
          daysToBloom:    (daysToBloom || "").trim(),
          careNotes:      careNotes.trim(),
          image:          `/images/plants/${newId}.jpg`,
        };
        if (isMedicinal && medicinalUses) newPlant.medicinalUses = toArray(medicinalUses);
        savedPlant = newPlant;
        return [...entries, newPlant];
      },
      `Add plant: ${name.trim()}`
    );

    return NextResponse.json({ success: true, plant: savedPlant });
  } catch (err) {
    console.error("Plant save error:", err);
    const message = err instanceof Error ? err.message : "Failed to save plant";
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

    // Try both files in sequence
    for (const repoPath of [PLANTS_REPO_PATH, MEDICINAL_REPO_PATH]) {
      let found = false;
      await updateRepoJson<PlantEntry[]>(
        repoPath,
        (entries) => {
          const index = entries.findIndex((e) => e.id === id);
          if (index === -1) return entries;
          found = true;
          const next = [...entries];
          next.splice(index, 1);
          return next;
        },
        `Delete plant: ${id}`
      );
      if (found) return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Plant not found" }, { status: 404 });
  } catch (err) {
    console.error("Plant delete error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete plant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
