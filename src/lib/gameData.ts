// All times are in UTC+8 (server timezone)

export type BossType =
  | "teal"
  | "gold"
  | "red_lower"
  | "red_upper"
  | "chamber";

export type RegionId =
  | "secret_peak"
  | "mirage"
  | "world_daily"
  | "world_weekly"
  | "magic_square";

// ─── SECRET PEAK (Secret Peak map) ─────────────────────────────────────────-
// One map image for all 10 floors. Boss type determines respawn behavior.
// Teal bosses: 30 min after kill (dynamic)
// Gold bosses: 60 min after kill (dynamic)
// Red Lower Left: fixed at 13:00 / 19:00 / 01:00 / 07:00 (UTC+8)
// Red Upper Right: fixed at 16:00 / 22:00 / 04:00 / 10:00 (UTC+8)

export interface SecretPeakBoss {
  id: string; // technical ID, used as boss_timers.boss_name
  name: string;
  floor: number;
  type: BossType | "red"; // helper: we may treat combined red visually
  // For dynamic bosses: respawn minutes after kill
  respawnMinutes?: number;
  // For fixed-schedule bosses: UTC+8 hours when boss spawns
  fixedHoursUTC8?: number[];
  // Map pin position (percentage)
  pinX: number;
  pinY: number;
}

const SECRET_PEAK_TEAL_COORDS = [
  { suffix: "teal1", pinX: 38, pinY: 20 },
  { suffix: "teal2", pinX: 17, pinY: 31 },
  { suffix: "teal3", pinX: 30, pinY: 40 },
  { suffix: "teal4", pinX: 22, pinY: 52 },
] as const;

const SECRET_PEAK_GOLD_COORDS = [
  { suffix: "gold1", pinX: 83, pinY: 22 },
  { suffix: "gold2", pinX: 8, pinY: 50 },
] as const;

export const SECRET_PEAK_BOSSES: SecretPeakBoss[] = (() => {
  const bosses: SecretPeakBoss[] = [];

  for (let floor = 1; floor <= 10; floor += 1) {
    // Teal dynamic bosses
    for (const teal of SECRET_PEAK_TEAL_COORDS) {
      bosses.push({
        id: `sp_f${floor}_${teal.suffix}`,
        name: "Teal Guardian",
        floor,
        type: "teal",
        respawnMinutes: 30,
        pinX: teal.pinX,
        pinY: teal.pinY,
      });
    }

    // Gold dynamic bosses
    for (const gold of SECRET_PEAK_GOLD_COORDS) {
      bosses.push({
        id: `sp_f${floor}_${gold.suffix}`,
        name: "Gold Warden",
        floor,
        type: "gold",
        respawnMinutes: 60,
        pinX: gold.pinX,
        pinY: gold.pinY,
      });
    }

    // Red fixed bosses
    bosses.push({
      id: `sp_f${floor}_red_lower`,
      name: "Red Lord (Lower)",
      floor,
      type: "red_lower",
      fixedHoursUTC8: [13, 19, 1, 7],
      pinX: 10,
      pinY: 72,
    });

    bosses.push({
      id: `sp_f${floor}_red_upper`,
      name: "Red Lord (Upper)",
      floor,
      type: "red_upper",
      fixedHoursUTC8: [16, 22, 4, 10],
      pinX: 87,
      pinY: 8,
    });
  }

  return bosses;
})();

// ─── MAGIC SQUARE (Leader's Chamber) ───────────────────────────────────────
// 10 floors, 3 bosses each (no map UI, used in MagicSquareView as cards).

export interface MagicSquareBoss {
  id: string; // technical ID, used as boss_timers.boss_name when needed
  name: string;
  floor: number;
  type: "chamber1" | "chamber2" | "chamber3";
  respawnMinutes?: number;
  fixedHoursUTC8?: number[];
}

export const MAGIC_SQUARE_BOSSES: MagicSquareBoss[] = (() => {
  const bosses: MagicSquareBoss[] = [];

  for (let floor = 1; floor <= 10; floor += 1) {
    bosses.push(
      {
        id: `ch_f${floor}_c1`,
        name: "Chamber I",
        floor,
        type: "chamber1",
        respawnMinutes: 30,
      },
      {
        id: `ch_f${floor}_c2`,
        name: "Chamber II",
        floor,
        type: "chamber2",
        respawnMinutes: 45,
      },
      {
        id: `ch_f${floor}_c3`,
        name: "Chamber III",
        floor,
        type: "chamber3",
        fixedHoursUTC8: [3, 6, 9, 12, 15, 18, 21, 0],
      }
    );
  }

  return bosses;
})();

// ─── MIRAGE ZONE ───────────────────────────────────────────────────────────

export interface MirageBoss {
  id: string;
  name: string;
  layer: number;
  type: "blue" | "red" | "purple";
  fixedHoursUTC8: number[]; // UTC+8 hours when this boss spawns daily
}

export const MIRAGE_BOSSES: MirageBoss[] = [
  // ── Layer 1 ──
  { id: "mir_l1_b1", name: "Mirage Boss 1", layer: 1, type: "blue", fixedHoursUTC8: [2, 6, 10, 14, 18, 22] },
  { id: "mir_l1_b2", name: "Mirage Boss 2", layer: 1, type: "red", fixedHoursUTC8: [4, 8, 12, 16, 20, 0] },
  { id: "mir_l1_b3", name: "Mirage Boss 3", layer: 1, type: "purple", fixedHoursUTC8: [3, 9, 15, 21] },
  // ── Layer 3 ──
  { id: "mir_l3_b1", name: "Mirage Boss 4", layer: 3, type: "blue", fixedHoursUTC8: [2, 8, 14, 20] },
  { id: "mir_l3_b2", name: "Mirage Boss 5", layer: 3, type: "red", fixedHoursUTC8: [5, 11, 17, 23] },
  { id: "mir_l3_b3", name: "Mirage Boss 6", layer: 3, type: "purple", fixedHoursUTC8: [1, 7, 13, 19] },
];

// ─── WORLD BOSSES — Daily ─────────────────────────────────────────────────

export interface DailyWorldBoss {
  id: string;
  name: string;
  zone: string;
  spawnHoursUTC8: number[]; // spawns at these hours each day
  notifyMinutesBefore: number;
}

export const DAILY_WORLD_BOSSES: DailyWorldBoss[] = [
  {
    id: "lab_daily",
    name: "Labyrinth Bosses",
    zone: "All Labyrinth Zones",
    spawnHoursUTC8: [10, 20],
    notifyMinutesBefore: 10,
  },
  {
    id: "valley_daily",
    name: "Hidden Valley Bosses",
    zone: "All Valley Zones",
    spawnHoursUTC8: [12, 22],
    notifyMinutesBefore: 10,
  },
];

// ─── WORLD BOSSES — Weekly ─────────────────────────────────────────────---

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
    id: "krukan",
    name: "Demon Spider of Hell Krukan",
    zone: "Bicheon Valley 4F — Shackling Abaddon",
    dayOfWeek: 1, // Monday
    spawnHourUTC8: 22,
    notifyMinutesBefore: 10,
  },
  {
    id: "nerkan",
    name: "Black Flame Arch Demon Nerkan",
    zone: "World Boss Zone",
    dayOfWeek: 2, // Tuesday
    spawnHourUTC8: 19, // announced at 19:00, active at 23:00
    notifyMinutesBefore: 10,
    description: "Announced at 19:00 — becomes active at 23:00",
  },
  {
    id: "wraiths",
    name: "Attack of the Living Wraiths",
    zone: "All Valley Zones 4F",
    dayOfWeek: 4, // Thursday
    spawnHourUTC8: 22,
    notifyMinutesBefore: 10,
    description: "Bicheon Valley, Snake Valley, Redmoon Valley — all 4F simultaneously",
  },
  {
    id: "turkan",
    name: "Violet Demon God Turkan",
    zone: "World Boss Zone",
    dayOfWeek: 4, // Thursday
    spawnHourUTC8: 19, // announced at 19:00, active at 23:00
    notifyMinutesBefore: 10,
    description: "Announced at 19:00 — becomes active at 23:00",
  },
  {
    id: "utukan",
    name: "Crimson Emperor Utukan",
    zone: "Snake Valley 4F — Crimson Abaddon",
    dayOfWeek: 5, // Friday
    spawnHourUTC8: 22,
    notifyMinutesBefore: 10,
  },
];

// ─── UTILITIES ─────────────────────────────────────────────────────────---

/**
 * Returns the next UTC Date when a boss with fixed UTC+8 spawn hours will next spawn.
 * If a spawn time has passed today (UTC+8), returns the next occurrence.
 */
export function getNextFixedSpawn(fixedHoursUTC8: number[]): Date {
  if (!fixedHoursUTC8.length) {
    return new Date();
  }

  // UTC+8 offset in ms
  const UTC8_OFFSET = 8 * 60 * 60 * 1000;
  const nowUTC = Date.now();
  const nowUTC8 = new Date(nowUTC + UTC8_OFFSET);

  const todayUTC8StartMs =
    Date.UTC(
      nowUTC8.getUTCFullYear(),
      nowUTC8.getUTCMonth(),
      nowUTC8.getUTCDate()
    ) - UTC8_OFFSET; // back to UTC

  const sortedHours = [...fixedHoursUTC8].sort((a, b) => a - b);

  for (const h of sortedHours) {
    const spawnMs = todayUTC8StartMs + (8 + h) * 60 * 60 * 1000; // UTC equivalent
    if (spawnMs > nowUTC + 5000) {
      // 5s buffer
      return new Date(spawnMs);
    }
  }

  // All today's spawns passed — return first spawn tomorrow
  const tomorrowOffset = 24 * 60 * 60 * 1000;
  return new Date(
    todayUTC8StartMs + tomorrowOffset + (8 + sortedHours[0]) * 60 * 60 * 1000
  );
}

/**
 * Returns the next UTC Date for a weekly boss.
 */
export function getNextWeeklySpawn(
  dayOfWeek: number,
  spawnHourUTC8: number
): Date {
  const UTC8_OFFSET = 8 * 60 * 60 * 1000;
  const nowUTC = Date.now();
  const nowUTC8 = new Date(nowUTC + UTC8_OFFSET);

  const currentDayUTC8 = nowUTC8.getUTCDay();
  const daysUntil = (dayOfWeek - currentDayUTC8 + 7) % 7;

  const todayUTC8StartMs =
    Date.UTC(
      nowUTC8.getUTCFullYear(),
      nowUTC8.getUTCMonth(),
      nowUTC8.getUTCDate()
    ) - UTC8_OFFSET;

  const targetSpawnMs =
    todayUTC8StartMs +
    daysUntil * 24 * 60 * 60 * 1000 +
    (8 + spawnHourUTC8) * 60 * 60 * 1000;

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
  if (ms <= 0) return "SPAWNED";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
      s
    ).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Get current UTC+8 time formatted as HH:MM:SS
 */
export function getServerTimeString(): string {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600 * 1000);
  return utc8.toISOString().slice(11, 19);
}
