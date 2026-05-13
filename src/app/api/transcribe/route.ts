import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/ai/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

interface TranscribeBody {
  audioDataUrl: string;
  mimeType: string;
}

export async function POST(req: NextRequest) {
  let body: TranscribeBody;
  try {
    body = (await req.json()) as TranscribeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { audioDataUrl, mimeType } = body;

  if (!audioDataUrl) {
    return NextResponse.json({ error: "audioDataUrl is required" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log("[/api/transcribe] no GEMINI_API_KEY — returning mock transcription");
    return NextResponse.json({ transcript: "Quero unhas com glitter rosa e pontas francesas delicadas", source: "mock" });
  }

  const commaIdx = audioDataUrl.indexOf(",");
  if (commaIdx < 0) {
    return NextResponse.json({ error: "Malformed audioDataUrl" }, { status: 400 });
  }
  const base64 = audioDataUrl.slice(commaIdx + 1);
  const resolvedMime = mimeType || "audio/webm";

  console.log(`[/api/transcribe] transcribing — mime=${resolvedMime} base64Len=${base64.length}`);

  try {
    const transcript = await transcribeAudio(base64, resolvedMime);
    console.log(`[/api/transcribe] done — transcript="${transcript.slice(0, 120)}"`);
    return NextResponse.json({ transcript, source: "gemini" });
  } catch (err) {
    console.error("[/api/transcribe] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
