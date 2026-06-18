import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

const supabase = getSupabaseClient();

export async function POST(req: NextRequest) {
  const { user_id, label, note, fire_at } = (await req.json()) as {
    user_id?: string;
    label?: string;
    note?: string;
    fire_at?: string;
  };

  if (!user_id || !label || !fire_at) {
    return NextResponse.json({ error: "missing_required_fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("custom_reminders")
    .insert({ user_id, label, note: note ?? null, fire_at });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = (await req.json()) as { id?: string };

  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("custom_reminders")
    .delete()
    .eq("id", id);

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
    .from("custom_reminders")
    .select("*")
    .eq("user_id", userId)
    .gte("fire_at", new Date().toISOString())
    .order("fire_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data ?? []);
}
