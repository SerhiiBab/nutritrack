
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const nutritionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      itemName: { type: Type.STRING, description: "Name des Lebensmittels auf Deutsch" },
      calories: { type: Type.NUMBER, description: "Gesamtkalorien in kcal" },
      protein: { type: Type.NUMBER, description: "Gesamtprotein in Gramm" },
      fat: { type: Type.NUMBER, description: "Gesamtfett in Gramm" },
      carbs: { type: Type.NUMBER, description: "Gesamtkohlenhydrate in Gramm" },
    },
    required: ["itemName", "calories", "protein", "fat", "carbs"],
  }
};

export async function parseMealDescription(description: string): Promise<NutritionData[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extrahiere die Nährwertinformationen für die folgende Mahlzeitenbeschreibung: "${description}". Gib genaue Schätzungen basierend auf Standard-Nährwertdaten an. Die Namen der Lebensmittel im JSON sollten auf Deutsch sein.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: nutritionSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Leere Antwort von der KI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Fehler bei der Analyse der Mahlzeit:", error);
    throw error;
  }
}
