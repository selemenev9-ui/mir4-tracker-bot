import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

type ReportKillBody = {
  bossName?: string;
  location?: string;
  reporterId?: string;
  respawnMinutes?: number;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: ReportKillBody;

  try {
    body = (await request.json()) as ReportKillBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const bossName = (body.bossName ?? "").trim();
  const location = (body.location ?? "").trim();
  const reporterId = (body.reporterId ?? "").trim();
  const respawnMinutes =
    typeof body.respawnMinutes === "number" && body.respawnMinutes > 0
      ? body.respawnMinutes
      : 180;

  if (!bossName || !location || !reporterId) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();
  const now = new Date();
  const nextSpawn = new Date(now.getTime() + respawnMinutes * 60 * 1000);

  try {
    const { error } = await supabase
      .from("boss_timers")
      .upsert(
        {
          boss_name: bossName,
          location,
          updated_by: reporterId,
          boss_type: "dynamic",
          next_spawn: nextSpawn.toISOString(),
          last_killed: now.toISOString(),
        },
        { onConflict: "boss_name" }
      );

    if (error) {
      console.error("Failed to insert boss timer from report-kill API", error);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to record boss kill. Please try again or contact an administrator.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error while inserting boss timer from report-kill API", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while recording the boss kill.",
      },
      { status: 500 }
    );
  }
}
