import { NextRequest, NextResponse } from "next/server";
import { DAILY_WORLD_BOSSES, WEEKLY_WORLD_BOSSES } from "@/lib/gameData";
import { getSupabaseClient } from "@/lib/supabase";

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL ?? "";

function getUTC8Time(): { hour: number; minute: number; dayOfWeek: number } {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600 * 1000);
  return {
    hour: utc8.getUTCHours(),
    minute: utc8.getUTCMinutes(),
    dayOfWeek: utc8.getUTCDay(),
  };
}

async function sendWebhook(message: string): Promise<void> {
  if (!WEBHOOK_URL) return;
  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
}

async function hasNotified(
  supabase: ReturnType<typeof getSupabaseClient>,
  key: string
): Promise<boolean> {
  const { data } = await supabase
    .from("notifications_sent")
    .select("id")
    .eq("notification_key", key)
    .gte(
      "sent_at",
      new Date(Date.now() - 15 * 60 * 1000).toISOString()
    )
    .maybeSingle();

  return !!data;
}

async function markNotified(
  supabase: ReturnType<typeof getSupabaseClient>,
  key: string
): Promise<void> {
  await supabase
    .from("notifications_sent")
    .upsert(
      { notification_key: key, sent_at: new Date().toISOString() },
      { onConflict: "notification_key" }
    );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!WEBHOOK_URL) {
    return NextResponse.json({ ok: false, error: "DISCORD_WEBHOOK_URL not configured" });
  }

  const supabase = getSupabaseClient();
  const { hour, minute, dayOfWeek } = getUTC8Time();
  const nowMinutes = hour * 60 + minute;
  const notifications: string[] = [];

  // Check daily world bosses
  for (const boss of DAILY_WORLD_BOSSES) {
    for (const spawnHour of boss.spawnHoursUTC8) {
      const spawnMinutes = spawnHour * 60;
      const diff = spawnMinutes - nowMinutes;
      if (diff === boss.notifyMinutesBefore) {
        const key = `${boss.id}_${spawnHour}_${new Date()
          .toISOString()
          .slice(0, 10)}`;
        if (!(await hasNotified(supabase, key))) {
          await sendWebhook(
            `@here **${boss.name}** spawn in **${boss.notifyMinutesBefore} minutes** — ${boss.zone} (Server time ${String(
              spawnHour
            ).padStart(2, "0")}:00 UTC+8)`
          );
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }

  // Check weekly world bosses
  for (const boss of WEEKLY_WORLD_BOSSES) {
    if (boss.dayOfWeek === dayOfWeek) {
      const spawnMinutes = boss.spawnHourUTC8 * 60;
      const diff = spawnMinutes - nowMinutes;
      if (diff === boss.notifyMinutesBefore) {
        const key = `${boss.id}_${new Date().toISOString().slice(0, 10)}`;
        if (!(await hasNotified(supabase, key))) {
          const desc = boss.description ? `\n> ${boss.description}` : "";
          await sendWebhook(
            `@here **${boss.name}** spawn in **${boss.notifyMinutesBefore} minutes** — ${boss.zone}${desc}`
          );
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent: notifications });
}
