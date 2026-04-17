import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const journalPath = join(process.cwd(), "src", "data", "journal.json");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { plantName, plantId, datePlanted, method, variety, location, daysToFruit, notes } = body;

    if (!plantName || !datePlanted || !method || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const raw = readFileSync(journalPath, "utf-8");
    const entries = JSON.parse(raw);

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

    entries.unshift(newEntry);
    writeFileSync(journalPath, JSON.stringify(entries, null, 2));

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error("Journal save error:", err);
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }
}
