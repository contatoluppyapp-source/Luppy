import { NailPreview } from "@/types";
import { MOCK_NAIL_PREVIEWS } from "@/lib/mock-data";

export interface GenerateInput {
  handImageUrl: string;
  inputType: "text" | "audio" | "image";
  textPrompt: string;
  audioBlob?: Blob | null;
  referenceImageUrl?: string | null;
}

// Chama a API server-side que decide entre Gemini real e mock.
// Em caso de qualquer falha de rede, faz fallback gracioso para o mock local.
export async function generateNailPreviews(
  input: GenerateInput
): Promise<NailPreview[]> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handImageUrl: input.handImageUrl,
        referenceImageUrl: input.referenceImageUrl ?? null,
        textPrompt: input.textPrompt,
        inputType: input.inputType,
      }),
    });

    if (!res.ok) throw new Error(`API responded ${res.status}`);
    const data = (await res.json()) as { previews?: NailPreview[] };
    if (!Array.isArray(data.previews) || data.previews.length === 0) {
      throw new Error("No previews returned");
    }
    return data.previews;
  } catch (err) {
    console.warn("[generateNailPreviews] fallback to local mock:", err);
    return MOCK_NAIL_PREVIEWS.map((p) => ({
      ...p,
      beforeImageUrl: input.handImageUrl || undefined,
    }));
  }
}

// Sends audio data URL to the server-side transcription endpoint (keeps API key server-only).
export async function transcribeAudio(audioDataUrl: string, mimeType: string): Promise<string> {
  const res = await fetch("/api/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioDataUrl, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Transcription API responded ${res.status}`);
  }
  const data = (await res.json()) as { transcript?: string };
  if (!data.transcript) throw new Error("Empty transcription returned");
  return data.transcript;
}
