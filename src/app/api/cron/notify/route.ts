import { NextRequest, NextResponse } from "next/server";
import {
  DAILY_WORLD_BOSSES,
  WEEKLY_WORLD_BOSSES,
  SQUARE_11_EVENTS,
  DRAGON_TOWER_EVENTS,
  EVENT_MIRAGE_EVENTS,
  PURGATORY_EVENTS,
  SERVER_EVENTS,
  MAGIC_SQUARE_BOSSES,
} from "@/lib/gameData";
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

  const userIds = (reminders as Array<{ user_id: string }>).map((r) => r.user_id);

  // Send DM to each subscriber
  for (const userId of userIds) {
    const channelId = await openDmChannel(userId);
    if (channelId) {
      await sendDM(channelId, message);
    }
  }

  // Delete reminders after sending — one-time only
  await supabase
    .from("personal_reminders")
    .delete()
    .eq("boss_id", bossId)
    .in("user_id", userIds);
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

/**
 * Проверяет, должно ли фиксированное событие отправить уведомление прямо сейчас.
 * Возвращает true если событие спавнится ровно через NOTIFY_BEFORE минут.
 */
function shouldNotifyFixed(spawnHoursUTC8: number[], nowMinutes: number): boolean {
  return spawnHoursUTC8.some((h) => h * 60 - nowMinutes === NOTIFY_BEFORE);
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

  // ── 3. Square 11 Events ─────────────────────────────────────────────────────
  for (const event of SQUARE_11_EVENTS) {
    if (shouldNotifyFixed(event.spawnHoursUTC8, nowMinutes)) {
      const key = `${event.id}_${today}`;
      if (!(await hasNotified(supabase, key))) {
        const msg = `🏛️ **${event.name}** (Square 11) starts in **${NOTIFY_BEFORE} min**`;
        await sendPersonalDMs(supabase, event.id, msg);
        await markNotified(supabase, key);
        notifications.push(key);
      }
    }
  }

  // ── 4. Dragon Tower Events ─────────────────────────────────────────────────
  for (const event of DRAGON_TOWER_EVENTS) {
    if (shouldNotifyFixed(event.spawnHoursUTC8, nowMinutes)) {
      const key = `${event.id}_${today}`;
      if (!(await hasNotified(supabase, key))) {
        const msg = `🐉 **${event.name}** (Dragon Tower) starts in **${NOTIFY_BEFORE} min**`;
        await sendPersonalDMs(supabase, event.id, msg);
        await markNotified(supabase, key);
        notifications.push(key);
      }
    }
  }

  // ── 5. Event Mirage Events ─────────────────────────────────────────────────
  for (const event of EVENT_MIRAGE_EVENTS) {
    if (shouldNotifyFixed(event.spawnHoursUTC8, nowMinutes)) {
      const key = `${event.id}_${today}`;
      if (!(await hasNotified(supabase, key))) {
        const msg = `🌀 **${event.name}** (Event Mirage) starts in **${NOTIFY_BEFORE} min**`;
        await sendPersonalDMs(supabase, event.id, msg);
        await markNotified(supabase, key);
        notifications.push(key);
      }
    }
  }

  // ── 6. Purgatory Events ────────────────────────────────────────────────────
  for (const event of PURGATORY_EVENTS) {
    if (shouldNotifyFixed(event.spawnHoursUTC8, nowMinutes)) {
      const key = `${event.id}_${today}`;
      if (!(await hasNotified(supabase, key))) {
        const msg = `💀 **${event.name}** (Purgatory) starts in **${NOTIFY_BEFORE} min**`;
        await sendPersonalDMs(supabase, event.id, msg);
        await markNotified(supabase, key);
        notifications.push(key);
      }
    }
  }

  // ── 7. Server & System Events ──────────────────────────────────────────────
  for (const event of SERVER_EVENTS) {
    if (shouldNotifyFixed(event.spawnHoursUTC8, nowMinutes)) {
      const key = `${event.id}_${today}`;
      if (!(await hasNotified(supabase, key))) {
        const kindLabel = event.category === "server" ? "Server" : "System";
        const msg = `⚙️ **${event.name}** (${kindLabel}) in **${NOTIFY_BEFORE} min**`;
        await sendPersonalDMs(supabase, event.id, msg);
        await markNotified(supabase, key);
        notifications.push(key);
      }
    }
  }

  // ── 8. Chamber III (fixed schedule, all floors) ────────────────────────────
  const chamberIIIHours = [3, 6, 9, 12, 15, 18, 21, 0];
  if (shouldNotifyFixed(chamberIIIHours, nowMinutes)) {
    for (const boss of MAGIC_SQUARE_BOSSES.filter((b) => b.type === "chamber3")) {
      await sendPersonalDMs(
        supabase,
        boss.id,
        `🏛️ **Chamber III Floor ${boss.floor}** spawns in **${NOTIFY_BEFORE} min**`
      );
    }
  }

  // ── 9. Dynamic timers (Secret Peak Teal/Gold, Chamber I/II) ────────────────
  const windowStart = new Date(
    Date.now() + (NOTIFY_BEFORE - 2) * 60 * 1000
  ).toISOString();
  const windowEnd = new Date(
    Date.now() + (NOTIFY_BEFORE + 2) * 60 * 1000
  ).toISOString();

  const { data: dynamicTimers } = await supabase
    .from("boss_timers")
    .select("boss_name, next_spawn")
    .gte("next_spawn", windowStart)
    .lte("next_spawn", windowEnd);

  if (dynamicTimers?.length) {
    for (const timer of dynamicTimers as Array<{
      boss_name: string;
      next_spawn: string;
    }>) {
      const key = `dynamic_${timer.boss_name}_${timer.next_spawn}`;
      if (!(await hasNotified(supabase, key))) {
        await sendPersonalDMs(
          supabase,
          timer.boss_name,
          `⏰ **${timer.boss_name}** respawns in **~${NOTIFY_BEFORE} min**!`
        );
        await markNotified(supabase, key);
        notifications.push(key);
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
