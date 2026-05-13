import { GoogleGenerativeAI } from "@google/generative-ai";

export interface LocalizedNailPreviewInput {
  handImageBase64: string;
  handMimeType: string;
  referenceImageBase64: string;
  referenceMimeType: string;
  extraPrompt?: string;
}

export interface LocalizedNailPreviewResult {
  imageBase64: string;
  mimeType: string;
}

const SYSTEM_PROMPT = `You are NOT allowed to recreate the image.

MUST PRESERVE (identical to original photo):
- the hand itself (all fingers, knuckles, anatomy)
- skin texture, tone, pores, marks
- background (every pixel)
- lighting direction and intensity
- all shadows
- hand pose, angle, perspective
- camera framing

ONLY ALLOWED TO MODIFY:
- the nail plate surface itself (the visible nail area on each finger)
- apply the style from the reference image proportionally to each nail

FORBIDDEN:
- regenerating the scene
- creating a new hand
- beautifying or smoothing skin
- altering lighting, shadows, or background
- modifying anything outside the nail boundaries
- changing finger position or angle

The final image must be pixel-identical to the original photo except inside the nail boundaries. Treat this as a localized overlay, not a regeneration.

Visibility note: even for nude/minimal/natural styles, the nail surface itself must show clear gloss and a professional finish so the user perceives the transformation. This applies ONLY to the nail surface — never to skin or scene.`;

const TEXT_ONLY_PROMPT = `You are NOT allowed to recreate the image.

MUST PRESERVE (identical to original photo):
- the hand itself (all fingers, knuckles, anatomy)
- skin texture, tone, pores, marks
- background (every pixel)
- lighting direction and intensity
- all shadows
- hand pose, angle, perspective
- camera framing

ONLY ALLOWED TO MODIFY:
- the nail plate surface itself (the visible nail area on each finger)
- apply the nail art style described below proportionally to each nail

FORBIDDEN:
- regenerating the scene
- creating a new hand
- beautifying or smoothing skin
- altering lighting, shadows, or background
- modifying anything outside the nail boundaries
- changing finger position or angle

The final image must be pixel-identical to the original photo except inside the nail boundaries. Treat this as a localized overlay, not a regeneration.

Visibility note: even for nude/minimal/natural styles, the nail surface itself must show clear gloss and a professional finish so the user perceives the transformation. This applies ONLY to the nail surface — never to skin or scene.

Nail style to apply:
`;

// Modelo image-in/image-out do Gemini validado com SDK @google/generative-ai v0.24.x.
// responseModalities deve usar "Image" e "Text" com inicial maiúscula.
const IMAGE_MODEL = "gemini-2.5-flash-image";

export async function generateLocalizedNailPreview(
  input: LocalizedNailPreviewInput
): Promise<LocalizedNailPreviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // responseModalities obrigatório para receber imagem de volta.
  // Usar "Image" e "Text" com inicial maiúscula (exigido pela API v1beta).
  const model = genAI.getGenerativeModel({
    model: IMAGE_MODEL,
    generationConfig: {
      // @ts-expect-error responseModalities não está no tipo público do SDK 0.24.x
      responseModalities: ["Image", "Text"],
    },
  });

  const userPrompt = input.extraPrompt
    ? `${SYSTEM_PROMPT}\n\nAdditional style hint: ${input.extraPrompt}`
    : SYSTEM_PROMPT;

  console.log("[gemini] localized overlay mode — preservation-strict prompt active");
  console.log(
    `[gemini] CALLING MODEL=${IMAGE_MODEL} handMime=${input.handMimeType} handBase64Len=${input.handImageBase64.length} refMime=${input.referenceMimeType} refBase64Len=${input.referenceImageBase64.length}`
  );

  const result = await model.generateContent([
    { text: userPrompt },
    {
      inlineData: {
        data: input.handImageBase64,
        mimeType: input.handMimeType,
      },
    },
    {
      inlineData: {
        data: input.referenceImageBase64,
        mimeType: input.referenceMimeType,
      },
    },
  ]);

  // Log da resposta completa para diagnóstico
  const candidate = result.response.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  console.log(
    `[gemini] MODEL RESPONSE RECEIVED — finishReason=${candidate?.finishReason ?? "unknown"} partsCount=${parts.length} partTypes=${parts.map((p) => {
      const pp = p as { text?: string; inlineData?: { mimeType?: string } };
      return pp.inlineData ? `image(${pp.inlineData.mimeType})` : pp.text ? "text" : "unknown";
    }).join(",")}`
  );

  // Procura pela primeira parte que seja imagem.
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
    if (inline?.data) {
      console.log(`[gemini] IMAGE PART FOUND — mime=${inline.mimeType} base64Len=${inline.data.length}`);
      return {
        imageBase64: inline.data,
        mimeType: inline.mimeType ?? "image/png",
      };
    }
    // Loga partes de texto para diagnóstico
    const textPart = (part as { text?: string }).text;
    if (textPart) {
      console.log(`[gemini] text part: ${textPart.slice(0, 120)}`);
    }
  }

  throw new Error(`Gemini did not return an image — finishReason=${candidate?.finishReason ?? "unknown"} parts=${parts.length}`);
}

export interface TextOnlyNailPreviewInput {
  handImageBase64: string;
  handMimeType: string;
  visualPrompt: string;
}

// Gera uma preview aplicando um estilo descrito em texto — sem imagem de referência.
// Usado no fluxo "Criar do zero" (mão + texto/áudio, sem galeria).
export async function generateTextOnlyNailPreview(
  input: TextOnlyNailPreviewInput
): Promise<LocalizedNailPreviewResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: IMAGE_MODEL,
    generationConfig: {
      // @ts-expect-error responseModalities não está no tipo público do SDK 0.24.x
      responseModalities: ["Image", "Text"],
    },
  });

  const fullPrompt = TEXT_ONLY_PROMPT + input.visualPrompt;

  console.log("[gemini:text] localized overlay mode — preservation-strict prompt active");
  console.log(
    `[gemini:text] CALLING MODEL=${IMAGE_MODEL} visualPrompt="${input.visualPrompt.slice(0, 80)}" handMime=${input.handMimeType} handBase64Len=${input.handImageBase64.length}`
  );

  const result = await model.generateContent([
    { text: fullPrompt },
    {
      inlineData: {
        data: input.handImageBase64,
        mimeType: input.handMimeType,
      },
    },
  ]);

  const candidate = result.response.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  console.log(
    `[gemini:text] RESPONSE — finishReason=${candidate?.finishReason ?? "unknown"} partsCount=${parts.length} partTypes=${parts
      .map((p) => {
        const pp = p as { text?: string; inlineData?: { mimeType?: string } };
        return pp.inlineData ? `image(${pp.inlineData.mimeType})` : pp.text ? "text" : "unknown";
      })
      .join(",")}`
  );

  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
    if (inline?.data) {
      console.log(`[gemini:text] IMAGE PART FOUND — mime=${inline.mimeType} base64Len=${inline.data.length}`);
      return { imageBase64: inline.data, mimeType: inline.mimeType ?? "image/png" };
    }
    const textPart = (part as { text?: string }).text;
    if (textPart) console.log(`[gemini:text] text part: ${textPart.slice(0, 120)}`);
  }

  throw new Error(
    `generateTextOnlyNailPreview: no image returned — finishReason=${candidate?.finishReason ?? "unknown"} parts=${parts.length}`
  );
}

export async function transcribeAudio(
  audioBase64: string,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  console.log(`[gemini:audio] transcribing — mime=${mimeType} base64Len=${audioBase64.length}`);

  const result = await model.generateContent([
    {
      text: "Transcreva exatamente o que a usuária está pedindo sobre estilo de unhas. Retorne apenas a transcrição limpa, sem explicações ou formatação.",
    },
    {
      inlineData: {
        data: audioBase64,
        mimeType,
      },
    },
  ]);

  const text = result.response.text().trim();
  console.log(`[gemini:audio] transcription result: "${text.slice(0, 120)}"`);
  if (!text) throw new Error("Gemini returned empty transcription");
  return text;
}

export async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string }> {
  const kind = url.startsWith("data:")
    ? "data-url"
    : url.startsWith("http://") || url.startsWith("https://")
    ? "http"
    : url.startsWith("blob:")
    ? "blob"
    : "unknown";

  console.log(`[gemini] fetchImageAsBase64: kind=${kind}, length=${url.length}`);

  if (kind === "blob") {
    throw new Error(
      "blob: URLs cannot be fetched server-side. " +
        "Convert the file to a data URL on the client before sending."
    );
  }

  if (kind === "data-url") {
    // Formato esperado: data:<mime>;base64,<payload>
    // Em vez de regex (que tem limitações de flag), corta manualmente na primeira vírgula.
    const commaIdx = url.indexOf(",");
    if (commaIdx < 0) throw new Error("Malformed data URL: missing comma");
    const meta = url.slice(5, commaIdx); // pula "data:"
    const payload = url.slice(commaIdx + 1);
    const parts = meta.split(";");
    const mimeType = parts[0] || "image/jpeg";
    const encoding = parts.find((p) => p === "base64");
    if (!encoding) {
      throw new Error(`Unsupported data URL encoding: not base64 (got ${parts.slice(1).join(",")})`);
    }
    console.log(`[gemini] data URL parsed: mime=${mimeType}, base64Len=${payload.length}`);
    return { base64: payload, mimeType };
  }

  if (kind === "http") {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const mimeType = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    const base64 = buf.toString("base64");
    console.log(`[gemini] http fetched: mime=${mimeType}, base64Len=${base64.length}`);
    return { base64, mimeType };
  }

  throw new Error(`Unsupported image URL kind: ${url.slice(0, 40)}...`);
}
