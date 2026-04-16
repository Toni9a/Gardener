import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export async function analyzeGardenHealth(imageBase64: string, mimeType: string): Promise<{
  score: number;
  notes: string;
}> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
  });

  const prompt = `You are a professional garden health analyst. Analyze this garden photo and provide:
1. A garden health score from 0 to 100 using this scale:
   - 90-100: Excellent, thriving garden
   - 75-89: Healthy, well-maintained
   - 60-74: Needs watering or minor attention
   - 40-59: Stressed, needs care
   - 20-39: Struggling, requires urgent attention
   - 0-19: Severe decline or dying plants

2. Brief analysis notes (2-3 sentences) explaining the score.

Respond in JSON format only:
{"score": <number>, "notes": "<analysis>"}`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  const text = result.response.text().trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse Gemini response");

  return JSON.parse(jsonMatch[0]);
}

export async function generateGardenVisualization(
  imageBase64: string,
  mimeType: string,
  preferences: {
    needs_improving: string[];
    add_flowers: boolean;
    preferred_flowers: string[];
    garden_type: string;
  }
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
  });

  const improvements = preferences.needs_improving.join(", ");
  const flowers = preferences.add_flowers
    ? `Add ${preferences.preferred_flowers.length > 0 ? preferences.preferred_flowers.join(", ") : "mixed flowers"}.`
    : "Do not add flowers.";

  const prompt = `You are Green Scene, a professional garden maintenance service based in East Hunsbury, Northampton.

A customer has uploaded a photo of their ${preferences.garden_type} garden. They want improvements to: ${improvements}. ${flowers}

Describe in vivid detail how you would transform this specific garden. Be specific about:
- What you would do to the lawn (if applicable)
- How you would tackle the hedges (if applicable)
- What flower beds or plants you would add
- How the garden would look after your work

Write this as a professional transformation description (3-4 paragraphs) that excites the customer about what GardenScene could do for them. Reference what you can see in their actual photo.`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  return result.response.text();
}

export async function findSimilarGardens(
  imageBase64: string,
  mimeType: string
): Promise<string[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
  });

  const prompt = `Analyze this garden photo and identify its key characteristics.
Return a JSON array of relevant tags from this list:
["overgrown", "lawn-damage", "hedge-overgrowth", "weed-problem", "empty-beds", "neglected", "small-garden", "large-garden", "patio", "front-garden", "back-garden", "lawn-restoration", "hedge-trimming", "garden-clean-up", "planting-flowers"]

Return only the JSON array, e.g. ["overgrown", "hedge-overgrowth", "back-garden"]`;

  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: imageBase64 } },
  ]);

  const text = result.response.text().trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  return JSON.parse(jsonMatch[0]);
}
