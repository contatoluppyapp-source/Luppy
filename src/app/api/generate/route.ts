import { NextRequest, NextResponse } from "next/server";
import { MOCK_NAIL_PREVIEWS } from "@/lib/mock-data";
import {
  fetchImageAsBase64,
  generateLocalizedNailPreview,
  generateTextOnlyNailPreview,
} from "@/lib/ai/gemini";
import { generateStylePrompts } from "@/lib/ai/generate-style-prompts";
import { NailPreview } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 120;

interface GenerateBody {
  handImageUrl: string;
  referenceImageUrl?: string | null;
  textPrompt?: string;
  inputType?: "text" | "audio" | "image";
}

// Executa uma lista de factories com no máximo `concurrency` simultâneas.
// Se uma factory falhar, retorna null para esse slot (fallback por card).
async function pooledGenerate<T>(
  factories: Array<() => Promise<T>>,
  concurrency: number
): Promise<Array<T | null>> {
  const results: Array<T | null> = new Array(factories.length).fill(null);
  const queue = factories.map((fn, i) => ({ fn, i }));
  const running: Promise<void>[] = [];

  async function runOne(fn: () => Promise<T>, i: number): Promise<void> {
    try {
      results[i] = await fn();
    } catch (err) {
      console.error(`[pool] slot ${i} failed:`, err instanceof Error ? err.message : err);
      results[i] = null;
    }
  }

  let next = 0;
  while (next < queue.length || running.length > 0) {
    while (running.length < concurrency && next < queue.length) {
      const { fn, i } = queue[next++];
      const p = runOne(fn, i).then(() => {
        running.splice(running.indexOf(p), 1);
      });
      running.push(p);
    }
    if (running.length > 0) await Promise.race(running);
  }

  return results;
}

export async function POST(req: NextRequest) {
  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { handImageUrl, referenceImageUrl, textPrompt } = body;

  // Fallback: sem chave configurada, devolve mock.
  if (!process.env.GEMINI_API_KEY) {
    console.log("[/api/generate] RETURNING MOCK — no GEMINI_API_KEY");
    const previews: NailPreview[] = MOCK_NAIL_PREVIEWS.map((p) => ({
      ...p,
      beforeImageUrl: handImageUrl || undefined,
    }));
    return NextResponse.json({ previews, source: "mock" });
  }

  console.log(`[/api/generate] USING GEMINI REAL — key present (${process.env.GEMINI_API_KEY.slice(0, 8)}...)`);

  if (!handImageUrl) {
    console.log("[/api/generate] RETURNING ERROR — handImageUrl missing");
    return NextResponse.json({ error: "handImageUrl is required" }, { status: 400 });
  }

  console.log(
    `[/api/generate] inputs: hand[0:40]=${handImageUrl.slice(0, 40)} ref=${(referenceImageUrl ?? "(none)").slice(0, 60)} textPrompt="${(textPrompt ?? "").slice(0, 60)}"`
  );

  try {
    console.log("[/api/generate] fetching hand image...");
    const hand = await fetchImageAsBase64(handImageUrl);
    console.log(`[/api/generate] hand ready: mime=${hand.mimeType}, base64Len=${hand.base64.length}`);

    // ─── FLUXO 1: referência visual da galeria ───────────────────────────────
    if (referenceImageUrl) {
      console.log("[LOCALIZED MODE] preserving original hand");
      console.log("[LOCALIZED MODE] generating only nail modifications");
      console.log("[/api/generate] REFERENCE MODE — fetching reference image...");
      const reference = await fetchImageAsBase64(referenceImageUrl);
      console.log(`[/api/generate] reference ready: mime=${reference.mimeType}, base64Len=${reference.base64.length}`);

      console.log("[/api/generate] CALLING MODEL — generateLocalizedNailPreview");
      const result = await generateLocalizedNailPreview({
        handImageBase64: hand.base64,
        handMimeType: hand.mimeType,
        referenceImageBase64: reference.base64,
        referenceMimeType: reference.mimeType,
        extraPrompt: textPrompt || undefined,
      });
      console.log(
        `[/api/generate] MODEL RESPONSE RECEIVED — resultMime=${result.mimeType}, base64Len=${result.imageBase64.length}`
      );

      const dataUrl = `data:${result.mimeType};base64,${result.imageBase64}`;
      const previews: NailPreview[] = [
        {
          id: "gemini-1",
          imageUrl: dataUrl,
          beforeImageUrl: handImageUrl,
          styleName: textPrompt || "Sua Preview",
          colorTag: "Personalizado",
          colorHex: "#ff78cb",
        },
      ];
      return NextResponse.json({ previews, source: "gemini-reference" });
    }

    // ─── FLUXO 2: apenas texto — sem referência visual ───────────────────────
    if (!textPrompt?.trim()) {
      console.log("[/api/generate] RETURNING MOCK — no referenceImageUrl and no textPrompt");
      const previews: NailPreview[] = MOCK_NAIL_PREVIEWS.slice(0, 4).map((p) => ({
        ...p,
        beforeImageUrl: handImageUrl,
      }));
      return NextResponse.json({ previews, source: "mock-no-input" });
    }

    console.log("[LOCALIZED MODE] preserving original hand");
    console.log("[LOCALIZED MODE] generating only nail modifications");
    console.log(`[LOCALIZED MODE] generating 2 style prompts from: "${textPrompt}"`);
    const styles = await generateStylePrompts(textPrompt);
    console.log(`[LOCALIZED MODE] received ${styles.length} styles — starting parallel generation (concurrency=2)`);

    // Gera cada estilo contra a mesma mão, com no máximo 2 simultâneas
    const factories = styles.map((style, i) => async () => {
      console.log(`[LOCALIZED MODE] [GENERATING STYLE ${i + 1}/${styles.length}] "${style.styleName}" — ${style.visualPrompt}`);
      const result = await generateTextOnlyNailPreview({
        handImageBase64: hand.base64,
        handMimeType: hand.mimeType,
        visualPrompt: style.visualPrompt,
      });
      console.log(`[LOCALIZED MODE] [DONE STYLE ${i + 1}/${styles.length}] mime=${result.mimeType} base64Len=${result.imageBase64.length}`);
      return result;
    });

    const rawResults = await pooledGenerate(factories, 2);
    console.log(`[LOCALIZED MODE] generation complete — ${rawResults.filter(Boolean).length}/${styles.length} succeeded`);

    // Monta o array de previews: sucesso → imagem real, falha → mock card
    const previews: NailPreview[] = styles.map((style, i) => {
      const raw = rawResults[i];
      if (raw) {
        const dataUrl = `data:${raw.mimeType};base64,${raw.imageBase64}`;
        return {
          id: `gemini-text-${i + 1}`,
          imageUrl: dataUrl,
          beforeImageUrl: handImageUrl,
          styleName: style.styleName,
          colorTag: style.colorTag,
          colorHex: style.colorHex,
        } satisfies NailPreview;
      }
      // Fallback individual: substitui só esse card pelo mock equivalente
      const mock = MOCK_NAIL_PREVIEWS[i % MOCK_NAIL_PREVIEWS.length];
      console.log(`[LOCALIZED MODE] slot ${i + 1} using mock fallback: ${mock.styleName}`);
      return { ...mock, id: `mock-fallback-${i + 1}`, beforeImageUrl: handImageUrl };
    });

    return NextResponse.json({ previews, source: "gemini-text" });
  } catch (err) {
    console.error("[/api/generate] CAUGHT ERROR — falling back to mock:", err);
    const previews: NailPreview[] = MOCK_NAIL_PREVIEWS.map((p) => ({
      ...p,
      beforeImageUrl: handImageUrl || undefined,
    }));
    return NextResponse.json({
      previews,
      source: "mock-fallback",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
