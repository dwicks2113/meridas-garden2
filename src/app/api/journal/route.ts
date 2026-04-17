import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { isAdmin } from "@/lib/adminAuth";

const journalPath = join(process.cwd(), "src", "data", "journal.json");

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

    // Read existing entries
    const raw = readFileSync(journalPath, "utf-8");
    const entries = JSON.parse(raw);

    // Build new entry
    const newEntry = {
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

    entries.unshift(newEntry); // add to top
    writeFileSync(journalPath, JSON.stringify(entries, null, 2));

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error("Journal save error:", err);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
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

    const raw     = readFileSync(journalPath, "utf-8");
    const entries = JSON.parse(raw) as { id: string }[];
    const index   = entries.findIndex((e) => e.id === id);
    if (index === -1) return NextResponse.json({ error: "Entry not found" }, { status: 404 });

    entries.splice(index, 1);
    writeFileSync(journalPath, JSON.stringify(entries, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Journal delete error:", err);
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 });
  }
}
