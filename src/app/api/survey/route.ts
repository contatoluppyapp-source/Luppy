import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

interface SurveyBody {
  userType: "b2c" | "b2b";
  answers: Record<string, unknown>;
  sessionId?: string;
  device?: string;
}

export async function POST(req: NextRequest) {
  let body: SurveyBody;
  try {
    body = (await req.json()) as SurveyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userType, answers, sessionId, device } = body;

  if (!userType || (userType !== "b2c" && userType !== "b2b")) {
    return NextResponse.json({ error: "userType must be 'b2c' or 'b2b'" }, { status: 400 });
  }
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "answers is required" }, { status: 400 });
  }

  if (!isSupabaseConfigured) {
    console.warn("[/api/survey] Supabase not configured — logging only:", {
      userType,
      sessionId,
      answers,
    });
    return NextResponse.json({ ok: true, source: "log-only" });
  }

  const { error } = await getSupabase().from("surveys").insert({
    user_type: userType,
    session_id: sessionId ?? null,
    device: device ?? null,
    answers,
  });

  if (error) {
    console.error("[/api/survey] insert failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
