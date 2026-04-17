import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { isAdmin } from "@/lib/adminAuth";

const plantsPath    = join(process.cwd(), "src", "data", "plants.json");
const medicinalPath = join(process.cwd(), "src", "data", "medicinal.json");

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
    const filePath = isMedicinal ? medicinalPath : plantsPath;
    const raw      = readFileSync(filePath, "utf-8");
    const entries  = JSON.parse(raw);

    const baseId = toSlug(name) || `plant-${Date.now()}`;
    const existingIds = new Set(entries.map((e: { id: string }) => e.id));
    let newId = baseId;
    let counter = 2;
    while (existingIds.has(newId)) newId = `${baseId}-${counter++}`;

    const newPlant: Record<string, unknown> = {
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

    entries.push(newPlant);
    writeFileSync(filePath, JSON.stringify(entries, null, 2));
    return NextResponse.json({ success: true, plant: newPlant });
  } catch (err) {
    console.error("Plant save error:", err);
    return NextResponse.json({ error: "Failed to save plant" }, { status: 500 });
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

    // Try both files
    for (const filePath of [plantsPath, medicinalPath]) {
      const raw     = readFileSync(filePath, "utf-8");
      const entries = JSON.parse(raw) as { id: string }[];
      const index   = entries.findIndex((e) => e.id === id);
      if (index !== -1) {
        entries.splice(index, 1);
        writeFileSync(filePath, JSON.stringify(entries, null, 2));
        return NextResponse.json({ success: true });
      }
    }
    return NextResponse.json({ error: "Plant not found" }, { status: 404 });
  } catch (err) {
    console.error("Plant delete error:", err);
    return NextResponse.json({ error: "Failed to delete plant" }, { status: 500 });
  }
}
