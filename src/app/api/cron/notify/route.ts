import { NextRequest, NextResponse } from "next/server";
import {
  DAILY_WORLD_BOSSES,
  WEEKLY_WORLD_BOSSES,
  MAGIC_SQUARE_BOSSES,
  MIRAGE_BOSSES,
  REDMOON_BOSSES,
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
          await sendWebhook(
            `@here ⚔️ **${boss.name}** spawns in **${boss.notifyMinutesBefore} min** — ${boss.zone} (${fmtHour(
              spawnHour
            )})`
          );
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }

  // ── 2. Weekly World Bosses (unchanged) ─────────────────────────────────────
  for (const boss of WEEKLY_WORLD_BOSSES) {
    if (boss.dayOfWeek === dayOfWeek) {
      const diff = boss.spawnHourUTC8 * 60 - nowMinutes;
      if (diff === boss.notifyMinutesBefore) {
        const key = `${boss.id}_${today}`;
        if (!(await hasNotified(supabase, key))) {
          const desc = boss.description ? `\n> ${boss.description}` : "";
          await sendWebhook(
            `@here 🏆 **${boss.name}** spawns in **${boss.notifyMinutesBefore} min** — ${boss.zone}${desc}`
          );
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }

  // ── 3. Secret Peak — Red Lords (fixed schedule, same times on all floors) ──
  const redLordTypes = [
    {
      name: "Red Lord (Lower)",
      hours: [1, 7, 13, 19],
      emoji: "🔴",
    },
    {
      name: "Red Lord (Upper)",
      hours: [4, 10, 16, 22],
      emoji: "🔴",
    },
  ];

  for (const rl of redLordTypes) {
    for (const spawnHour of rl.hours) {
      const diff = spawnHour * 60 - nowMinutes;
      if (diff === NOTIFY_BEFORE) {
        const key = `sp_${rl.name.replace(/\s/g, "_").toLowerCase()}_${spawnHour}_${today}`;
        if (!(await hasNotified(supabase, key))) {
          await sendWebhook(
            `@here ${rl.emoji} **${rl.name}** spawns in **${NOTIFY_BEFORE} min** on all Secret Peak floors (${fmtHour(
              spawnHour
            )})`
          );
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }

  // ── 4. Magic Square — Leaders Chamber III (every 3h from 00:00) ────────────
  const chamber3Hours =
    MAGIC_SQUARE_BOSSES.find((b) => b.type === "chamber3")?.fixedHoursUTC8 ??
    [0, 3, 6, 9, 12, 15, 18, 21];

  for (const spawnHour of chamber3Hours) {
    const diff = spawnHour * 60 - nowMinutes;
    if (diff === NOTIFY_BEFORE) {
      const key = `magic_chamber3_${spawnHour}_${today}`;
      if (!(await hasNotified(supabase, key))) {
        await sendWebhook(
          `@here 🏯 **Leaders Chamber III** spawns in **${NOTIFY_BEFORE} min** on all Magic Square floors (${fmtHour(
            spawnHour
          )})`
        );
        await markNotified(supabase, key);
        notifications.push(key);
      }
    }
  }

  // ── 5. Mirage Bosses (fixed spawn schedule) ─────────────────────────────────
  for (const boss of MIRAGE_BOSSES) {
    for (const timeStr of boss.spawnTimes) {
      const [hStr, mStr] = timeStr.split(":");
      const spawnH = parseInt(hStr, 10);
      const spawnM = parseInt(mStr ?? "0", 10);
      if (Number.isNaN(spawnH) || Number.isNaN(spawnM)) continue;
      const spawnTotalMinutes = spawnH * 60 + spawnM;
      const diff = spawnTotalMinutes - nowMinutes;
      if (diff === NOTIFY_BEFORE) {
        const key = `mirage_${boss.id}_${spawnH}_${spawnM}_${today}`;
        if (!(await hasNotified(supabase, key))) {
          await sendWebhook(
            `@here ⚡ **${boss.name}** spawns in **${NOTIFY_BEFORE} min** — ${boss.location} (${boss.world}, ${String(
              spawnH
            ).padStart(2, "0")}:${String(spawnM).padStart(2, "0")} UTC+8)`
          );
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }

  // ── 6. Redmoon Purgatory Bosses ─────────────────────────────────────────────
  for (const boss of REDMOON_BOSSES) {
    if (boss.dayOfWeek !== undefined && boss.dayOfWeek !== dayOfWeek) continue;

    for (const spawnHour of boss.spawnHoursUTC8) {
      const diff = spawnHour * 60 - nowMinutes;
      if (diff === boss.notifyMinutesBefore) {
        const key = `${boss.id}_${spawnHour}_${today}`;
        if (!(await hasNotified(supabase, key))) {
          const desc = boss.description ? `\n> ${boss.description}` : "";
          await sendWebhook(
            `@here 🌙 **${boss.name}** spawns in **${boss.notifyMinutesBefore} min** — Redmoon Purgatory (${fmtHour(
              spawnHour
            )})${desc}`
          );
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent: notifications });
}
