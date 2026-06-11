# MIR4 Global Boss Tracker — Full Development Prompt for Windsurf Agent

**Project location:** `C:\Users\Administrator\Desktop\mir4-tracker-bot`
**Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Supabase, Discord Embedded App SDK, TypeScript
**Deploy:** Vercel (auto-deploy from GitHub main)
**Server timezone:** UTC+8 (all game times are UTC+8)

---

## OVERVIEW

Implement the full MIR4 Boss Tracker application. This is a complete overhaul of the existing prototype. Do NOT delete any existing file — modify or extend them. Create new files as specified below.

**Design standard:** AWWWARDS-level dark cinematic UI. No emojis anywhere. Pure CSS animations, glassmorphism, glowing timers. Background: `#050712`.

---

## TASK 1 — Fix critical upsert bug (2 files)

### File: `src/app/api/report-kill/route.ts`
On line 38, replace:
```ts
const { error } = await supabase.from("boss_timers").insert({
```
With:
```ts
const { error } = await supabase.from("boss_timers").upsert({
  boss_name: bossName,
  location,
  updated_by: reporterId,
  boss_type: "dynamic",
  next_spawn: nextSpawn.toISOString(),
  last_killed: now.toISOString(),
}, { onConflict: 'boss_name' });
```
Remove the object argument that was after `.insert(` since it's now inside upsert.

### File: `src/app/api/interactions/route.ts`
On line 291, replace:
```ts
const { error } = await supabase.from("boss_timers").insert({
```
With:
```ts
const { error } = await supabase.from("boss_timers").upsert({
  boss_name: bossName,
  location,
  updated_by: userId,
  boss_type: "dynamic",
  next_spawn: nextSpawn.toISOString(),
  last_killed: now.toISOString(),
}, { onConflict: 'boss_name' });
```

---

## TASK 2 — Fix layout metadata

### File: `src/app/layout.tsx`
Replace the metadata object:
```ts
export const metadata: Metadata = {
  title: "MIR4 Boss Tracker",
  description: "Real-time boss spawn tracker for MIR4 guilds — Secret Peak, Mirage, and World Bosses.",
};
```

---

## TASK 3 — Create `src/lib/gameData.ts`

Create a new file with all static game data. This is the single source of truth for all scheduled boss timings.

```ts
// src/lib/gameData.ts
// All times are in UTC+8 (server timezone)

export type BossType = 'blue' | 'gold' | 'red' | 'red_upper' | 'red_lower' | 'chamber';
export type RegionId = 'secret_peak' | 'mirage' | 'world_daily' | 'world_weekly';

// ─── SECRET PEAK (Magic Square) ──────────────────────────────────────────────
// One map image for all 10 floors. Boss type determines respawn behavior.
// Blue bosses: 30 min after kill (dynamic)
// Gold bosses: 60 min after kill (dynamic)
// Red Lower Left: fixed at 13:00 / 19:00 / 01:00 / 07:00 (UTC+8)
// Red Upper Right: fixed at 16:00 / 22:00 / 04:00 / 10:00 (UTC+8)
// Leader's Chamber I: 30 min after kill (dynamic)
// Leader's Chamber II: 45 min after kill (dynamic)
// Leader's Chamber III: fixed every 3h — 03:00 / 06:00 / 09:00 / 12:00 / 15:00 / 18:00 / 21:00 / 00:00

export interface SecretPeakBoss {
  id: string;
  name: string;
  floor: number;
  type: BossType;
  // For dynamic bosses: respawn minutes after kill
  respawnMinutes?: number;
  // For fixed-schedule bosses: UTC+8 hours when boss spawns
  fixedHoursUTC8?: number[];
  // Map pin position (percentage)
  pinX: number;
  pinY: number;
}

export const SECRET_PEAK_BOSSES: SecretPeakBoss[] = [
  // Floor 1
  { id: 'sp_f1_blue',        name: 'Blue Guardian',      floor: 1,  type: 'blue',      respawnMinutes: 30,                                    pinX: 28, pinY: 42 },
  { id: 'sp_f1_gold',        name: 'Gold Warden',        floor: 1,  type: 'gold',      respawnMinutes: 60,                                    pinX: 65, pinY: 35 },
  { id: 'sp_f1_red_lower',   name: 'Red Lord (Lower)',   floor: 1,  type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 22, pinY: 68 },
  { id: 'sp_f1_red_upper',   name: 'Red Lord (Upper)',   floor: 1,  type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 72, pinY: 22 },
  // Floor 2
  { id: 'sp_f2_blue',        name: 'Blue Guardian',      floor: 2,  type: 'blue',      respawnMinutes: 30,                                    pinX: 30, pinY: 44 },
  { id: 'sp_f2_gold',        name: 'Gold Warden',        floor: 2,  type: 'gold',      respawnMinutes: 60,                                    pinX: 63, pinY: 37 },
  { id: 'sp_f2_red_lower',   name: 'Red Lord (Lower)',   floor: 2,  type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 20, pinY: 70 },
  { id: 'sp_f2_red_upper',   name: 'Red Lord (Upper)',   floor: 2,  type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 74, pinY: 24 },
  // Floor 3
  { id: 'sp_f3_blue',        name: 'Blue Guardian',      floor: 3,  type: 'blue',      respawnMinutes: 30,                                    pinX: 28, pinY: 42 },
  { id: 'sp_f3_gold',        name: 'Gold Warden',        floor: 3,  type: 'gold',      respawnMinutes: 60,                                    pinX: 65, pinY: 35 },
  { id: 'sp_f3_red_lower',   name: 'Red Lord (Lower)',   floor: 3,  type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 22, pinY: 68 },
  { id: 'sp_f3_red_upper',   name: 'Red Lord (Upper)',   floor: 3,  type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 72, pinY: 22 },
  // Floor 4
  { id: 'sp_f4_blue',        name: 'Blue Guardian',      floor: 4,  type: 'blue',      respawnMinutes: 30,                                    pinX: 30, pinY: 44 },
  { id: 'sp_f4_gold',        name: 'Gold Warden',        floor: 4,  type: 'gold',      respawnMinutes: 60,                                    pinX: 63, pinY: 37 },
  { id: 'sp_f4_red_lower',   name: 'Red Lord (Lower)',   floor: 4,  type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 20, pinY: 70 },
  { id: 'sp_f4_red_upper',   name: 'Red Lord (Upper)',   floor: 4,  type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 74, pinY: 24 },
  // Floor 5
  { id: 'sp_f5_blue',        name: 'Blue Guardian',      floor: 5,  type: 'blue',      respawnMinutes: 30,                                    pinX: 28, pinY: 42 },
  { id: 'sp_f5_gold',        name: 'Gold Warden',        floor: 5,  type: 'gold',      respawnMinutes: 60,                                    pinX: 65, pinY: 35 },
  { id: 'sp_f5_red_lower',   name: 'Red Lord (Lower)',   floor: 5,  type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 22, pinY: 68 },
  { id: 'sp_f5_red_upper',   name: 'Red Lord (Upper)',   floor: 5,  type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 72, pinY: 22 },
  // Floor 6
  { id: 'sp_f6_blue',        name: 'Blue Guardian',      floor: 6,  type: 'blue',      respawnMinutes: 30,                                    pinX: 30, pinY: 44 },
  { id: 'sp_f6_gold',        name: 'Gold Warden',        floor: 6,  type: 'gold',      respawnMinutes: 60,                                    pinX: 63, pinY: 37 },
  { id: 'sp_f6_red_lower',   name: 'Red Lord (Lower)',   floor: 6,  type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 20, pinY: 70 },
  { id: 'sp_f6_red_upper',   name: 'Red Lord (Upper)',   floor: 6,  type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 74, pinY: 24 },
  // Floor 7
  { id: 'sp_f7_blue',        name: 'Blue Guardian',      floor: 7,  type: 'blue',      respawnMinutes: 30,                                    pinX: 28, pinY: 42 },
  { id: 'sp_f7_gold',        name: 'Gold Warden',        floor: 7,  type: 'gold',      respawnMinutes: 60,                                    pinX: 65, pinY: 35 },
  { id: 'sp_f7_red_lower',   name: 'Red Lord (Lower)',   floor: 7,  type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 22, pinY: 68 },
  { id: 'sp_f7_red_upper',   name: 'Red Lord (Upper)',   floor: 7,  type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 72, pinY: 22 },
  // Floor 8
  { id: 'sp_f8_blue',        name: 'Blue Guardian',      floor: 8,  type: 'blue',      respawnMinutes: 30,                                    pinX: 30, pinY: 44 },
  { id: 'sp_f8_gold',        name: 'Gold Warden',        floor: 8,  type: 'gold',      respawnMinutes: 60,                                    pinX: 63, pinY: 37 },
  { id: 'sp_f8_red_lower',   name: 'Red Lord (Lower)',   floor: 8,  type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 20, pinY: 70 },
  { id: 'sp_f8_red_upper',   name: 'Red Lord (Upper)',   floor: 8,  type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 74, pinY: 24 },
  // Floor 9
  { id: 'sp_f9_blue',        name: 'Blue Guardian',      floor: 9,  type: 'blue',      respawnMinutes: 30,                                    pinX: 28, pinY: 42 },
  { id: 'sp_f9_gold',        name: 'Gold Warden',        floor: 9,  type: 'gold',      respawnMinutes: 60,                                    pinX: 65, pinY: 35 },
  { id: 'sp_f9_red_lower',   name: 'Red Lord (Lower)',   floor: 9,  type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 22, pinY: 68 },
  { id: 'sp_f9_red_upper',   name: 'Red Lord (Upper)',   floor: 9,  type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 72, pinY: 22 },
  // Floor 10
  { id: 'sp_f10_blue',       name: 'Blue Guardian',      floor: 10, type: 'blue',      respawnMinutes: 30,                                    pinX: 30, pinY: 44 },
  { id: 'sp_f10_gold',       name: 'Gold Warden',        floor: 10, type: 'gold',      respawnMinutes: 60,                                    pinX: 63, pinY: 37 },
  { id: 'sp_f10_red_lower',  name: 'Red Lord (Lower)',   floor: 10, type: 'red_lower', fixedHoursUTC8: [13, 19, 1, 7],                        pinX: 20, pinY: 70 },
  { id: 'sp_f10_red_upper',  name: 'Red Lord (Upper)',   floor: 10, type: 'red_upper', fixedHoursUTC8: [16, 22, 4, 10],                       pinX: 74, pinY: 24 },
  // Leader's Chamber (special floors — same map)
  { id: 'sp_ch1',            name: "Leader's Chamber I",  floor: 1,  type: 'chamber',   respawnMinutes: 30,                                    pinX: 50, pinY: 50 },
  { id: 'sp_ch2',            name: "Leader's Chamber II", floor: 2,  type: 'chamber',   respawnMinutes: 45,                                    pinX: 50, pinY: 50 },
  { id: 'sp_ch3',            name: "Leader's Chamber III",floor: 3,  type: 'chamber',   fixedHoursUTC8: [3, 6, 9, 12, 15, 18, 21, 0],         pinX: 50, pinY: 50 },
];

// ─── MIRAGE ZONE ──────────────────────────────────────────────────────────────
// ⚠️  IMPORTANT: Fill in exact boss names and spawn times from the Mirage schedule
// table (the screenshot shared earlier). Times are UTC+8. Format: hour (0-23).
// The structure below is a TEMPLATE — update names and fixedHoursUTC8 arrays.

export interface MirageBoss {
  id: string;
  name: string;
  layer: number;
  type: 'blue' | 'red' | 'purple';
  fixedHoursUTC8: number[];  // UTC+8 hours when this boss spawns daily
}

export const MIRAGE_BOSSES: MirageBoss[] = [
  // ── Layer 1 ──
  { id: 'mir_l1_b1', name: 'Mirage Boss 1',  layer: 1, type: 'blue',   fixedHoursUTC8: [2, 6, 10, 14, 18, 22] },
  { id: 'mir_l1_b2', name: 'Mirage Boss 2',  layer: 1, type: 'red',    fixedHoursUTC8: [4, 8, 12, 16, 20, 0]  },
  { id: 'mir_l1_b3', name: 'Mirage Boss 3',  layer: 1, type: 'purple', fixedHoursUTC8: [3, 9, 15, 21]         },
  // ── Layer 3 ──
  { id: 'mir_l3_b1', name: 'Mirage Boss 4',  layer: 3, type: 'blue',   fixedHoursUTC8: [2, 8, 14, 20]         },
  { id: 'mir_l3_b2', name: 'Mirage Boss 5',  layer: 3, type: 'red',    fixedHoursUTC8: [5, 11, 17, 23]        },
  { id: 'mir_l3_b3', name: 'Mirage Boss 6',  layer: 3, type: 'purple', fixedHoursUTC8: [1, 7, 13, 19]         },
];

// ─── WORLD BOSSES — Daily ─────────────────────────────────────────────────────

export interface DailyWorldBoss {
  id: string;
  name: string;
  zone: string;
  spawnHoursUTC8: number[];  // spawns at these hours each day
  notifyMinutesBefore: number;
}

export const DAILY_WORLD_BOSSES: DailyWorldBoss[] = [
  {
    id: 'lab_daily',
    name: 'Labyrinth Bosses',
    zone: 'All Labyrinth Zones',
    spawnHoursUTC8: [10, 20],
    notifyMinutesBefore: 10,
  },
  {
    id: 'valley_daily',
    name: 'Hidden Valley Bosses',
    zone: 'All Valley Zones',
    spawnHoursUTC8: [12, 22],
    notifyMinutesBefore: 10,
  },
];

// ─── WORLD BOSSES — Weekly ────────────────────────────────────────────────────

export interface WeeklyWorldBoss {
  id: string;
  name: string;
  zone: string;
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayOfWeek: number;
  spawnHourUTC8: number;
  notifyMinutesBefore: number;
  description?: string;
}

export const WEEKLY_WORLD_BOSSES: WeeklyWorldBoss[] = [
  {
    id: 'krukan',
    name: 'Demon Spider of Hell Krukan',
    zone: 'Bicheon Valley 4F — Shackling Abaddon',
    dayOfWeek: 1, // Monday
    spawnHourUTC8: 22,
    notifyMinutesBefore: 10,
  },
  {
    id: 'nerkan',
    name: 'Black Flame Arch Demon Nerkan',
    zone: 'World Boss Zone',
    dayOfWeek: 2, // Tuesday
    spawnHourUTC8: 19, // announced at 19:00, active at 23:00
    notifyMinutesBefore: 10,
    description: 'Announced at 19:00 — becomes active at 23:00',
  },
  {
    id: 'wraiths',
    name: 'Attack of the Living Wraiths',
    zone: 'All Valley Zones 4F',
    dayOfWeek: 4, // Thursday
    spawnHourUTC8: 22,
    notifyMinutesBefore: 10,
    description: 'Bicheon Valley, Snake Valley, Redmoon Valley — all 4F simultaneously',
  },
  {
    id: 'turkan',
    name: 'Violet Demon God Turkan',
    zone: 'World Boss Zone',
    dayOfWeek: 4, // Thursday
    spawnHourUTC8: 19, // announced at 19:00, active at 23:00
    notifyMinutesBefore: 10,
    description: 'Announced at 19:00 — becomes active at 23:00',
  },
  {
    id: 'utukan',
    name: 'Crimson Emperor Utukan',
    zone: 'Snake Valley 4F — Crimson Abaddon',
    dayOfWeek: 5, // Friday
    spawnHourUTC8: 22,
    notifyMinutesBefore: 10,
  },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────

/**
 * Returns the next UTC Date when a boss with fixed UTC+8 spawn hours will next spawn.
 * If a spawn time has passed today (UTC+8), returns the next occurrence.
 */
export function getNextFixedSpawn(fixedHoursUTC8: number[]): Date {
  // UTC+8 offset in ms
  const UTC8_OFFSET = 8 * 60 * 60 * 1000;
  const nowUTC = Date.now();
  const nowUTC8 = new Date(nowUTC + UTC8_OFFSET);

  const todayUTC8StartMs = Date.UTC(
    nowUTC8.getUTCFullYear(),
    nowUTC8.getUTCMonth(),
    nowUTC8.getUTCDate()
  ) - UTC8_OFFSET; // back to UTC

  const sortedHours = [...fixedHoursUTC8].sort((a, b) => a - b);

  for (const h of sortedHours) {
    const spawnMs = todayUTC8StartMs + (8 + h) * 60 * 60 * 1000; // UTC equivalent
    if (spawnMs > nowUTC + 5000) { // 5s buffer
      return new Date(spawnMs);
    }
  }

  // All today's spawns passed — return first spawn tomorrow
  const tomorrowOffset = 24 * 60 * 60 * 1000;
  return new Date(todayUTC8StartMs + tomorrowOffset + (8 + sortedHours[0]) * 60 * 60 * 1000);
}

/**
 * Returns the next UTC Date for a weekly boss.
 */
export function getNextWeeklySpawn(dayOfWeek: number, spawnHourUTC8: number): Date {
  const UTC8_OFFSET = 8 * 60 * 60 * 1000;
  const nowUTC = Date.now();
  const nowUTC8 = new Date(nowUTC + UTC8_OFFSET);

  const currentDayUTC8 = nowUTC8.getUTCDay();
  let daysUntil = (dayOfWeek - currentDayUTC8 + 7) % 7;

  // Calculate today's spawn time in UTC
  const todayUTC8StartMs = Date.UTC(
    nowUTC8.getUTCFullYear(),
    nowUTC8.getUTCMonth(),
    nowUTC8.getUTCDate()
  ) - UTC8_OFFSET;

  const targetSpawnMs = todayUTC8StartMs + daysUntil * 24 * 60 * 60 * 1000 + (8 + spawnHourUTC8) * 60 * 60 * 1000;

  if (targetSpawnMs <= nowUTC + 5000) {
    // That time has passed — next week
    return new Date(targetSpawnMs + 7 * 24 * 60 * 60 * 1000);
  }
  return new Date(targetSpawnMs);
}

/**
 * Format milliseconds as HH:MM:SS countdown string.
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'SPAWNED';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

/**
 * Get current UTC+8 time formatted as HH:MM:SS
 */
export function getServerTimeString(): string {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600 * 1000);
  return utc8.toISOString().slice(11, 19);
}
```

---

## TASK 4 — Create `src/app/api/get-timers/route.ts`

Create a new GET endpoint that returns all current dynamic boss timers from Supabase.

```ts
// src/app/api/get-timers/route.ts
import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export interface BossTimer {
  boss_name: string;
  location: string;
  updated_by: string;
  boss_type: 'dynamic' | 'static';
  last_killed: string;  // ISO timestamp
  next_spawn: string;   // ISO timestamp
}

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("boss_timers")
      .select("boss_name, location, updated_by, boss_type, last_killed, next_spawn")
      .order("next_spawn", { ascending: true });

    if (error) {
      console.error("Failed to fetch boss timers", error);
      return NextResponse.json({ success: false, error: "Failed to fetch timers" }, { status: 500 });
    }

    return NextResponse.json({ success: true, timers: data as BossTimer[] });
  } catch (error) {
    console.error("Unexpected error in get-timers", error);
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
```

---

## TASK 5 — Create `src/app/api/cron/notify/route.ts`

This endpoint is called by Vercel Cron every minute. It checks if any world boss spawns in the next 10 minutes and sends a Discord webhook notification if so. It tracks sent notifications in Supabase to avoid duplicates.

```ts
// src/app/api/cron/notify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DAILY_WORLD_BOSSES, WEEKLY_WORLD_BOSSES } from "@/lib/gameData";
import { getSupabaseClient } from "@/lib/supabase";

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL ?? "";
const NOTIFY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

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

async function hasNotified(supabase: ReturnType<typeof import("@/lib/supabase").getSupabaseClient>, key: string): Promise<boolean> {
  const { data } = await supabase
    .from("notifications_sent")
    .select("id")
    .eq("notification_key", key)
    .gte("sent_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .single();
  return !!data;
}

async function markNotified(supabase: ReturnType<typeof import("@/lib/supabase").getSupabaseClient>, key: string): Promise<void> {
  await supabase.from("notifications_sent").upsert({ notification_key: key, sent_at: new Date().toISOString() }, { onConflict: 'notification_key' });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify cron secret (Vercel sets this automatically via Authorization header)
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
        const key = `${boss.id}_${spawnHour}_${new Date().toISOString().slice(0, 10)}`;
        if (!(await hasNotified(supabase, key))) {
          await sendWebhook(`@here **${boss.name}** spawn in **10 minutes** — ${boss.zone} (Server time ${String(spawnHour).padStart(2,'0')}:00 UTC+8)`);
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
          const desc = boss.description ? `\n> ${boss.description}` : '';
          await sendWebhook(`@here **${boss.name}** spawn in **10 minutes** — ${boss.zone}${desc}`);
          await markNotified(supabase, key);
          notifications.push(key);
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent: notifications });
}
```

---

## TASK 6 — Create `vercel.json`

Create a new file in the project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/notify",
      "schedule": "* * * * *"
    }
  ]
}
```

---

## TASK 7 — Add Supabase migration note

In Supabase, the `notifications_sent` table needs to exist. Add this comment in the `src/lib/supabase.ts` file at the top (as a comment):

```ts
/*
 * Required Supabase tables:
 *
 * boss_timers (already exists):
 *   boss_name text PRIMARY KEY
 *   location text
 *   updated_by text
 *   boss_type text
 *   last_killed timestamptz
 *   next_spawn timestamptz
 *
 * notifications_sent (CREATE IF NOT EXISTS):
 *   id bigserial PRIMARY KEY
 *   notification_key text UNIQUE
 *   sent_at timestamptz DEFAULT now()
 */
```

---

## TASK 8 — Full redesign of `src/app/page.tsx`

Replace the ENTIRE content of `src/app/page.tsx` with the following. This is the main UI.

Design principles:
- Background: `#050712`, text: zinc-100
- Glassmorphism panels: `bg-zinc-950/80 backdrop-blur border border-zinc-800/80`
- Countdown timers: monospace font, glowing color based on urgency
  - > 1 hour: `text-zinc-400`
  - 10–60 min: `text-amber-400 shadow-amber-900`
  - < 10 min: `text-red-400 animate-pulse`
  - SPAWNED: `text-emerald-400 animate-pulse font-bold`
- Boss type color coding:
  - Blue: `border-sky-500/60 bg-sky-500/10`
  - Gold: `border-amber-500/60 bg-amber-500/10`
  - Red: `border-red-500/60 bg-red-500/10`
  - Chamber: `border-violet-500/60 bg-violet-500/10`
- Tabs: `Secret Peak | Mirage | World Bosses`
- Active tab indicator: glowing bottom border in `red-500`

```tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import {
  SECRET_PEAK_BOSSES,
  MIRAGE_BOSSES,
  DAILY_WORLD_BOSSES,
  WEEKLY_WORLD_BOSSES,
  getNextFixedSpawn,
  getNextWeeklySpawn,
  formatCountdown,
  getServerTimeString,
  type SecretPeakBoss,
} from "@/lib/gameData";
import type { BossTimer } from "@/app/api/get-timers/route";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "secret_peak" | "mirage" | "world_bosses";

type DynamicTimerMap = Record<string, {
  nextSpawn: Date;
  lastKilled: Date;
  updatedBy: string;
}>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServerClock() {
  const [time, setTime] = useState(getServerTimeString());
  useEffect(() => {
    const id = setInterval(() => setTime(getServerTimeString()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
      <span className="font-mono text-xs text-zinc-300 tracking-widest">{time} UTC+8</span>
    </div>
  );
}

function CountdownBadge({ nextSpawn }: { nextSpawn: Date | null }) {
  const [ms, setMs] = useState<number>(() => nextSpawn ? nextSpawn.getTime() - Date.now() : -1);

  useEffect(() => {
    if (!nextSpawn) return;
    const tick = () => setMs(nextSpawn.getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextSpawn]);

  if (!nextSpawn) return <span className="font-mono text-xs text-zinc-500">—</span>;

  const label = formatCountdown(ms);
  const isSpawned = ms <= 0;
  const isCritical = ms > 0 && ms < 10 * 60 * 1000;
  const isWarning = ms >= 10 * 60 * 1000 && ms < 60 * 60 * 1000;

  return (
    <span className={[
      "font-mono text-sm font-semibold tabular-nums tracking-wider",
      isSpawned ? "text-emerald-400 animate-pulse" : "",
      isCritical ? "text-red-400 animate-pulse" : "",
      isWarning ? "text-amber-400" : "",
      !isSpawned && !isCritical && !isWarning ? "text-zinc-400" : "",
    ].join(" ")}>
      {label}
    </span>
  );
}

// ─── Secret Peak View ─────────────────────────────────────────────────────────

function SecretPeakView({
  dynamicTimers,
  currentUser,
  onReportKill,
}: {
  dynamicTimers: DynamicTimerMap;
  currentUser: { id: string; username: string } | null;
  onReportKill: (bossId: string, bossName: string, floor: number) => Promise<void>;
}) {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [activePin, setActivePin] = useState<SecretPeakBoss | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportMsg, setReportMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const floorBosses = useMemo(
    () => SECRET_PEAK_BOSSES.filter((b) => b.floor === selectedFloor),
    [selectedFloor]
  );

  const getNextSpawnForBoss = useCallback((boss: SecretPeakBoss): Date | null => {
    if (boss.fixedHoursUTC8) return getNextFixedSpawn(boss.fixedHoursUTC8);
    const timer = dynamicTimers[boss.id];
    if (timer) return timer.nextSpawn;
    return null;
  }, [dynamicTimers]);

  const pinColor = (type: SecretPeakBoss["type"]) => {
    switch (type) {
      case "blue": return "border-sky-400 bg-sky-500/80 text-sky-50 shadow-sky-900/60";
      case "gold": return "border-amber-400 bg-amber-500/80 text-amber-50 shadow-amber-900/60";
      case "red_lower":
      case "red_upper": return "border-red-400 bg-red-500/80 text-red-50 shadow-red-900/60";
      case "chamber": return "border-violet-400 bg-violet-500/80 text-violet-50 shadow-violet-900/60";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Floor selector */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((f) => (
          <button
            key={f}
            onClick={() => { setSelectedFloor(f); setActivePin(null); }}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
              selectedFloor === f
                ? "border-red-500/80 bg-red-500/20 text-red-300"
                : "border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
            ].join(" ")}
          >
            Floor {f}
          </button>
        ))}
      </div>

      {/* Map + Pins */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950/80">
        <div
          className="relative w-full"
          style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}
        >
          {/* Map image — place your Secret Peak map at /public/maps/secret_peak.jpg */}
          <img
            src="/maps/secret_peak.jpg"
            alt={`Secret Peak Floor ${selectedFloor}`}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            onError={(e) => {
              // fallback dark background if image missing
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none" />

          {/* Floor label */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full border border-zinc-700/60 bg-black/60 backdrop-blur-sm text-xs font-semibold text-zinc-300 tracking-widest uppercase">
            Floor {selectedFloor}
          </div>

          {/* Boss Pins */}
          {floorBosses.map((boss) => {
            const nextSpawn = getNextSpawnForBoss(boss);
            const ms = nextSpawn ? nextSpawn.getTime() - Date.now() : null;
            const isSpawned = ms !== null && ms <= 0;
            const isCritical = ms !== null && ms > 0 && ms < 10 * 60 * 1000;

            return (
              <button
                key={boss.id}
                onClick={() => { setActivePin(boss); setReportMsg(null); }}
                className={[
                  "group absolute -translate-x-1/2 -translate-y-full rounded-xl border px-2 py-1 text-[10px] font-semibold shadow-lg transition-transform hover:-translate-y-[105%] backdrop-blur-sm",
                  pinColor(boss.type),
                  isSpawned ? "ring-2 ring-emerald-400/60 animate-pulse" : "",
                  isCritical ? "ring-2 ring-red-400/60" : "",
                ].join(" ")}
                style={{ left: `${boss.pinX}%`, top: `${boss.pinY}%` }}
              >
                <div className="truncate max-w-[7rem]">{boss.name}</div>
                <div className="text-[9px] opacity-80 mt-0.5 font-mono">
                  {nextSpawn ? formatCountdown(nextSpawn.getTime() - Date.now()) : "—"}
                </div>
              </button>
            );
          })}

          {/* Pin popover */}
          {activePin && (
            <div
              className="absolute z-20 w-[240px] -translate-x-1/2 -translate-y-full rounded-2xl border border-zinc-700/80 bg-zinc-950/95 px-4 py-3 shadow-2xl shadow-black/80 backdrop-blur-sm"
              style={{ left: `${activePin.pinX}%`, top: `${activePin.pinY}%` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">Floor {activePin.floor}</p>
                  <h3 className="text-sm font-semibold text-zinc-50 mt-0.5">{activePin.name}</h3>
                </div>
                <button
                  onClick={() => setActivePin(null)}
                  className="h-5 w-5 flex items-center justify-center rounded-full border border-zinc-700 text-zinc-500 hover:text-zinc-200 text-xs"
                >×</button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-zinc-400">Next spawn</span>
                <CountdownBadge nextSpawn={getNextSpawnForBoss(activePin)} />
              </div>

              {reportMsg && (
                <p className={`text-[11px] mb-2 ${reportMsg.type === "ok" ? "text-emerald-400" : "text-red-400"}`}>
                  {reportMsg.text}
                </p>
              )}

              {(activePin.type === "blue" || activePin.type === "gold" || activePin.type === "chamber") && (
                <button
                  disabled={reporting || !currentUser}
                  onClick={async () => {
                    if (!currentUser || !activePin) return;
                    setReporting(true);
                    setReportMsg(null);
                    try {
                      await onReportKill(activePin.id, activePin.name, activePin.floor);
                      setReportMsg({ type: "ok", text: "Kill reported — timer started." });
                    } catch {
                      setReportMsg({ type: "err", text: "Failed to report kill." });
                    } finally {
                      setReporting(false);
                    }
                  }}
                  className="w-full py-1.5 rounded-xl border border-emerald-500/80 bg-emerald-500/20 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {reporting ? "Reporting..." : currentUser ? "Report Kill" : "Login required"}
                </button>
              )}

              {(activePin.type === "red_lower" || activePin.type === "red_upper") && (
                <p className="text-[10px] text-zinc-500 text-center">Fixed schedule — no report needed</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Boss list below map */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {floorBosses.map((boss) => {
          const nextSpawn = getNextSpawnForBoss(boss);
          return (
            <div
              key={boss.id}
              className={[
                "flex items-center justify-between rounded-xl border px-4 py-3 backdrop-blur-sm",
                boss.type === "blue" ? "border-sky-500/30 bg-sky-500/5" : "",
                boss.type === "gold" ? "border-amber-500/30 bg-amber-500/5" : "",
                boss.type === "red_lower" || boss.type === "red_upper" ? "border-red-500/30 bg-red-500/5" : "",
                boss.type === "chamber" ? "border-violet-500/30 bg-violet-500/5" : "",
              ].join(" ")}
            >
              <div>
                <p className="text-xs font-semibold text-zinc-200">{boss.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wide">
                  {boss.type === "blue" && "Dynamic — 30 min"}
                  {boss.type === "gold" && "Dynamic — 60 min"}
                  {boss.type === "red_lower" && "Fixed — Lower Left"}
                  {boss.type === "red_upper" && "Fixed — Upper Right"}
                  {boss.type === "chamber" && `Chamber — ${boss.respawnMinutes ?? "fixed"} min`}
                </p>
              </div>
              <CountdownBadge nextSpawn={nextSpawn} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mirage View ──────────────────────────────────────────────────────────────

function MirageView() {
  const [selectedLayer, setSelectedLayer] = useState<number | "all">("all");

  const layers = useMemo(
    () => [...new Set(MIRAGE_BOSSES.map((b) => b.layer))].sort(),
    []
  );

  const filtered = useMemo(
    () => selectedLayer === "all" ? MIRAGE_BOSSES : MIRAGE_BOSSES.filter((b) => b.layer === selectedLayer),
    [selectedLayer]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Layer filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedLayer("all")}
          className={["px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
            selectedLayer === "all"
              ? "border-red-500/80 bg-red-500/20 text-red-300"
              : "border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500",
          ].join(" ")}
        >All Layers</button>
        {layers.map((l) => (
          <button
            key={l}
            onClick={() => setSelectedLayer(l)}
            className={["px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
              selectedLayer === l
                ? "border-red-500/80 bg-red-500/20 text-red-300"
                : "border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500",
            ].join(" ")}
          >Layer {l}</button>
        ))}
      </div>

      {/* Boss grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((boss) => {
          const nextSpawn = getNextFixedSpawn(boss.fixedHoursUTC8);
          const ms = nextSpawn.getTime() - Date.now();
          const isSpawned = ms <= 0;
          const isCritical = ms > 0 && ms < 10 * 60 * 1000;

          return (
            <div
              key={boss.id}
              className={[
                "rounded-2xl border p-4 backdrop-blur-sm transition-all",
                boss.type === "blue" ? "border-sky-500/40 bg-sky-500/5" : "",
                boss.type === "red" ? "border-red-500/40 bg-red-500/5" : "",
                boss.type === "purple" ? "border-violet-500/40 bg-violet-500/5" : "",
                isSpawned ? "ring-2 ring-emerald-500/40" : "",
                isCritical ? "ring-1 ring-red-500/40" : "",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">Layer {boss.layer}</p>
                  <h3 className="text-sm font-semibold text-zinc-100">{boss.name}</h3>
                </div>
                <span className={[
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                  boss.type === "blue" ? "bg-sky-500/20 text-sky-300" : "",
                  boss.type === "red" ? "bg-red-500/20 text-red-300" : "",
                  boss.type === "purple" ? "bg-violet-500/20 text-violet-300" : "",
                ].join(" ")}>
                  {boss.type}
                </span>
              </div>

              {/* Spawn times row */}
              <div className="flex flex-wrap gap-1 mb-3">
                {boss.fixedHoursUTC8.map((h) => (
                  <span key={h} className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-[10px] font-mono text-zinc-400">
                    {String(h).padStart(2, "0")}:00
                  </span>
                ))}
              </div>

              {/* Countdown */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Next spawn</span>
                <CountdownBadge nextSpawn={nextSpawn} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── World Bosses View ────────────────────────────────────────────────────────

function WorldBossesView() {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-6">
      {/* Daily bosses */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-semibold">Daily</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DAILY_WORLD_BOSSES.map((boss) => (
            <div key={boss.id} className="rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{boss.name}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{boss.zone}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[9px] font-bold uppercase tracking-widest">Daily</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {boss.spawnHoursUTC8.map((h) => (
                  <span key={h} className="px-2 py-0.5 rounded bg-zinc-800/80 text-[11px] font-mono text-zinc-300">
                    {String(h).padStart(2, "0")}:00
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Next spawn</span>
                <CountdownBadge nextSpawn={getNextFixedSpawn(boss.spawnHoursUTC8)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly bosses */}
      <div>
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 mb-3 font-semibold">Weekly</h3>
        <div className="grid grid-cols-1 gap-3">
          {WEEKLY_WORLD_BOSSES.map((boss) => (
            <div key={boss.id} className="rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                      {weekDays[boss.dayOfWeek]}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {String(boss.spawnHourUTC8).padStart(2, "0")}:00 UTC+8
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100">{boss.name}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{boss.zone}</p>
                  {boss.description && (
                    <p className="text-[10px] text-amber-400/70 mt-1">{boss.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[9px] font-bold uppercase tracking-widest">Weekly</span>
                  <CountdownBadge nextSpawn={getNextWeeklySpawn(boss.dayOfWeek, boss.spawnHourUTC8)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("world_bosses");
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const [dynamicTimers, setDynamicTimers] = useState<DynamicTimerMap>({});

  // Discord SDK init
  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;

    async function init() {
      try {
        const clientId = process.env.NEXT_PUBLIC_DISCORD_APP_ID ?? process.env.DISCORD_APP_ID;
        if (!clientId) { setSdkError(true); return; }

        const sdk = new DiscordSDK(clientId);
        await sdk.ready();
        const auth = await sdk.commands.authenticate({}) as { access_token: string; user: { id: string; username: string } };
        if (!auth?.user || !mounted) return;
        setCurrentUser({ id: auth.user.id, username: auth.user.username });
        setSdkReady(true);
      } catch {
        if (mounted) setSdkError(true);
      }
    }

    void init();
    return () => { mounted = false; };
  }, []);

  // Fetch dynamic timers
  const fetchTimers = useCallback(async () => {
    try {
      const res = await fetch("/api/get-timers");
      const json = await res.json() as { success: boolean; timers: BossTimer[] };
      if (!json.success) return;

      const map: DynamicTimerMap = {};
      for (const t of json.timers) {
        // Match by boss name prefix to boss id (simple approach — use boss_name as key)
        map[t.boss_name] = {
          nextSpawn: new Date(t.next_spawn),
          lastKilled: new Date(t.last_killed),
          updatedBy: t.updated_by,
        };
      }
      setDynamicTimers(map);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    void fetchTimers();
    const id = setInterval(fetchTimers, 30_000); // refresh every 30s
    return () => clearInterval(id);
  }, [fetchTimers]);

  // Report kill handler
  const handleReportKill = useCallback(async (bossId: string, bossName: string, floor: number) => {
    if (!currentUser) throw new Error("Not logged in");

    const res = await fetch("/api/report-kill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bossName: `${bossId}`,
        location: `Secret Peak Floor ${floor}`,
        reporterId: currentUser.id,
      }),
    });
    const json = await res.json() as { success: boolean; error?: string };
    if (!json.success) throw new Error(json.error ?? "Failed");

    // Optimistic update
    const boss = SECRET_PEAK_BOSSES.find((b) => b.id === bossId);
    if (boss?.respawnMinutes) {
      const nextSpawn = new Date(Date.now() + boss.respawnMinutes * 60 * 1000);
      setDynamicTimers((prev) => ({
        ...prev,
        [bossId]: { nextSpawn, lastKilled: new Date(), updatedBy: currentUser.id },
      }));
    }
  }, [currentUser]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "world_bosses", label: "World Bosses" },
    { id: "secret_peak", label: "Secret Peak" },
    { id: "mirage", label: "Mirage" },
  ];

  return (
    <div className="min-h-screen bg-[#050712] text-zinc-100 antialiased">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-8">

        {/* Header */}
        <header className="flex flex-col gap-3 border-b border-zinc-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl">
              MIR4 Boss Tracker
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Real-time spawn tracker for Secret Peak, Mirage &amp; World Bosses
            </p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <ServerClock />
            {currentUser ? (
              <span className="text-xs text-zinc-500">
                <span className="text-zinc-300 font-medium">{currentUser.username}</span>
              </span>
            ) : (
              <span className="text-xs text-zinc-600">
                {sdkError ? "Web mode — Discord not connected" : "Connecting to Discord..."}
              </span>
            )}
          </div>
        </header>

        {/* Tabs */}
        <nav className="flex gap-1 border-b border-zinc-800/80">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px",
                activeTab === tab.id
                  ? "border-red-500 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-600",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <section className="flex-1">
          {activeTab === "secret_peak" && (
            <SecretPeakView
              dynamicTimers={dynamicTimers}
              currentUser={currentUser}
              onReportKill={handleReportKill}
            />
          )}
          {activeTab === "mirage" && <MirageView />}
          {activeTab === "world_bosses" && <WorldBossesView />}
        </section>

        <footer className="border-t border-zinc-900 pt-4 flex items-center justify-between text-[11px] text-zinc-600">
          <span>MIR4 Boss Tracker</span>
          <span>Next.js · Supabase · Discord SDK</span>
        </footer>
      </main>
    </div>
  );
}
```

---

## TASK 9 — Add `.env.local` variable note

Add the following to `.env.local` (create if not exists — do NOT commit):
```
DISCORD_WEBHOOK_URL=<paste Discord webhook URL here>
CRON_SECRET=<generate a random secret string, same value goes in Vercel env vars>
```

Also add these to Vercel environment variables via the Vercel dashboard.

---

## CHECKLIST

After completing all tasks, verify:
- [ ] `npm run build` passes with no TypeScript errors
- [ ] `/api/get-timers` returns `{ success: true, timers: [] }` when Supabase is empty
- [ ] `/api/report-kill` returns `{ success: true }` when called with valid body
- [ ] Reporting the same boss twice does NOT cause an error (upsert confirmed)
- [ ] `vercel.json` exists in project root
- [ ] `src/lib/gameData.ts` exports all required symbols
- [ ] `page.tsx` renders without crash (World Bosses tab visible by default)

---

## NOTES FOR USER

1. **Map image**: Place your Secret Peak map image at `public/maps/secret_peak.jpg`. The map area has a 16:9 ratio placeholder if the image is missing.

2. **Mirage data**: Update the `MIRAGE_BOSSES` array in `src/lib/gameData.ts` with the real boss names and spawn times from the original Mirage schedule table. The current values are placeholders.

3. **Supabase**: Run this SQL in Supabase to create the notifications table:
   ```sql
   CREATE TABLE IF NOT EXISTS notifications_sent (
     id bigserial PRIMARY KEY,
     notification_key text UNIQUE NOT NULL,
     sent_at timestamptz NOT NULL DEFAULT now()
   );
   ```

4. **Discord Webhook**: Create a webhook in your Discord server (Channel Settings → Integrations → Webhooks) and paste the URL into `DISCORD_WEBHOOK_URL` in Vercel env vars.

5. **Cron Secret**: Generate any random string for `CRON_SECRET` and add it to both `.env.local` and Vercel environment variables.
