import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export interface BossTimer {
  boss_name: string;
  location: string;
  updated_by: string;
  boss_type: "dynamic" | "static";
  last_killed: string; // ISO timestamp
  next_spawn: string; // ISO timestamp
}

export async function GET(): Promise<NextResponse> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { success: false, error: "Missing env vars" },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("boss_timers")
      .select("boss_name, location, updated_by, boss_type, last_killed, next_spawn")
      .order("next_spawn", { ascending: true });

    if (error) {
      console.error("Failed to fetch boss timers:", JSON.stringify(error));
      return NextResponse.json(
        { success: false, error: "Failed to fetch timers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, timers: (data ?? []) as BossTimer[] });
  } catch (error) {
    console.error("Unexpected error in get-timers", error);
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
