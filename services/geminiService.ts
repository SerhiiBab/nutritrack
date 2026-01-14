// ./services/geminiService.ts
import { NutritionData } from "../types";

export async function parseMealDescription(description: string): Promise<NutritionData[]> {
  const res = await fetch("/api/parseMeal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description }),
  });

  if (!res.ok) {
    throw new Error("Fehler beim Abrufen der Mahlzeitanalyse");
  }

  const data = await res.json();
  return data;
}
