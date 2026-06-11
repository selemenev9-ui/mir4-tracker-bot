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
  { suffix: "teal1", pinX: 38, pinY: 59 },
  { suffix: "teal2", pinX: 69, pinY: 76 },
  { suffix: "teal3", pinX: 33, pinY: 37 },
  { suffix: "teal4", pinX: 48, pinY: 29 },
] as const;

const SECRET_PEAK_GOLD_COORDS = [
  { suffix: "gold1", pinX: 77, pinY: 41 },
  { suffix: "gold2", pinX: 26, pinY: 68 },
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
      pinX: 27,
      pinY: 86,
    });

    bosses.push({
      id: `sp_f${floor}_red_upper`,
      name: "Red Lord (Upper)",
      floor,
      type: "red_upper",
      fixedHoursUTC8: [16, 22, 4, 10],
      pinX: 70,
      pinY: 14,
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
  world: string; // e.g. "W1", "W2"
  location: string; // e.g. "Bullface Forest"
  level: string; // e.g. "140 below", "141+", "155+"
  spawnTimes: string[]; // "HH:MM" format, UTC+8
}

/**
 * Expands 12-hour-style Mirage spawn times to include both AM and PM equivalents.
 * "2:00" 
 *   → ["2:00", "14:00"]
 * "12:00" 
 *   → ["0:00", "12:00"]
 * "11:30" 
 *   → ["11:30", "23:30"]
 */
function expandMirageTimes(times: string[]): string[] {
  const result: string[] = [];
  for (const t of times) {
    const [hStr, mStr] = t.split(":");
    const h = parseInt(hStr, 10);
    const m = mStr ?? "00";
    if (Number.isNaN(h)) continue;
    if (h === 12) {
      // 12:xx AM = 0:xx, 12:xx PM = 12:xx
      result.push(`0:${m}`, `12:${m}`);
    } else {
      // h:xx AM = h:xx, h:xx PM = (h+12):xx
      result.push(`${h}:${m}`, `${h + 12}:${m}`);
    }
  }

  // Sort chronologically and remove duplicates
  return [...new Set(result)].sort((a, b) => {
    const [ah, amStr] = a.split(":");
    const [bh, bmStr] = b.split(":");
    const ahNum = parseInt(ah, 10);
    const amNum = parseInt(amStr ?? "0", 10);
    const bhNum = parseInt(bh, 10);
    const bmNum = parseInt(bmStr ?? "0", 10);
    return ahNum * 60 + amNum - (bhNum * 60 + bmNum);
  });
}

export const MIRAGE_BOSSES: MirageBoss[] = [
  // ── Layer 3 ─────────────────────────────────────────────────────────────
  // W1 — 140 below
  {
    id: "mir_l3_w1_mata",
    name: "Mata",
    layer: 3,
    world: "W1",
    location: "Bullface Forest",
    level: "140 below",
    spawnTimes: expandMirageTimes(["2:00", "4:00", "6:00", "8:00", "10:00", "12:00"]),
  },
  {
    id: "mir_l3_w1_boltox",
    name: "Boltox",
    layer: 3,
    world: "W1",
    location: "Demon Bull Temple 1F",
    level: "140 below",
    spawnTimes: expandMirageTimes(["1:00", "3:00", "5:00", "7:00", "9:00", "11:00"]),
  },
  {
    id: "mir_l3_w1_bfk",
    name: "Bullface Fiend King",
    layer: 3,
    world: "W1",
    location: "Bullface King Fiend Sanctuary",
    level: "140 below",
    spawnTimes: expandMirageTimes(["3:00", "6:00", "9:00", "12:00"]),
  },
  // W8 — 140 below
  {
    id: "mir_l3_w8_yew",
    name: "Yeo Wihuang",
    layer: 3,
    world: "W8",
    location: "Whitemaur Sealing Circle",
    level: "140 below",
    spawnTimes: expandMirageTimes(["1:00", "5:00", "9:00"]),
  },
  // W7 — 141+
  {
    id: "mir_l3_w7_tae",
    name: "Taehyul",
    layer: 3,
    world: "W7",
    location: "Taehyuls Garden",
    level: "141+",
    spawnTimes: expandMirageTimes(["1:00", "3:00", "5:00", "7:00", "9:00", "11:00"]),
  },
  {
    id: "mir_l3_w7_yiun",
    name: "Yiun",
    layer: 3,
    world: "W7",
    location: "Demon Cult Hall",
    level: "141+",
    spawnTimes: expandMirageTimes(["2:00", "5:00", "8:00", "11:00"]),
  },
  // W4 — 141+
  {
    id: "mir_l3_w4_noz",
    name: "Nefariox Obdurate Zenith",
    layer: 3,
    world: "W4",
    location: "Phantasia Desert",
    level: "141+",
    spawnTimes: expandMirageTimes(["2:00", "4:00", "6:00", "8:00", "10:00", "12:00"]),
  },
  {
    id: "mir_l3_w4_kuri",
    name: "Kurilaica",
    layer: 3,
    world: "W4",
    location: "Overlord Sealing Circle",
    level: "141+",
    spawnTimes: expandMirageTimes(["3:00", "6:00", "9:00", "12:00"]),
  },
  // W2 — 143+
  {
    id: "mir_l3_w2_juhui",
    name: "Juhui",
    layer: 3,
    world: "W2",
    location: "Redmoon Mountain",
    level: "143+",
    spawnTimes: expandMirageTimes(["2:30", "5:30", "8:30", "11:30"]),
  },
  {
    id: "mir_l3_w5_faluk",
    name: "Faluk",
    layer: 3,
    world: "W5",
    location: "Great Sabuk Wall",
    level: "143+",
    spawnTimes: expandMirageTimes(["3:30", "6:30", "9:30", "12:30"]),
  },
  {
    id: "mir_l3_w5_twf",
    name: "Tale Warper Fiend",
    layer: 3,
    world: "W5",
    location: "Illusion Temple",
    level: "143+",
    spawnTimes: expandMirageTimes(["1:30", "4:30", "7:30", "10:30"]),
  },
  // W3 — 150+
  {
    id: "mir_l3_w3_gyo",
    name: "Tombeast Gyo",
    layer: 3,
    world: "W3",
    location: "Nefariox Necropolis",
    level: "150+",
    spawnTimes: expandMirageTimes(["2:30", "8:30"]),
  },
  {
    id: "mir_l3_w3_dae",
    name: "Dusk Armado Emperor",
    layer: 3,
    world: "W3",
    location: "Viperbeast Plain",
    level: "150+",
    spawnTimes: expandMirageTimes(["1:30", "3:30", "5:30", "7:30", "9:30", "11:30"]),
  },
  {
    id: "mir_l3_w3_boodo",
    name: "Boodo",
    layer: 3,
    world: "W3",
    location: "Rockcut Tomb",
    level: "150+",
    spawnTimes: expandMirageTimes(["3:30", "9:30"]),
  },
  {
    id: "mir_l3_w3_mara",
    name: "Mara",
    layer: 3,
    world: "W3",
    location: "Rockcut Tomb",
    level: "150+",
    spawnTimes: expandMirageTimes(["2:30", "5:30", "8:30", "11:30"]),
  },
  // W6 — 150+
  {
    id: "mir_l3_w6_sura",
    name: "Sura",
    layer: 3,
    world: "W6",
    location: "Bincheon Town",
    level: "150+",
    spawnTimes: expandMirageTimes(["4:30", "10:30"]),
  },
  {
    id: "mir_l3_w6_mok",
    name: "Mokgang",
    layer: 3,
    world: "W6",
    location: "Bincheon Town",
    level: "150+",
    spawnTimes: expandMirageTimes(["2:30", "4:30", "6:30", "8:30", "10:30", "12:30"]),
  },
  {
    id: "mir_l3_w6_wui",
    name: "Wuihan",
    layer: 3,
    world: "W6",
    location: "Phantom Woods",
    level: "150+",
    spawnTimes: expandMirageTimes(["5:30", "11:30"]),
  },
  {
    id: "mir_l3_w6_yeti",
    name: "Obscene Yeticlops",
    layer: 3,
    world: "W6",
    location: "Bincheon Labyrinth",
    level: "150+",
    spawnTimes: expandMirageTimes(["6:30", "12:30"]),
  },
  {
    id: "mir_l3_w6_thy",
    name: "Transformed Hong Yeom",
    layer: 3,
    world: "W6",
    location: "Demoniac Mine Deep Area",
    level: "150+",
    spawnTimes: expandMirageTimes(["1:30", "3:30", "5:30", "7:30", "9:30", "11:30"]),
  },

  // ── Layer 1 ─────────────────────────────────────────────────────────────
  // W1 — 155+
  {
    id: "mir_l1_w1_jih",
    name: "Jihwa",
    layer: 1,
    world: "W1",
    location: "Unseo Town",
    level: "155+",
    spawnTimes: expandMirageTimes(["2:30", "5:30", "8:30", "11:30"]),
  },
  {
    id: "mir_l1_w1_nya",
    name: "Nighteyes Yaksha",
    layer: 1,
    world: "W1",
    location: "Seven Valleys Mountain",
    level: "155+",
    spawnTimes: expandMirageTimes(["3:30", "9:30"]),
  },
  {
    id: "mir_l1_w1_bca",
    name: "Black Carapace Dusk Armado",
    layer: 1,
    world: "W1",
    location: "Seven Valleys Mountain",
    level: "155+",
    spawnTimes: expandMirageTimes(["3:30", "6:30", "9:30", "12:30"]),
  },
  {
    id: "mir_l1_w1_bul",
    name: "Bulhu",
    layer: 1,
    world: "W1",
    location: "Roaring Flame Island",
    level: "155+",
    spawnTimes: expandMirageTimes(["4:30", "10:30"]),
  },
  // W2 — 155+
  {
    id: "mir_l1_w2_gue",
    name: "Guemugwang",
    layer: 1,
    world: "W2",
    location: "Nine Dragon Ice Field",
    level: "155+",
    spawnTimes: expandMirageTimes(["5:30", "11:30"]),
  },
  {
    id: "mir_l1_w2_dom",
    name: "Do Maeongryong",
    layer: 1,
    world: "W2",
    location: "Underground Jail",
    level: "155+",
    spawnTimes: expandMirageTimes(["6:30", "12:30"]),
  },
  {
    id: "mir_l1_w2_mol",
    name: "Molgrash",
    layer: 1,
    world: "W2",
    location: "Underground Jail",
    level: "155+",
    spawnTimes: expandMirageTimes(["1:30", "4:30", "7:30", "10:30"]),
  },
  {
    id: "mir_l1_w2_wig",
    name: "Wi Gwangryeong",
    layer: 1,
    world: "W2",
    location: "Nine Dragon Palace",
    level: "155+",
    spawnTimes: expandMirageTimes(["2:30", "5:30", "8:30", "11:30"]),
  },
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
    id: "valley_capture",
    name: "⚔️ Hidden Valley Capture",
    zone: "Bicheon Valley 4F / Snake Valley 4F / Redmoon Valley 4F",
    dayOfWeek: 3, // Wednesday
    spawnHourUTC8: 22,
    notifyMinutesBefore: 10,
    description:
      "22:00–23:00 — All Clan members can participate. Valley Bosses also active at 22:00.",
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
    const spawnMs = todayUTC8StartMs + h * 60 * 60 * 1000;
    if (spawnMs > nowUTC + 5000) {
      // 5s buffer
      return new Date(spawnMs);
    }
  }

  // All today's spawns passed — return first spawn tomorrow
  const tomorrowOffset = 24 * 60 * 60 * 1000;
  return new Date(
    todayUTC8StartMs + tomorrowOffset + sortedHours[0] * 60 * 60 * 1000
  );
}

export function getNextSpawnFromTimes(spawnTimes: string[]): Date {
  const UTC8_OFFSET = 8 * 60 * 60 * 1000;
  const nowUTC = Date.now();
  const nowUTC8 = new Date(nowUTC + UTC8_OFFSET);
  const todayUTC8StartMs =
    Date.UTC(
      nowUTC8.getUTCFullYear(),
      nowUTC8.getUTCMonth(),
      nowUTC8.getUTCDate()
    ) - UTC8_OFFSET;

  const sorted = [...spawnTimes].sort();
  for (const t of sorted) {
    const [hStr, mStr] = t.split(":");
    const totalMin = parseInt(hStr, 10) * 60 + parseInt(mStr ?? "0", 10);
    const spawnMs = todayUTC8StartMs + totalMin * 60 * 1000;
    if (spawnMs > nowUTC + 5000) return new Date(spawnMs);
  }
  const [hStr, mStr] = sorted[0].split(":");
  const totalMin = parseInt(hStr, 10) * 60 + parseInt(mStr ?? "0", 10);
  return new Date(
    todayUTC8StartMs + 24 * 60 * 60 * 1000 + totalMin * 60 * 1000
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
    spawnHourUTC8 * 60 * 60 * 1000;

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
