import { NailPreview } from "@/types";

// Estado em memória compartilhado entre processing e results.
// Necessário porque data URLs de imagens Gemini (PNG base64, ~2-5MB cada)
// excedem o limite do sessionStorage (~5MB total), causando perda silenciosa dos previews.
// Este módulo vive na memória da aba e sobrevive ao router.push() dentro da mesma SPA.

let stored: NailPreview[] | null = null;

export function setPreviewStore(previews: NailPreview[]): void {
  console.log(
    `[preview-store] setPreviewStore: ${previews.length} previews — ` +
    previews.map((p, i) => `[${i}] id=${p.id} imageUrlLen=${p.imageUrl.length} isBase64=${p.imageUrl.startsWith("data:")}`).join(", ")
  );
  stored = previews;
}

export function getPreviewStore(): NailPreview[] | null {
  console.log(`[preview-store] getPreviewStore: ${stored ? stored.length : "null"} previews in memory`);
  return stored;
}

export function clearPreviewStore(): void {
  stored = null;
}
