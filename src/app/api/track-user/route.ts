import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { discord_id, username } = await req.json() as {
    discord_id?: string;
    username?: string;
  };

  if (!discord_id) return NextResponse.json({ ok: false });

  const supabase = getSupabaseClient();

  await supabase.from("app_users").upsert(
    {
      discord_id,
      username: username ?? null,
      last_seen: new Date().toISOString(),
    },
    { onConflict: "discord_id", ignoreDuplicates: false }
  );

  return NextResponse.json({ ok: true });
}
