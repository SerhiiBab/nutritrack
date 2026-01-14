// /api/parseMeal.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { NutritionData } from '../src/types'; // путь к твоему types.ts

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY!, // <-- используем API_KEY
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { description } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Beschreibung fehlt oder ist ungültig' });
  }

  try {
    // Генерируем ответ от Gemini
    const response = await ai.generate({
      model: 'gemini-pro-v1',
      prompt: `
Analysiere diese Mahlzeit und gib die Nährwerte in JSON zurück.
Format:
[
  {
    "itemName": "NAME DES LEBENSMITTELS",
    "calories": 0,
    "protein": 0,
    "fat": 0,
    "carbs": 0
  }
]
Mahlzeit: ${description}
      `,
      maxOutputTokens: 500,
    });

    // Попытка распарсить JSON из ответа AI
    let data: NutritionData[];
    try {
      data = JSON.parse(response.outputText);
    } catch (e) {
      console.error('Fehler beim Parsen von AI-Output:', e, response.outputText);
      return res.status(500).json({ error: 'AI Antwort konnte nicht geparst werden' });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Fehler beim Abrufen von Gemini:', err);
    res.status(500).json({ error: 'Fehler beim Abrufen der Mahlzeitanalyse' });
  }
}
