export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  category: "flowers" | "edible-flowers" | "vegetables" | "fruits" | "medicinal";
  description: string;
  sun: string;
  water: string;
  plantingMonths: string[];
  daysToBloom: string;
  careNotes: string;
  image: string;
  medicinalUses?: string[];
  recipes?: Recipe[];
}

export interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string;
  caution: string;
}

export interface JournalUpdate {
  date: string;
  note: string;
}

export interface JournalEntry {
  id: string;
  plantId: string;
  plantName: string;
  datePlanted: string;
  method: "seed" | "transplant" | "cutting" | "division";
  variety: string;
  location: string;
  daysToFruit?: number;
  notes: string;
  images: string[];
  updates: JournalUpdate[];
}

export type Category = "all" | "flowers" | "edible-flowers" | "vegetables" | "fruits" | "medicinal";

export const CATEGORY_LABELS: Record<Category, string> = {
  all: "All Plants",
  flowers: "Flowers",
  "edible-flowers": "Edible Flowers",
  vegetables: "Vegetables",
  fruits: "Fruits",
  medicinal: "Medicinal Plants",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  all: "bg-gray-600",
  flowers: "bg-pink-500",
  "edible-flowers": "bg-orange-500",
  vegetables: "bg-garden-green",
  fruits: "bg-purple-600",
  medicinal: "bg-teal-600",
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  flowers: "",
  "edible-flowers": "",
  vegetables: "",
  fruits: "",
  medicinal: "",
};
