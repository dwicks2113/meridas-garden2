import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { isAdmin } from "@/lib/adminAuth";

const recipesPath = join(process.cwd(), "src", "data", "recipes.json");

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
      type,
      description,
      prepTime,
      steepTime,
      yield: yieldAmt,
      difficulty,
      plants,
      ingredients,
      instructions,
      benefits,
      caution,
      storageNotes,
    } = body;

    if (!name || !type || !description || !prepTime || !yieldAmt || !ingredients || !instructions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Parse plants — comma or newline separated
    const plantsArray: string[] = (plants || "")
      .split(/[,\n]/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    const plantIdsArray = plantsArray.map((p: string) => toSlug(p));

    const raw = readFileSync(recipesPath, "utf-8");
    const entries = JSON.parse(raw);

    // Generate a unique ID
    const baseId = toSlug(name) || `recipe-${Date.now()}`;
    const existingIds = new Set(entries.map((e: { id: string }) => e.id));
    let newId = baseId;
    let counter = 2;
    while (existingIds.has(newId)) {
      newId = `${baseId}-${counter++}`;
    }

    const newRecipe = {
      id: newId,
      name: name.trim(),
      type,
      description: description.trim(),
      prepTime: prepTime.trim(),
      steepTime: steepTime?.trim() || undefined,
      yield: yieldAmt.trim(),
      difficulty,
      image: `/images/recipes/${newId}.jpg`,
      plants: plantsArray,
      plantIds: plantIdsArray,
      ingredients: toArray(ingredients),
      instructions: toArray(instructions),
      benefits: toArray(benefits),
      caution: caution?.trim() || undefined,
      storageNotes: storageNotes?.trim() || undefined,
    };

    entries.unshift(newRecipe);
    writeFileSync(recipesPath, JSON.stringify(entries, null, 2));

    return NextResponse.json({ success: true, recipe: newRecipe });
  } catch (err) {
    console.error("Recipe save error:", err);
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
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

    const raw     = readFileSync(recipesPath, "utf-8");
    const entries = JSON.parse(raw) as { id: string }[];
    const index   = entries.findIndex((e) => e.id === id);
    if (index === -1) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    entries.splice(index, 1);
    writeFileSync(recipesPath, JSON.stringify(entries, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Recipe delete error:", err);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}
