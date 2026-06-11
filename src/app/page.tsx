"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import {
  DAILY_WORLD_BOSSES,
  MIRAGE_BOSSES,
  MAGIC_SQUARE_BOSSES,
  SECRET_PEAK_BOSSES,
  WEEKLY_WORLD_BOSSES,
  formatCountdown,
  getNextFixedSpawn,
  getNextSpawnFromTimes,
  getNextWeeklySpawn,
  getServerTimeString,
  type MagicSquareBoss,
  type MirageBoss,
  type SecretPeakBoss,
} from "@/lib/gameData";
import type { BossTimer } from "@/app/api/get-timers/route";

// ─── Crafting Calculator Data ────────────────────────────────────────────────

/** The 7 constitution types */
const CONSTITUTIONS = [
  {
    id: "iron_skin",
    name: "Iron Skin",
    stat: "Phys. Defense",
    mat1: "Herb Leaf",
    mat2: "Reishi",
    color: "#22d3ee",
  },
  {
    id: "insightful",
    name: "Insightful",
    stat: "HP",
    mat1: "Herb Leaf",
    mat2: "Unihorn Slice",
    color: "#4ade80",
  },
  {
    id: "agility",
    name: "Agility",
    stat: "Evasion",
    mat1: "Reishi",
    mat2: "Unihorn Slice",
    color: "#a78bfa",
  },
  {
    id: "strength",
    name: "Strength",
    stat: "Phys+Spell Atk",
    mat1: "Herb Root",
    mat2: "Century Fruit",
    color: "#f87171",
  },
  {
    id: "clever",
    name: "Clever",
    stat: "Spell Defense",
    mat1: "Herb Leaf",
    mat2: "Herb Root",
    color: "#fb923c",
  },
  {
    id: "awakened",
    name: "Awakened",
    stat: "MP",
    mat1: "Herb Leaf",
    mat2: "Flower Oil",
    color: "#60a5fa",
  },
  {
    id: "focused",
    name: "Focused",
    stat: "Accuracy",
    mat1: "Reishi",
    mat2: "Flower Oil",
    color: "#facc15",
  },
] as const;

/**
 * Per-level cost: [mat1_qty, mat2_qty]
 * Source: mir4.wiki/wiki/Constitution
 * Herb tier per level range:
 *   levels  1-10 → Common (C)
 *   levels 11-20 → Uncommon (UC)
 *   levels 21-30 → Rare (R)
 *   levels 31-40 → Epic (E)
 *   levels 41-55 → Legendary (L)
 */
const CONSTITUTION_LEVEL_COST: Record<number, [number, number]> = {
  1: [2, 1],
  2: [3, 1],
  3: [4, 1],
  4: [6, 1],
  5: [9, 1],
  6: [5, 1],
  7: [7, 1],
  8: [10, 1],
  9: [15, 1],
  10: [22, 1],
  11: [4, 8],
  12: [6, 8],
  13: [9, 8],
  14: [13, 8],
  15: [19, 8],
  16: [10, 14],
  17: [15, 14],
  18: [22, 14],
  19: [33, 14],
  20: [49, 14],
  21: [4, 10],
  22: [6, 10],
  23: [9, 10],
  24: [13, 10],
  25: [19, 10],
  26: [10, 20],
  27: [15, 20],
  28: [22, 20],
  29: [33, 20],
  30: [49, 20],
  31: [20, 30],
  32: [30, 30],
  33: [45, 30],
  34: [67, 30],
  35: [100, 30],
  36: [4, 20],
  37: [6, 20],
  38: [9, 20],
  39: [13, 20],
  40: [19, 20],
  41: [10, 30],
  42: [15, 30],
  43: [22, 30],
  44: [33, 30],
  45: [49, 30],
  46: [20, 40],
  47: [30, 40],
  48: [45, 40],
  49: [67, 40],
  50: [100, 40],
  51: [20, 50],
  52: [30, 50],
  53: [45, 50],
  54: [67, 50],
  55: [100, 50],
};

/** Herb rarity tier label for a given constitution level */
function getHerbTier(level: number): string {
  if (level <= 10) return "C";
  if (level <= 20) return "UC";
  if (level <= 30) return "R";
  if (level <= 40) return "E";
  return "L";
}

/** Full label for a tier abbreviation */
const TIER_LABELS: Record<string, string> = {
  C: "Common",
  UC: "Uncommon",
  R: "Rare",
  E: "Epic",
  L: "Legendary",
};

/** Color for each rarity tier */
const TIER_COLORS: Record<string, string> = {
  C: "#94a3b8",
  UC: "#4ade80",
  R: "#60a5fa",
  E: "#c084fc",
  L: "#fbbf24",
};

/** How many of the lower tier are needed to craft one of the higher tier */
const CRAFT_RATIO = 10;

/** Crafting chain: C→UC→R→E→L */
const TIER_ORDER = ["C", "UC", "R", "E", "L"] as const;
type HerbTier = (typeof TIER_ORDER)[number];

/**
 * Given a map of { tier → qty } herbs needed, convert everything down to
 * raw Common quantities (for display as an optional "raw materials" view).
 */
function toRawCommon(tierMap: Record<HerbTier, number>): number {
  let total = 0;
  for (const tier of TIER_ORDER) {
    const qty = tierMap[tier] ?? 0;
    const multiplier = Math.pow(CRAFT_RATIO, TIER_ORDER.indexOf(tier));
    total += qty * multiplier;
  }
  return total;
}

/**
 * Calculate total materials needed to level a single constitution
 * from `fromLevel` (exclusive) to `toLevel` (inclusive).
 * Returns a map keyed by tier: { C: 0, UC: 0, R: 0, E: 0, L: 0 }
 * for each of the two materials.
 */
function calcConstitutionCost(
  fromLevel: number,
  toLevel: number
): {
  mat1: Record<HerbTier, number>;
  mat2: Record<HerbTier, number>;
} {
  const mat1: Record<HerbTier, number> = { C: 0, UC: 0, R: 0, E: 0, L: 0 };
  const mat2: Record<HerbTier, number> = { C: 0, UC: 0, R: 0, E: 0, L: 0 };

  for (let lvl = fromLevel + 1; lvl <= toLevel; lvl++) {
    const cost = CONSTITUTION_LEVEL_COST[lvl];
    if (!cost) continue;
    const tier = getHerbTier(lvl) as HerbTier;
    mat1[tier] += cost[0];
    mat2[tier] += cost[1];
  }

  return { mat1, mat2 };
}

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab =
  | "secret_peak"
  | "mirage"
  | "world_bosses"
  | "magic_square"
  | "crafting";

type DynamicTimerMap = Record<
  string,
  {
    nextSpawn: Date;
    lastKilled: Date;
    updatedBy: string;
  }
>;

// ─── Sub-components ─────────────────────────────────────────────────────────

function ServerClock() {
  const [time, setTime] = useState(getServerTimeString());

  useEffect(() => {
    const id = setInterval(() => setTime(getServerTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex items-center gap-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        padding: "4px 12px",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-emerald-400"
        style={{
          boxShadow:
            "0 0 6px rgba(52,211,153,0.8), 0 0 12px rgba(52,211,153,0.4)",
        }}
      />
      <span
        className="font-mono text-xs text-zinc-300 tracking-widest"
        suppressHydrationWarning
      >
        {time} UTC+8
      </span>
    </div>
  );
}

function CountdownBadge({
  nextSpawn,
  large = false,
}: {
  nextSpawn: Date | null;
  large?: boolean;
}) {
  const [ms, setMs] = useState<number>(
    () => (nextSpawn ? nextSpawn.getTime() - Date.now() : -1)
  );

  useEffect(() => {
    if (!nextSpawn) return;
    const tick = () => setMs(nextSpawn.getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextSpawn]);

  if (!nextSpawn) {
    return <span className="font-mono text-xs text-zinc-600">—</span>;
  }

  const label = formatCountdown(ms);
  const isSpawned = ms <= 0;
  const isCritical = ms > 0 && ms < 10 * 60 * 1000;
  const isWarning = ms >= 10 * 60 * 1000 && ms < 60 * 60 * 1000;

  if (isSpawned) {
    return (
      <span
        className={`timer-spawned font-semibold tracking-wider ${
          large ? "text-base" : "text-sm"
        }`}
        style={{
          color: "#4ade80",
          textShadow: "0 0 16px rgba(74,222,128,0.7)",
        }}
        suppressHydrationWarning
      >
        ● SPAWNED
      </span>
    );
  }

  const color = isCritical
    ? "#f87171"
    : isWarning
    ? "#fbbf24"
    : "#94a3b8";
  const shadow = isCritical
    ? "0 0 12px rgba(248,113,113,0.6)"
    : isWarning
    ? "0 0 10px rgba(251,191,36,0.4)"
    : "none";

  return (
    <span
      className={`font-mono font-semibold tabular-nums tracking-wider ${
        isCritical ? "timer-critical" : ""
      } ${large ? "text-xl" : "text-sm"}`}
      style={{ color, textShadow: shadow }}
      suppressHydrationWarning
    >
      {label}
    </span>
  );
}

// ─── Secret Peak View ──────────────────────────────────────────────────────

type SecretPeakBossState = "spawned" | "cooldown" | "unknown";

function getSecretPeakBossState(nextSpawn: Date | null): SecretPeakBossState {
  if (!nextSpawn) return "unknown";
  const ms = nextSpawn.getTime() - Date.now();
  if (ms <= 0) return "spawned";
  return "cooldown";
}

function secretPeakPinClasses(boss: SecretPeakBoss, state: SecretPeakBossState) {
  const base =
    "group absolute -translate-x-1/2 -translate-y-full rounded-xl border px-2 py-1 text-[10px] font-semibold shadow-lg backdrop-blur-sm transition-transform hover:-translate-y-[105%]";

  if (state === "cooldown") {
    return `${base} border-zinc-600 bg-zinc-900/90 text-zinc-300`;
  }

  const glow = state === "spawned" ? " ring-2 animate-pulse" : "";

  switch (boss.type) {
    case "teal":
      return `${base} border-sky-400 bg-sky-500/80 text-sky-50 shadow-sky-900/60${glow}`;
    case "gold":
      return `${base} border-amber-400 bg-amber-500/80 text-amber-50 shadow-amber-900/60${glow}`;
    case "red_lower":
    case "red_upper":
      return `${base} border-red-400 bg-red-500/80 text-red-50 shadow-red-900/60${glow}`;
    default:
      return `${base} border-zinc-500 bg-zinc-900/80 text-zinc-100`;
  }
}

function secretPeakCardClasses(boss: SecretPeakBoss, state: SecretPeakBossState) {
  const base =
    "flex items-center justify-between rounded-xl px-4 py-3 glass-card";

  if (state === "cooldown") return base;

  switch (boss.type) {
    case "teal":
      return `${base} card-warning`;
    case "gold":
      return base;
    case "red_lower":
    case "red_upper":
      return `${base} card-critical`;
    case "chamber":
      return base;
    default:
      return base;
  }
}

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
  const [reportMsg, setReportMsg] = useState<
    { type: "ok" | "err"; text: string } | null
  >(null);

  const floorBosses = useMemo(
    () => SECRET_PEAK_BOSSES.filter((b) => b.floor === selectedFloor),
    [selectedFloor]
  );

  const getNextSpawnForBoss = useCallback(
    (boss: SecretPeakBoss): Date | null => {
      if (boss.fixedHoursUTC8 && boss.fixedHoursUTC8.length > 0) {
        return getNextFixedSpawn(boss.fixedHoursUTC8);
      }
      const timer = dynamicTimers[boss.id];
      if (timer) return timer.nextSpawn;
      return null;
    },
    [dynamicTimers]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Floor selector */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setSelectedFloor(f);
              setActivePin(null);
              setReportMsg(null);
            }}
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
        <div className="relative w-full">
          <Image
            src="/maps/secret_peak.png"
            alt={`Secret Peak Floor ${selectedFloor}`}
            width={1337}
            height={732}
            className="w-full h-auto opacity-70"
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />

          <div className="absolute left-3 top-3 rounded-full border border-zinc-700/60 bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-zinc-300">
            Floor {selectedFloor}
          </div>

          {floorBosses.map((boss) => {
            const nextSpawn = getNextSpawnForBoss(boss);
            const state = getSecretPeakBossState(nextSpawn);

            return (
              <button
                key={boss.id}
                type="button"
                onClick={() => {
                  setActivePin(boss);
                  setReportMsg(null);
                }}
                className={secretPeakPinClasses(boss, state)}
                style={{ left: `${boss.pinX}%`, top: `${boss.pinY}%` }}
              >
                <div className="max-w-[7rem] truncate">{boss.name}</div>
                <div className="mt-0.5 text-[9px] font-mono opacity-80">
                  <CountdownBadge nextSpawn={nextSpawn ?? null} />
                </div>
              </button>
            );
          })}

          {activePin && (
            <div
              className="absolute z-20 w-[240px] -translate-x-1/2 -translate-y-full rounded-2xl border border-zinc-700/80 bg-zinc-950/95 px-4 py-3 shadow-2xl shadow-black/80 backdrop-blur-sm"
              style={{
                left: `${activePin.pinX}%`,
                top: `${activePin.pinY}%`,
              }}
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                    Floor {activePin.floor}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold text-zinc-50">
                    {activePin.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePin(null)}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700 text-xs text-zinc-500 hover:text-zinc-200"
                >
                  ×
                </button>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                  Next spawn
                </span>
                <CountdownBadge
                  nextSpawn={getNextSpawnForBoss(activePin) ?? null}
                />
              </div>

              {reportMsg && (
                <p
                  className={`mb-2 text-[11px] ${
                    reportMsg.type === "ok"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {reportMsg.text}
                </p>
              )}

              {(activePin.type === "teal" || activePin.type === "gold") && (
                <button
                  type="button"
                  disabled={reporting || !currentUser}
                  onClick={async () => {
                    if (!currentUser || !activePin) return;
                    setReporting(true);
                    setReportMsg(null);
                    try {
                      await onReportKill(
                        activePin.id,
                        activePin.name,
                        activePin.floor
                      );
                      setReportMsg({
                        type: "ok",
                        text: "Kill reported — timer started.",
                      });
                    } catch {
                      setReportMsg({
                        type: "err",
                        text: "Failed to report kill.",
                      });
                    } finally {
                      setReporting(false);
                    }
                  }}
                  className="w-full rounded-xl border border-emerald-500/80 bg-emerald-500/20 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {reporting
                    ? "Reporting..."
                    : currentUser
                    ? "Report Kill"
                    : "Login required"}
                </button>
              )}

              {(activePin.type === "red_lower" ||
                activePin.type === "red_upper") && (
                <p className="text-center text-[10px] text-zinc-500">
                  Fixed schedule — no report needed
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Boss list below map */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {floorBosses.map((boss) => {
          const nextSpawn = getNextSpawnForBoss(boss);
          const state = getSecretPeakBossState(nextSpawn);
          return (
            <div
              key={boss.id}
              className={secretPeakCardClasses(boss, state)}
            >
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  {boss.name}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-500">
                  {boss.type === "teal" && "Dynamic — 30 min"}
                  {boss.type === "gold" && "Dynamic — 60 min"}
                  {boss.type === "red_lower" && "Fixed — Lower"}
                  {boss.type === "red_upper" && "Fixed — Upper"}
                </p>
              </div>
              <CountdownBadge nextSpawn={nextSpawn ?? null} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mirage View ───────────────────────────────────────────────────────────

function MirageView() {
  const [selectedLayer, setSelectedLayer] = useState<number | "all">("all");

  const layers = useMemo(
    () => [...new Set(MIRAGE_BOSSES.map((b) => b.layer))].sort(),
    []
  );

  const filtered = useMemo(
    () =>
      selectedLayer === "all"
        ? MIRAGE_BOSSES
        : MIRAGE_BOSSES.filter((b) => b.layer === selectedLayer),
    [selectedLayer]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSelectedLayer("all")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          style={
            selectedLayer === "all"
              ? {
                  background: "rgba(168,85,247,0.2)",
                  border: "1px solid rgba(168,85,247,0.5)",
                  color: "#d8b4fe",
                  boxShadow: "0 0 14px rgba(168,85,247,0.25)",
                }
              : {
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#475569",
                }
          }
        >
          All Layers
        </button>
        {layers.map((layer) => (
          <button
            key={layer}
            type="button"
            onClick={() => setSelectedLayer(layer)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={
              selectedLayer === layer
                ? {
                    background: "rgba(168,85,247,0.2)",
                    border: "1px solid rgba(168,85,247,0.5)",
                    color: "#d8b4fe",
                    boxShadow: "0 0 14px rgba(168,85,247,0.25)",
                  }
                : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#475569",
                  }
            }
          >
            Layer {layer}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((boss: MirageBoss) => {
          const nextSpawn = getNextSpawnFromTimes(boss.spawnTimes);
          return (
            <div
              key={boss.id}
              className="glass-card rounded-2xl overflow-hidden"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), rgba(168,85,247,0.4), rgba(255,255,255,0.2), transparent)",
                  zIndex: 2,
                }}
              />
              {boss.rewardImage ? (
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={boss.rewardImage}
                    alt={`${boss.name} rewards`}
                    fill
                    className="object-cover object-top"
                    style={{
                      opacity: 0.9,
                      filter: "saturate(1.15) contrast(1.05)",
                    }}
                    unoptimized
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 35%, rgba(15,22,50,0.85) 100%)",
                    }}
                  />
                  <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#94a3b8",
                      }}
                    >
                      Layer {boss.layer}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(168,85,247,0.25)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(168,85,247,0.4)",
                        color: "#d8b4fe",
                      }}
                    >
                      {boss.world}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#64748b",
                      }}
                    >
                      {boss.level}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 pt-4">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#64748b",
                    }}
                  >
                    Layer {boss.layer}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(168,85,247,0.2)",
                      border: "1px solid rgba(168,85,247,0.35)",
                      color: "#d8b4fe",
                    }}
                  >
                    {boss.world}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#475569",
                    }}
                  >
                    {boss.level}
                  </span>
                </div>
              )}

	              <div className="px-4 pb-4 pt-3">
                <h3 className="text-sm font-bold text-zinc-100 leading-snug mb-0.5">
                  {boss.name}
                </h3>
                <p className="text-[11px] text-zinc-500 mb-3">{boss.location}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {boss.spawnTimes.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#64748b",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600">
                    Next Spawn
                  </span>
                  <CountdownBadge nextSpawn={nextSpawn} large />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Magic Square View ────────────────────────────────────────────────────

function MagicSquareView({
  dynamicTimers,
  currentUser,
  onReportKill,
}: {
  dynamicTimers: DynamicTimerMap;
  currentUser: { id: string; username: string } | null;
  onReportKill: (bossId: string, bossName: string, floor: number) => Promise<void>;
}) {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [reportingId, setReportingId] = useState<string | null>(null);

  const floorBosses = useMemo(
    () => MAGIC_SQUARE_BOSSES.filter((b) => b.floor === selectedFloor),
    [selectedFloor]
  );

  const getNextSpawnForBoss = useCallback(
    (boss: MagicSquareBoss): Date | null => {
      if (boss.fixedHoursUTC8 && boss.fixedHoursUTC8.length > 0) {
        return getNextFixedSpawn(boss.fixedHoursUTC8);
      }
      const timer = dynamicTimers[boss.id];
      if (timer) return timer.nextSpawn;
      return null;
    },
    [dynamicTimers]
  );

  const getState = (boss: MagicSquareBoss): SecretPeakBossState => {
    const nextSpawn = getNextSpawnForBoss(boss);
    return getSecretPeakBossState(nextSpawn);
  };

  const cardClasses = (boss: MagicSquareBoss, state: SecretPeakBossState) => {
    const base =
      "rounded-2xl border p-4 backdrop-blur-sm transition-all flex flex-col gap-2";
    if (state === "cooldown") {
      return `${base} border-zinc-700/60 bg-zinc-900/80 text-zinc-300`;
    }
    if (boss.type === "chamber1") {
      return `${base} border-sky-500/30 bg-sky-500/5`;
    }
    if (boss.type === "chamber2") {
      return `${base} border-amber-500/30 bg-amber-500/5`;
    }
    return `${base} border-violet-500/30 bg-violet-500/5`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setSelectedFloor(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={
              selectedFloor === f
                ? {
                    background: "rgba(168,85,247,0.2)",
                    border: "1px solid rgba(168,85,247,0.5)",
                    color: "#d8b4fe",
                    boxShadow: "0 0 14px rgba(168,85,247,0.25)",
                  }
                : {
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#475569",
                  }
            }
          >
            Floor {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {floorBosses.map((boss) => {
          const nextSpawn = getNextSpawnForBoss(boss);
          const state = getState(boss);
          const canReport =
            boss.type === "chamber1" || boss.type === "chamber2";

          return (
            <div key={boss.id} className={cardClasses(boss, state)}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="mb-0.5 text-[10px] uppercase tracking-widest text-zinc-500">
                    Floor {boss.floor}
                  </p>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    {boss.name}
                  </h3>
                </div>
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                    boss.type === "chamber1"
                      ? "bg-sky-500/20 text-sky-300"
                      : "",
                    boss.type === "chamber2"
                      ? "bg-amber-500/20 text-amber-300"
                      : "",
                    boss.type === "chamber3"
                      ? "bg-violet-500/20 text-violet-300"
                      : "",
                  ].join(" ")}
                >
                  {boss.type}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                  Next spawn
                </span>
                <CountdownBadge nextSpawn={nextSpawn ?? null} />
              </div>

              {canReport ? (
                <button
                  type="button"
                  disabled={
                    !currentUser || reportingId === boss.id || state === "cooldown"
                  }
                  onClick={async () => {
                    if (!currentUser) return;
                    setReportingId(boss.id);
                    try {
                      await onReportKill(boss.id, boss.name, boss.floor);
                    } finally {
                      setReportingId(null);
                    }
                  }}
                  className="mt-2 w-full rounded-xl border border-emerald-500/80 bg-emerald-500/20 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {reportingId === boss.id
                    ? "Reporting..."
                    : currentUser
                    ? "Report Kill"
                    : "Login required"}
                </button>
              ) : (
                <p className="mt-2 text-[10px] text-zinc-500">
                  Fixed schedule — no report needed
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── World Bosses View ────────────────────────────────────────────────────

function WorldBossesView() {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Daily
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DAILY_WORLD_BOSSES.map((boss) => (
            <div
              key={boss.id}
              className="glass-card rounded-2xl p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    {boss.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {boss.zone}
                  </p>
                </div>
                <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-blue-300">
                  Daily
                </span>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {boss.spawnHoursUTC8.map((h) => (
                  <span
                    key={h}
                    className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
                  >
                    {String(h).padStart(2, "0")}:00
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                  Next spawn
                </span>
                <CountdownBadge nextSpawn={getNextFixedSpawn(boss.spawnHoursUTC8)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Weekly
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {WEEKLY_WORLD_BOSSES.map((boss) => (
            <div
              key={boss.id}
              className="glass-card rounded-2xl p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      {weekDays[boss.dayOfWeek]}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {String(boss.spawnHourUTC8).padStart(2, "0")}:00 UTC+8
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    {boss.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {boss.zone}
                  </p>
                  {boss.description && (
                    <p className="mt-1 text-[10px] text-amber-400/70">
                      {boss.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-red-300">
                    Weekly
                  </span>
                  <CountdownBadge
                    nextSpawn={getNextWeeklySpawn(
                      boss.dayOfWeek,
                      boss.spawnHourUTC8
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CraftingCalculator Component ────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
      style={{
        background: `${TIER_COLORS[tier]}22`,
        border: `1px solid ${TIER_COLORS[tier]}66`,
        color: TIER_COLORS[tier],
      }}
    >
      {tier}
    </span>
  );
}

function CraftingCalculator() {
  const [selectedConstitutions, setSelectedConstitutions] = useState<
    Set<string>
  >(new Set(CONSTITUTIONS.map((c) => c.id)));
  const [fromLevel, setFromLevel] = useState(0);
  const [toLevel, setToLevel] = useState(10);
  const [showRawCommon, setShowRawCommon] = useState(false);

  const MAX_LEVEL = 55;

  const toggleConstitution = (id: string) => {
    setSelectedConstitutions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () =>
    setSelectedConstitutions(new Set(CONSTITUTIONS.map((c) => c.id)));
  const selectNone = () =>
    setSelectedConstitutions(new Set([CONSTITUTIONS[0].id]));

  const materialTotals = useMemo(() => {
    const totals: Record<string, Record<HerbTier, number>> = {};

    for (const con of CONSTITUTIONS) {
      if (!selectedConstitutions.has(con.id)) continue;
      const { mat1, mat2 } = calcConstitutionCost(fromLevel, toLevel);

      if (!totals[con.mat1])
        totals[con.mat1] = { C: 0, UC: 0, R: 0, E: 0, L: 0 };
      for (const t of TIER_ORDER) totals[con.mat1][t] += mat1[t];

      if (!totals[con.mat2])
        totals[con.mat2] = { C: 0, UC: 0, R: 0, E: 0, L: 0 };
      for (const t of TIER_ORDER) totals[con.mat2][t] += mat2[t];
    }

    return Object.entries(totals)
      .map(([name, tiers]) => ({
        name,
        tiers,
        rawCommon: toRawCommon(tiers),
        total: Object.values(tiers).reduce((a, b) => a + b, 0),
      }))
      .filter((m) => m.total > 0);
  }, [selectedConstitutions, fromLevel, toLevel]);

  const isValidRange = fromLevel < toLevel;

  return (
    <div className="flex flex-col gap-6">
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(12, 18, 42, 0.45)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "#94a3b8" }}
          >
            Constitutions
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="rounded-lg px-2.5 py-1 text-[11px] transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={selectNone}
              className="rounded-lg px-2.5 py-1 text-[11px] transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {CONSTITUTIONS.map((con) => {
            const selected = selectedConstitutions.has(con.id);
            return (
              <button
                key={con.id}
                type="button"
                onClick={() => toggleConstitution(con.id)}
                className="flex flex-col items-center gap-1 rounded-xl px-2 py-3 transition-all"
                style={{
                  background: selected
                    ? `${con.color}18`
                    : "rgba(255,255,255,0.03)",
                  border: selected
                    ? `1px solid ${con.color}60`
                    : "1px solid rgba(255,255,255,0.07)",
                  boxShadow: selected
                    ? `0 0 12px ${con.color}20`
                    : "none",
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: selected ? con.color : "#475569" }}
                >
                  {con.name}
                </span>
                <span className="text-[10px]" style={{ color: "#475569" }}>
                  {con.stat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(12, 18, 42, 0.45)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <h3
          className="mb-4 text-sm font-semibold uppercase tracking-widest"
          style={{ color: "#94a3b8" }}
        >
          Level Range
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs" style={{ color: "#64748b" }}>
              Current level
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={MAX_LEVEL - 1}
                value={fromLevel}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setFromLevel(v);
                  if (v >= toLevel) setToLevel(Math.min(v + 1, MAX_LEVEL));
                }}
                className="flex-1 accent-cyan-400"
              />
              <span
                className="w-10 text-center text-base font-bold tabular-nums"
                style={{ color: "#e2e8f0" }}
              >
                {fromLevel}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs" style={{ color: "#64748b" }}>
              Target level
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={MAX_LEVEL}
                value={toLevel}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setToLevel(v);
                  if (v <= fromLevel) setFromLevel(Math.max(v - 1, 0));
                }}
                className="flex-1 accent-purple-400"
              />
              <span
                className="w-10 text-center text-base font-bold tabular-nums"
                style={{ color: "#e2e8f0" }}
              >
                {toLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-mono"
            style={{
              background: "rgba(34,211,238,0.12)",
              border: "1px solid rgba(34,211,238,0.3)",
              color: "#67e8f9",
            }}
          >
            Lv {fromLevel}
          </span>
          <div
            className="h-px flex-1"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <span className="text-xs" style={{ color: "#475569" }}>
            {toLevel - fromLevel} level
            {toLevel - fromLevel !== 1 ? "s" : ""}
          </span>
          <div
            className="h-px flex-1"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <span
            className="rounded-full px-3 py-1 text-xs font-mono"
            style={{
              background: "rgba(168,85,247,0.12)",
              border: "1px solid rgba(168,85,247,0.3)",
              color: "#d8b4fe",
            }}
          >
            Lv {toLevel}
          </span>
        </div>
      </div>

      {isValidRange && materialTotals.length > 0 && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: "rgba(12, 18, 42, 0.45)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#94a3b8" }}
            >
              Materials Required
            </h3>
            <label className="flex cursor-pointer items-center gap-2">
              <span className="text-[11px]" style={{ color: "#64748b" }}>
                Show raw Common qty
              </span>
              <div
                className="relative h-4 w-8 cursor-pointer rounded-full transition-colors"
                style={{
                  background: showRawCommon
                    ? "rgba(34,211,238,0.5)"
                    : "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                onClick={() => setShowRawCommon((v) => !v)}
              >
                <div
                  className="absolute top-0.5 h-3 w-3 rounded-full transition-all"
                  style={{
                    background: showRawCommon ? "#22d3ee" : "#475569",
                    left: showRawCommon ? "calc(100% - 14px)" : "2px",
                  }}
                />
              </div>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            {materialTotals.map((mat) => (
              <div
                key={mat.name}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {mat.name}
                  </span>
                  {showRawCommon && (
                    <span className="text-xs" style={{ color: "#64748b" }}>
                      ≈ {" "}
                      <span
                        className="font-bold tabular-nums"
                        style={{ color: "#94a3b8" }}
                      >
                        {mat.rawCommon.toLocaleString()}
                      </span>{" "}
                      Common
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {TIER_ORDER.filter((t) => (mat.tiers[t] ?? 0) > 0).map(
                    (tier) => (
                      <div
                        key={tier}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                        style={{
                          background: `${TIER_COLORS[tier]}12`,
                          border: `1px solid ${TIER_COLORS[tier]}30`,
                        }}
                      >
                        <TierBadge tier={tier} />
                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{ color: TIER_COLORS[tier] }}
                        >
                          {mat.tiers[tier].toLocaleString()}
                        </span>
                        <span
                          className="hidden text-xs sm:inline"
                          style={{ color: "#475569" }}
                        >
                          {TIER_LABELS[tier]}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>

          <p
            className="mt-4 text-[11px] leading-relaxed"
            style={{ color: "#475569" }}
          >
            ⚠️ Promotions (every 5 levels) require additional materials
            (Moonlight Magic Stone, Blue Devil Stone, Purified Water, Rare
            Virtue Pill) — not shown here. All 7 constitutions must reach the
            same level before a promotion is possible.
          </p>
        </div>
      )}

      {!isValidRange && (
        <div
          className="flex flex-col items-center gap-2 rounded-2xl p-8 text-center"
          style={{
            background: "rgba(12, 18, 42, 0.30)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className="text-2xl">⚗️</span>
          <p className="text-sm" style={{ color: "#475569" }}>
            Set a level range to see material requirements
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────---

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("world_bosses");
  const [currentUser, setCurrentUser] = useState<
    { id: string; username: string } | null
  >(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const [dynamicTimers, setDynamicTimers] = useState<DynamicTimerMap>({});
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;

    async function init() {
      // Try to restore saved username from localStorage first
      const savedUsername = localStorage.getItem("mir4_username");
      const savedId = localStorage.getItem("mir4_user_id");
      if (savedUsername && savedId && mounted) {
        setCurrentUser({ id: savedId, username: savedUsername });
        setSdkReady(true);
        // Still try Discord SDK in background to get real identity
      }

      try {
        const clientId =
          process.env.NEXT_PUBLIC_DISCORD_APP_ID ?? process.env.DISCORD_APP_ID;
        if (!clientId) {
          if (!savedUsername && mounted) setSdkError(true);
          return;
        }

        const sdk = new DiscordSDK(clientId);
        await sdk.ready();
        // SDK is ready — we're inside Discord Activity
        // Mark as Discord-connected (no full OAuth needed for basic functionality)
        if (mounted) {
          setSdkReady(true);
          if (!savedUsername) {
            setSdkError(false);
          }
        }
      } catch {
        // Not in Discord (browser/web mode) — still allow use with saved username
        if (mounted && !savedUsername) {
          setSdkError(true);
        }
      }
    }

    void init();
    return () => {
      mounted = false;
    };
  }, []);

  const fetchTimers = useCallback(async () => {
    try {
      const res = await fetch("/api/get-timers");
      const json = (await res.json()) as {
        success: boolean;
        timers?: BossTimer[];
      };
      if (!json.success || !json.timers) return;

      const map: DynamicTimerMap = {};
      for (const t of json.timers) {
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
    const timeoutId = setTimeout(() => {
      void fetchTimers();
    }, 0);
    const id = setInterval(fetchTimers, 30_000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(id);
    };
  }, [fetchTimers]);

  const handleReportKill = useCallback(
    async (bossId: string, bossName: string, floor: number) => {
      if (!currentUser) throw new Error("Not logged in");
      const spBossForRequest = SECRET_PEAK_BOSSES.find((b) => b.id === bossId);
      const msBossForRequest = MAGIC_SQUARE_BOSSES.find((b) => b.id === bossId);
      const respawnMinutesForRequest =
        spBossForRequest?.respawnMinutes ??
        msBossForRequest?.respawnMinutes ??
        180;
      const res = await fetch("/api/report-kill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bossName: bossId,
          location: `Floor ${floor}`,
          reporterId: currentUser.id,
          respawnMinutes: respawnMinutesForRequest,
        }),
      });

      const json = (await res.json()) as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "Failed");

      const spBoss = SECRET_PEAK_BOSSES.find((b) => b.id === bossId);
      const msBoss = MAGIC_SQUARE_BOSSES.find((b) => b.id === bossId);
      const respawnMinutes =
        spBoss?.respawnMinutes ?? msBoss?.respawnMinutes ?? null;
      if (respawnMinutes) {
        const nextSpawn = new Date(
          Date.now() + respawnMinutes * 60 * 1000
        );
        setDynamicTimers((prev) => ({
          ...prev,
          [bossId]: {
            nextSpawn,
            lastKilled: new Date(),
            updatedBy: currentUser.id,
          },
        }));
      }
    },
    [currentUser]
  );

  // Show name prompt if SDK initialized but no user yet
  useEffect(() => {
    if (!currentUser && (sdkReady || sdkError)) {
      const timer = setTimeout(() => {
        if (!currentUser) setShowNamePrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [sdkReady, sdkError, currentUser]);

  const handleSaveName = useCallback(() => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const userId = `user_${Date.now()}`;
    localStorage.setItem("mir4_username", trimmed);
    localStorage.setItem("mir4_user_id", userId);
    setCurrentUser({ id: userId, username: trimmed });
    setSdkReady(true);
    setShowNamePrompt(false);
  }, [nameInput]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "world_bosses", label: "World Bosses" },
    { id: "secret_peak", label: "Secret Peak" },
    { id: "magic_square", label: "Magic Square" },
    { id: "mirage", label: "Mirage" },
    { id: "crafting", label: "⚗️ Crafting" },
  ];

  return (
    <div className="min-h-screen text-zinc-100 antialiased">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-8">
        <header
          className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h1
              className="text-xl font-bold tracking-tight sm:text-2xl"
              style={{
                background:
                  "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ⚔️ MIR4 Boss Tracker
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Real-time spawn tracker · Secret Peak · Magic Square · Mirage ·
              World Bosses
            </p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <ServerClock />
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span
                  className="text-xs"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    padding: "3px 10px",
                    color: "#94a3b8",
                  }}
                >
                  👤 <span className="font-medium text-zinc-200">{currentUser.username}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("mir4_username");
                    localStorage.removeItem("mir4_user_id");
                    setCurrentUser(null);
                    setSdkReady(false);
                    setSdkError(false);
                    setShowNamePrompt(true);
                    setNameInput("");
                  }}
                  className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNamePrompt(true)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                {sdkError ? "Login (web mode)" : "Login"}
              </button>
            )}
          </div>
        </header>

        <nav className="flex gap-1 border-b border-zinc-800/80">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-all",
                activeTab === tab.id
                  ? "border-red-500 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-300",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="flex-1" suppressHydrationWarning>
          {activeTab === "secret_peak" && (
            <SecretPeakView
              dynamicTimers={dynamicTimers}
              currentUser={currentUser}
              onReportKill={handleReportKill}
            />
          )}
          {activeTab === "magic_square" && (
            <MagicSquareView
              dynamicTimers={dynamicTimers}
              currentUser={currentUser}
              onReportKill={handleReportKill}
            />
          )}
          {activeTab === "mirage" && <MirageView />}
          {activeTab === "world_bosses" && <WorldBossesView />}
          {activeTab === "crafting" && (
            <section>
              <div className="mb-6">
                <h2
                  className="text-base font-bold tracking-tight"
                  style={{
                    background:
                      "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  ⚗️ Constitution Crafting Calculator
                </h2>
                <p className="mt-0.5 text-xs" style={{ color: "#475569" }}>
                  Calculate total herbs & materials needed to upgrade your
                  constitutions
                </p>
              </div>
              <CraftingCalculator />
            </section>
          )}
        </section>

        <footer className="mt-6 flex items-center justify-between border-t border-zinc-900 pt-4 text-[11px] text-zinc-600">
          <span>MIR4 Boss Tracker</span>
          <span>Next.js · Supabase · Discord SDK</span>
        </footer>
      </main>

      {/* Name Prompt Modal */}
      {showNamePrompt && !currentUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(3,7,17,0.85)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: "rgba(8,14,36,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 0 80px rgba(109,40,217,0.2), 0 32px 64px rgba(0,0,0,0.7)",
            }}
          >
            <h2 className="mb-1 text-base font-bold text-zinc-50">Who are you?</h2>
            <p className="mb-4 text-xs text-zinc-500">
              Enter your Discord username to report boss kills. Saved
              automatically.
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
              }}
              placeholder="Your Discord username"
              autoFocus
              className="mb-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20"
            />
            <button
              type="button"
              disabled={!nameInput.trim()}
              onClick={handleSaveName}
              className="w-full rounded-xl border border-red-500/80 bg-red-500/20 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
