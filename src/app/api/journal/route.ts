import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { updateRepoJson } from "@/lib/repoStorage";

const JOURNAL_REPO_PATH = "src/data/journal.json";

interface JournalEntry {
  id: string;
  plantId: string;
  plantName: string;
  datePlanted: string;
  method: string;
  variety: string;
  location: string;
  daysToFruit?: number;
  notes: string;
  images: string[];
  updates: unknown[];
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { plantName, plantId, datePlanted, method, variety, location, daysToFruit, notes } = body;

    if (!plantName || !datePlanted || !method || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      plantId: plantId || plantName.toLowerCase().replace(/\s+/g, "-"),
      plantName,
      datePlanted,
      method,
      variety: variety || "",
      location,
      daysToFruit: daysToFruit ? Number(daysToFruit) : undefined,
      notes: notes || "",
      images: [],
      updates: [],
    };

    await updateRepoJson<JournalEntry[]>(
      JOURNAL_REPO_PATH,
      (entries) => [newEntry, ...entries],
      `Add journal entry: ${plantName}`
    );

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error("Journal save error:", err);
    const message = err instanceof Error ? err.message : "Failed to save entry";
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

    await updateRepoJson<JournalEntry[]>(
      JOURNAL_REPO_PATH,
      (entries) => {
        const index = entries.findIndex((e) => e.id === id);
        if (index === -1) return entries;
        found = true;
        const next = [...entries];
        next.splice(index, 1);
        return next;
      },
      `Delete journal entry: ${id}`
    );

    if (!found) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Journal delete error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete entry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
