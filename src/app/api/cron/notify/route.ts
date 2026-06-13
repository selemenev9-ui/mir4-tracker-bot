import { NextRequest, NextResponse } from "next/server";
import { DAILY_WORLD_BOSSES, WEEKLY_WORLD_BOSSES } from "@/lib/gameData";
import { getSupabaseClient } from "@/lib/supabase";

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL ?? "";
const NOTIFY_BEFORE = 10; // minutes

function getUTC8Time(): { hour: number; minute: number; dayOfWeek: number } {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600 * 1000);
  return {
    hour: utc8.getUTCHours(),
    minute: utc8.getUTCMinutes(),
    dayOfWeek: utc8.getUTCDay(),
  };
}

/** Current date string in UTC+8 for dedup keys */
function getUTC8DateString(): string {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600 * 1000);
  return utc8.toISOString().slice(0, 10);
}

async function sendWebhook(message: string): Promise<void> {
  if (!WEBHOOK_URL) return;
  await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });
}

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? "";

async function openDmChannel(userId: string): Promise<string | null> {
  if (!BOT_TOKEN) return null;

  const res = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: userId }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { id?: string };
  return data.id ?? null;
}

async function sendDM(channelId: string, message: string): Promise<void> {
  if (!BOT_TOKEN) return;

  await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content: message }),
  });
}

async function sendPersonalDMs(
  supabase: ReturnType<typeof getSupabaseClient>,
  bossId: string,
  message: string
): Promise<void> {
  if (!BOT_TOKEN) return;

  const { data: reminders } = await supabase
    .from("personal_reminders")
    .select("user_id")
    .eq("boss_id", bossId);

  if (!reminders?.length) return;

  for (const row of reminders as Array<{ user_id: string }>) {
    const channelId = await openDmChannel(row.user_id);
    if (channelId) {
      await sendDM(channelId, message);
    }
  }
}

async function hasNotified(
  supabase: ReturnType<typeof getSupabaseClient>,
  key: string
): Promise<boolean> {
  const { data } = await supabase
    .from("notifications_sent")
    .select("id")
    .eq("notification_key", key)
    .gte("sent_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
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

/** Format hour as HH:00 UTC+8 */
function fmtHour(h: number): string {
  return `${String(h).padStart(2, "0")}:00 UTC+8`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!WEBHOOK_URL) {
    return NextResponse.json({
      ok: false,
      error: "DISCORD_WEBHOOK_URL not configured",
    });
  }

  const supabase = getSupabaseClient();
  const { hour, minute, dayOfWeek } = getUTC8Time();
  const nowMinutes = hour * 60 + minute;
  const today = getUTC8DateString();
  const notifications: string[] = [];

  // ── 1. Daily World Bosses (unchanged) ──────────────────────────────────────
  for (const boss of DAILY_WORLD_BOSSES) {
    for (const spawnHour of boss.spawnHoursUTC8) {
      const diff = spawnHour * 60 - nowMinutes;
      if (diff === boss.notifyMinutesBefore) {
        const key = `${boss.id}_${spawnHour}_${today}`;
        if (!(await hasNotified(supabase, key))) {
          const message = `@here ⚔️ **${boss.name}** spawns in **${boss.notifyMinutesBefore} min** — ${boss.zone} (${fmtHour(
            spawnHour
          )})`;
          await sendWebhook(message);
          await sendPersonalDMs(supabase, boss.id, message);
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }

  // ── 2. Weekly World Bosses — Valley only ───────────────────────────────────
  const VALLEY_LAB_IDS = new Set([
    "krukan",
    "valley_capture",
    "wraiths",
    "utukan",
  ]);
  for (const boss of WEEKLY_WORLD_BOSSES) {
    if (!VALLEY_LAB_IDS.has(boss.id)) continue;
    if (boss.dayOfWeek === dayOfWeek) {
      const diff = boss.spawnHourUTC8 * 60 - nowMinutes;
      if (diff === boss.notifyMinutesBefore) {
        const key = `${boss.id}_${today}`;
        if (!(await hasNotified(supabase, key))) {
          const desc = boss.description ? `\n> ${boss.description}` : "";
          const message = `@here 🏆 **${boss.name}** spawns in **${boss.notifyMinutesBefore} min** — ${boss.zone}${desc}`;
          await sendWebhook(message);
          await sendPersonalDMs(supabase, boss.id, message);
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }


  return NextResponse.json({ ok: true, sent: notifications });
}
