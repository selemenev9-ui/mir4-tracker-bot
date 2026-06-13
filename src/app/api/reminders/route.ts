import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

const supabase = getSupabaseClient();

export async function POST(req: NextRequest) {
  const { user_id, boss_id, notify_minutes_before } = (await req.json()) as {
    user_id?: string;
    boss_id?: string;
    notify_minutes_before?: number;
  };

  if (!user_id || !boss_id) {
    return NextResponse.json({ error: "missing_user_or_boss" }, { status: 400 });
  }

  const minutes =
    typeof notify_minutes_before === "number" && Number.isFinite(notify_minutes_before)
      ? notify_minutes_before
      : 10;

  const { error } = await supabase
    .from("personal_reminders")
    .upsert(
      {
        user_id,
        boss_id,
        notify_minutes_before: minutes,
      },
      {
        onConflict: "user_id,boss_id",
      },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { user_id, boss_id } = (await req.json()) as {
    user_id?: string;
    boss_id?: string;
  };

  if (!user_id || !boss_id) {
    return NextResponse.json({ error: "missing_user_or_boss" }, { status: 400 });
  }

  const { error } = await supabase
    .from("personal_reminders")
    .delete()
    .eq("user_id", user_id)
    .eq("boss_id", boss_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "missing_user_id" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("personal_reminders")
    .select("boss_id")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const bosses = (data ?? []).map((row) => row.boss_id as string);

  return NextResponse.json(bosses);
}
