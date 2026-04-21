import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { updateRepoJson } from "@/lib/repoStorage";

const RECIPES_REPO_PATH = "src/data/recipes.json";

interface Recipe {
  id: string;
  name: string;
  type: string;
  description: string;
  prepTime: string;
  steepTime?: string;
  yield: string;
  difficulty: string;
  image: string;
  plants: string[];
  plantIds: string[];
  ingredients: string[];
  instructions: string[];
  benefits: string[];
  caution?: string;
  storageNotes?: string;
}

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

    const plantsArray: string[] = (plants || "")
      .split(/[,\n]/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    const plantIdsArray = plantsArray.map((p: string) => toSlug(p));

    let savedRecipe: Recipe | null = null;

    await updateRepoJson<Recipe[]>(
      RECIPES_REPO_PATH,
      (entries) => {
        const baseId = toSlug(name) || `recipe-${Date.now()}`;
        const existingIds = new Set(entries.map((e) => e.id));
        let newId = baseId;
        let counter = 2;
        while (existingIds.has(newId)) {
          newId = `${baseId}-${counter++}`;
        }

        const newRecipe: Recipe = {
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
        savedRecipe = newRecipe;
        return [newRecipe, ...entries];
      },
      `Add recipe: ${name.trim()}`
    );

    return NextResponse.json({ success: true, recipe: savedRecipe });
  } catch (err) {
    console.error("Recipe save error:", err);
    const message = err instanceof Error ? err.message : "Failed to save recipe";
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

    await updateRepoJson<Recipe[]>(
      RECIPES_REPO_PATH,
      (entries) => {
        const index = entries.findIndex((e) => e.id === id);
        if (index === -1) return entries;
        found = true;
        deletedName = entries[index].name;
        const next = [...entries];
        next.splice(index, 1);
        return next;
      },
      `Delete recipe: ${id}`
    );

    if (!found) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    return NextResponse.json({ success: true, deletedName });
  } catch (err) {
    console.error("Recipe delete error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete recipe";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
