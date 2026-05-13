import { GoogleGenerativeAI } from "@google/generative-ai";

export interface StylePrompt {
  visualPrompt: string;
  styleName: string;
  colorTag: string;
  colorHex: string;
}

// Palavras-chave que indicam estilos claros/minimalistas.
// Esses estilos recebem boost automático de gloss e textura para
// garantir que a transformação seja perceptível na mão real.
const LIGHT_STYLE_KEYWORDS = [
  "nude", "natural", "clean", "minimal", "white", "milk", "soft", "light",
  "pink", "rose", "blush", "beige", "french", "sheer", "translucent",
  "naked", "bare", "gentle", "delicate", "pastel",
];

function isLightStyle(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return LIGHT_STYLE_KEYWORDS.some((kw) => lower.includes(kw));
}

function boostLightStyle(prompt: string): string {
  if (!isLightStyle(prompt)) return prompt;
  // Remove termos vagos e adiciona especificidade visual
  return prompt
    .replace(/\bnude nails?\b/gi, "glossy nude gel manicure")
    .replace(/\bwhite nails?\b/gi, "milky white luxury gel manicure")
    .replace(/\bpink nails?\b/gi, "soft pink reflective gel nails")
    .replace(/\bclean nails?\b/gi, "clean girl glossy almond manicure")
    .replace(/\bfrench tips?\b/gi, "glossy luxury french manicure tips")
    .replace(/\bminimal(ist)? nails?\b/gi, "minimal high-gloss gel manicure")
    + ", high-gloss gel finish, professional salon result, clearly visible manicure";
}

const EXPAND_PROMPT = `You are a nail art style generator for a beauty app.

Given a user's description, generate exactly 2 distinct nail art style prompts in English.
Each prompt must be a concise visual description (10-15 words max) of a specific manicure style.

RULES:
- Each style must be clearly different from the other
- Be specific about: finish (matte/glossy/chrome/gel), shape (almond/square/coffin/oval/round), pattern, color
- Avoid vague terms like "nude nails" — use "glossy nude gel manicure" instead
- For minimalist/nude/light styles, always add: glossy gel finish, professional manicure
- Include diverse options: one elegant/classic, one bold/trendy
- Return ONLY a JSON array of 2 objects with these fields:
  { "visualPrompt": string, "styleName": string, "colorTag": string, "colorHex": string }
- colorHex must be a valid 6-digit hex color representing the dominant nail color
- styleName must be 2-3 words max (the display name shown to the user)
- colorTag must be 1-3 words in Portuguese describing the color
- No markdown, no explanation, no extra text — pure JSON array only`;

export async function generateStylePrompts(
  userPrompt: string
): Promise<StylePrompt[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log(`[LOCALIZED MODE] generateStylePrompts — userPrompt="${userPrompt}"`);

  const result = await model.generateContent([
    { text: EXPAND_PROMPT },
    { text: `User description: "${userPrompt}"` },
  ]);

  const text = result.response.text().trim();
  console.log(`[LOCALIZED MODE] raw response (first 300 chars): ${text.slice(0, 300)}`);

  // Extrai o JSON mesmo que venha com ```json ... ``` ao redor
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("generateStylePrompts: no JSON array in response");

  const parsed = JSON.parse(jsonMatch[0]) as StylePrompt[];
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("generateStylePrompts: empty or invalid array");
  }

  // Garante exatamente 2 e aplica boost nos estilos claros
  const styles = parsed.slice(0, 2).map((s) => ({
    ...s,
    visualPrompt: boostLightStyle(s.visualPrompt),
  }));

  console.log(`[LOCALIZED MODE] ${styles.length} style prompts generated`);
  styles.forEach((s, i) =>
    console.log(`  [${i + 1}] "${s.styleName}" — ${s.visualPrompt}`)
  );

  return styles;
}
