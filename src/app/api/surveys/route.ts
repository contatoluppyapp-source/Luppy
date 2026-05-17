import { NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ surveys: [], source: "not-configured" });
  }

  const { data, error } = await getSupabase()
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) {
    console.error("[/api/surveys] select failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ surveys: data ?? [] });
}
