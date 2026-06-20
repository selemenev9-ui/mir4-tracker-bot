"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import {
  DAILY_WORLD_BOSSES,
  MIRAGE_BOSSES,
  MAGIC_SQUARE_BOSSES,
  SECRET_PEAK_BOSSES,
  WEEKLY_WORLD_BOSSES,
  SQUARE_11_EVENTS,
  DRAGON_TOWER_EVENTS,
  EVENT_MIRAGE_EVENTS,
  PURGATORY_EVENTS,
  SERVER_EVENTS,
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

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab =
  | "secret_peak"
  | "mirage"
  | "world_bosses"
  | "magic_square"
  | "square_11"
  | "dragon_tower"
  | "event_mirage"
  | "purgatory"
  | "server"
  | "calculator";

type DynamicTimerMap = Record<
  string,
  {
    nextSpawn: Date;
    lastKilled: Date;
    updatedBy: string;
  }
>;

type DiscordSDKWithCommands = DiscordSDK & {
  commands: {
    authorize(args: {
      client_id: string;
      response_type: "code";
      state: string;
      scope: string[];
    }): Promise<{ code: string }>;
    authenticate(args: {
      access_token: string;
    }): Promise<{
      user?: {
        id?: string;
        username?: string;
        global_name?: string | null;
      };
    }>;
    openExternalLink(args: { url: string }): Promise<void>;
  };
};

// ─── Fixed-Hour Events Views (Square 11, Dragon Tower, Event Mirage, Purgatory, Server) ──

function Square11View({
	userId,
	subscribedBossIds,
	onBellToggle,
}: {
	userId: string | null;
	subscribedBossIds: Set<string>;
	onBellToggle: (bossId: string, newState: boolean) => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			<h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
				Square 11
			</h3>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
				{SQUARE_11_EVENTS.map((event, index) => (
					<div
						key={event.id}
						className="@container/card relative overflow-hidden glass-card flex flex-col justify-between rounded-xl p-2 @[480px]/app:p-3"
						style={{ animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}
					>
						<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(getNextFixedSpawn(event.spawnHoursUTC8)) }} />
						<div className="mb-2 flex items-center justify-between gap-2">
							<h4 className="text-sm font-semibold text-zinc-100">
								{event.name}
							</h4>
							<span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-300">
								Square 11
							</span>
						</div>
						<div className="mb-2 flex flex-wrap gap-1.5">
							{event.spawnHoursUTC8.map((h) => (
								<span
									key={h}
									className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
								>
									{String(h).padStart(2, "0")}:
									00
								</span>
							))}
						</div>
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<span className="text-[10px] uppercase tracking-wide text-zinc-500">
									Next spawn
								</span>
								<CountdownBadge
									nextSpawn={getNextFixedSpawn(event.spawnHoursUTC8)}
								/>
							</div>
							<BellToggle
								bossId={event.id}
								userId={userId}
								initialSubscribed={subscribedBossIds.has(event.id)}
								onToggle={onBellToggle}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function DragonTowerView({
	userId,
	subscribedBossIds,
	onBellToggle,
}: {
	userId: string | null;
	subscribedBossIds: Set<string>;
	onBellToggle: (bossId: string, newState: boolean) => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			<h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
				Dragon Tower
			</h3>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
				{DRAGON_TOWER_EVENTS.map((event, index) => (
					<div
						key={event.id}
						className="@container/card relative overflow-hidden glass-card flex flex-col justify-between rounded-xl p-2 @[480px]/app:p-3"
						style={{ animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}
					>
						<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(getNextFixedSpawn(event.spawnHoursUTC8)) }} />
						<div className="mb-2 flex items-center justify-between gap-2">
							<h4 className="text-sm font-semibold text-zinc-100">
								{event.name}
							</h4>
							<span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-300">
								Tower
							</span>
						</div>
						<div className="mb-2 flex flex-wrap gap-1.5">
							{event.spawnHoursUTC8.map((h) => (
								<span
									key={h}
									className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
								>
									{String(h).padStart(2, "0")}:
									00
								</span>
							))}
						</div>
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<span className="text-[10px] uppercase tracking-wide text-zinc-500">
									Next spawn
								</span>
								<CountdownBadge
									nextSpawn={getNextFixedSpawn(event.spawnHoursUTC8)}
								/>
							</div>
							<BellToggle
								bossId={event.id}
								userId={userId}
								initialSubscribed={subscribedBossIds.has(event.id)}
								onToggle={onBellToggle}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function EventMirageView({
	userId,
	subscribedBossIds,
	onBellToggle,
}: {
	userId: string | null;
	subscribedBossIds: Set<string>;
	onBellToggle: (bossId: string, newState: boolean) => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			<h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
				Event — Mirage
			</h3>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
				{EVENT_MIRAGE_EVENTS.map((event, index) => (
					<div
						key={event.id}
						className="@container/card relative overflow-hidden glass-card flex flex-col justify-between rounded-xl p-2 @[480px]/app:p-3"
						style={{ animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}
					>
						<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(getNextFixedSpawn(event.spawnHoursUTC8)) }} />
						<div className="mb-2 flex items-center justify-between gap-2">
							<h4 className="text-sm font-semibold text-zinc-100">
								{event.name}
							</h4>
							<span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-fuchsia-300">
								Event Mirage
							</span>
						</div>
						<div className="mb-2 flex flex-wrap gap-1.5">
							{event.spawnHoursUTC8.map((h) => (
								<span
									key={h}
									className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
								>
									{String(h).padStart(2, "0")}:
									00
								</span>
							))}
						</div>
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<span className="text-[10px] uppercase tracking-wide text-zinc-500">
									Next spawn
								</span>
								<CountdownBadge
									nextSpawn={getNextFixedSpawn(event.spawnHoursUTC8)}
								/>
							</div>
							<BellToggle
								bossId={event.id}
								userId={userId}
								initialSubscribed={subscribedBossIds.has(event.id)}
								onToggle={onBellToggle}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function PurgatoryView({
	userId,
	subscribedBossIds,
	onBellToggle,
}: {
	userId: string | null;
	subscribedBossIds: Set<string>;
	onBellToggle: (bossId: string, newState: boolean) => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			<h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
				Purgatory
			</h3>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
				{PURGATORY_EVENTS.map((event, index) => (
					<div
						key={event.id}
						className="@container/card relative overflow-hidden glass-card flex flex-col justify-between rounded-xl p-2 @[480px]/app:p-3"
						style={{ animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}
					>
						<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(getNextFixedSpawn(event.spawnHoursUTC8)) }} />
						<div className="mb-2 flex items-center justify-between gap-2">
							<h4 className="text-sm font-semibold text-zinc-100">
								{event.name}
							</h4>
							<span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-red-300">
								Purgatory
							</span>
						</div>
						<div className="mb-2 flex flex-wrap gap-1.5">
							{event.spawnHoursUTC8.map((h) => (
								<span
									key={h}
									className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
								>
									{String(h).padStart(2, "0")}:
									00
								</span>
							))}
						</div>
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<span className="text-[10px] uppercase tracking-wide text-zinc-500">
									Next spawn
								</span>
								<CountdownBadge
									nextSpawn={getNextFixedSpawn(event.spawnHoursUTC8)}
								/>
							</div>
							<BellToggle
								bossId={event.id}
								userId={userId}
								initialSubscribed={subscribedBossIds.has(event.id)}
								onToggle={onBellToggle}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function ServerView({
	userId,
	subscribedBossIds,
	onBellToggle,
}: {
	userId: string | null;
	subscribedBossIds: Set<string>;
	onBellToggle: (bossId: string, newState: boolean) => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			<h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
				Server &amp; System
			</h3>
			<div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
				{SERVER_EVENTS.map((event, index) => (
					<div
						key={event.id}
						className="@container/card relative overflow-hidden glass-card flex flex-col justify-between rounded-xl p-2 @[480px]/app:p-3"
						style={{ animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}
					>
						<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(getNextFixedSpawn(event.spawnHoursUTC8)) }} />
						<div className="mb-2 flex items-center justify-between gap-2">
							<div>
								<h4 className="text-sm font-semibold text-zinc-100">
									{event.name}
								</h4>
								<p className="mt-0.5 text-[11px] text-zinc-500">
									{event.category === "server" ? "Server event" : "System"}
								</p>
							</div>
							<span className="rounded-full bg-zinc-700/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-zinc-300">
								{event.category}
							</span>
						</div>
						<div className="mb-2 flex flex-wrap gap-1.5">
							{event.spawnHoursUTC8.map((h) => (
								<span
									key={h}
									className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
								>
									{String(h).padStart(2, "0")}:
									00
								</span>
							))}
						</div>
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<span className="text-[10px] uppercase tracking-wide text-zinc-500">
									Next spawn
								</span>
								<CountdownBadge
									nextSpawn={getNextFixedSpawn(event.spawnHoursUTC8)}
								/>
							</div>
							<BellToggle
								bossId={event.id}
								userId={userId}
								initialSubscribed={subscribedBossIds.has(event.id)}
								onToggle={onBellToggle}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

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
        className="font-mono text-xs @[500px]/app:text-sm text-zinc-300 tracking-widest"
        suppressHydrationWarning
      >
        {time} UTC+8
      </span>
    </div>
  );
}

function CountdownBadge({
  nextSpawn,
  size = "sm",
  large,
}: {
  nextSpawn: Date | null;
  size?: "sm" | "lg";
  large?: boolean;
}) {
  const isLarge = size === "lg" || large;
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
          isLarge ? "text-base" : "text-sm"
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
      } ${isLarge ? "text-xl" : "text-sm"}`}
      style={{ color, textShadow: shadow }}
      suppressHydrationWarning
    >
      {label}
    </span>
  );
}

function BellToggle({
  bossId,
  userId,
  initialSubscribed = false,
  onToggle,
}: {
  bossId: string;
  userId: string | null;
  initialSubscribed?: boolean;
  onToggle?: (bossId: string, newState: boolean) => void;
}) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);
  const [ringing, setRinging] = useState(false);

  if (!userId) return null;

  async function toggle() {
    setLoading(true);
    try {
      if (subscribed) {
        await fetch("/api/reminders", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, boss_id: bossId }),
        });
        setSubscribed(false);
        onToggle?.(bossId, false);
      } else {
        await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            boss_id: bossId,
            notify_minutes_before: 10,
          }),
        });
        setSubscribed(true);
        onToggle?.(bossId, true);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClick() {
    if (!subscribed) {
      setRinging(true);
      setTimeout(() => setRinging(false), 700);
    }
    void toggle();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title={subscribed ? "Отключить уведомление" : "Уведомить за 10 мин"}
      style={{
        background: "none",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        padding: "4px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: loading ? 0.5 : 1,
      }}
    >
      {subscribed && (
        <span style={{
          position: "absolute",
          inset: -2,
          borderRadius: "50%",
          border: "1.5px solid rgba(251,191,36,0.5)",
          animation: "bell-pulse 2s ease-out infinite",
        }} />
      )}
      <svg
        width={18} height={18}
        viewBox="0 0 24 24"
        fill={subscribed ? "#fbbf24" : "none"}
        stroke={subscribed ? "#fbbf24" : "#71717a"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={ringing ? "bell-ring" : ""}
        style={{ filter: subscribed ? "drop-shadow(0 0 6px rgba(251,191,36,0.6))" : "none" }}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    </button>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function accentColor(nextSpawn: Date | null): string {
  if (!nextSpawn) return "rgba(255,255,255,0.06)";
  const ms = nextSpawn.getTime() - Date.now();
  if (ms <= 0) return "#22c55e";
  if (ms < 10 * 60 * 1000) return "#ef4444";
  if (ms < 60 * 60 * 1000) return "#f59e0b";
  return "rgba(255,255,255,0.06)";
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
    "@container/card relative overflow-hidden flex items-center justify-between rounded-xl px-2 @[480px]/app:px-3 py-2 @[480px]/app:py-2.5 glass-card";

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
  subscribedBossIds,
  onBellToggle,
}: {
  dynamicTimers: DynamicTimerMap;
  currentUser: { id: string; username: string; avatarUrl?: string | null } | null;
  onReportKill: (bossId: string, bossName: string, floor: number) => Promise<void>;
  subscribedBossIds: Set<string>;
  onBellToggle: (bossId: string, newState: boolean) => void;
}) {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [activePin, setActivePin] = useState<SecretPeakBoss | null>(null);
  const [reporting, setReporting] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);
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
    <div className="flex flex-col gap-3">
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
                <>
                  {(() => {
                    const nextSpawn = getNextSpawnForBoss(activePin);
                    // eslint-disable-next-line react-hooks/purity
                    if (!nextSpawn || nextSpawn.getTime() <= Date.now()) {
                      return (
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
                      );
                    }
                    return null;
                  })()}
                </>
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
        {floorBosses.map((boss, index) => {
          const nextSpawn = getNextSpawnForBoss(boss);
          const state = getSecretPeakBossState(nextSpawn);
          return (
            <div
              key={boss.id}
              className={secretPeakCardClasses(boss, state)}
              style={{ animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(nextSpawn ?? null) }} />
              {/* Compact row */}
              <div className="flex @[700px]/app:hidden items-center gap-2 flex-1">
                {state === "cooldown" && (
                  <BellToggle
                    bossId={boss.id}
                    userId={currentUser ? currentUser.id : null}
                    initialSubscribed={subscribedBossIds.has(boss.id)}
                    onToggle={onBellToggle}
                  />
                )}
                <span className="font-semibold text-xs flex-1">{boss.name}</span>
                <span className="text-[10px] text-zinc-500 uppercase">
                  {boss.type === "teal" && "30m"}
                  {boss.type === "gold" && "60m"}
                  {boss.type === "red_lower" && "Lower"}
                  {boss.type === "red_upper" && "Upper"}
                </span>
                <CountdownBadge nextSpawn={nextSpawn ?? null} />
                {(boss.type === "teal" || boss.type === "gold") && state !== "cooldown" && currentUser && (
                  <button
                    type="button"
                    disabled={reportingId === boss.id}
                    onClick={async () => {
                      if (!currentUser) return;
                      setReportingId(boss.id);
                      try {
                        await onReportKill(boss.id, boss.name, boss.floor);
                      } finally {
                        setReportingId(null);
                      }
                    }}
                    className="rounded-md border border-emerald-500/80 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:opacity-40"
                    title="Report Kill"
                  >
                    ⚔️
                  </button>
                )}
              </div>
              {/* Full card */}
              <div className="hidden @[700px]/app:flex items-center justify-between flex-1">
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
                <div className="flex items-center gap-2">
                  <CountdownBadge nextSpawn={nextSpawn ?? null} size="lg" />
                  {state === "cooldown" && (
                    <BellToggle
                      bossId={boss.id}
                      userId={currentUser ? currentUser.id : null}
                      initialSubscribed={subscribedBossIds.has(boss.id)}
                      onToggle={onBellToggle}
                    />
                  )}
                  {(boss.type === "teal" || boss.type === "gold") && state !== "cooldown" && (
                    <button
                      type="button"
                      disabled={!currentUser || reportingId === boss.id}
                      onClick={async () => {
                        if (!currentUser) return;
                        setReportingId(boss.id);
                        try {
                          await onReportKill(boss.id, boss.name, boss.floor);
                        } finally {
                          setReportingId(null);
                        }
                      }}
                      className="rounded-xl border border-emerald-500/80 bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {reportingId === boss.id ? "Reporting..." : currentUser ? "Report Kill" : "Login required"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mirage View ───────────────────────────────────────────────────────────

function MirageView({
	  userId,
	  subscribedBossIds,
	  onBellToggle,
	}: {
	  userId: string | null;
	  subscribedBossIds: Set<string>;
	  onBellToggle: (bossId: string, newState: boolean) => void;
	}) {
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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
        {filtered.map((boss: MirageBoss, index) => {
          const nextSpawn = getNextSpawnFromTimes(boss.spawnTimes);
          return (
            <div
              key={boss.id}
              className="@container/card glass-card rounded-2xl overflow-hidden"
              style={{ position: "relative", animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(nextSpawn), zIndex: 1 }} />
              {/* Compact row */}
              <div className="flex @[700px]/app:hidden items-center gap-2 px-3 py-2.5">
                <BellToggle
                  bossId={boss.id}
                  userId={userId}
                  initialSubscribed={subscribedBossIds.has(boss.id)}
                  onToggle={onBellToggle}
                />
                <span className="font-semibold text-xs flex-1">{boss.name}</span>
                <span className="text-[10px] text-zinc-500">{boss.location}</span>
                <CountdownBadge nextSpawn={nextSpawn} />
              </div>
              {/* Full card */}
              <div className="hidden @[700px]/app:flex flex-col">
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
                  <div className="relative h-24 overflow-hidden">
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
                  <div className="flex items-center gap-2 px-3 @[480px]/app:px-4 pt-3 @[480px]/app:pt-4">
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

                <div className="px-3 @[480px]/app:px-4 pb-3 @[480px]/app:pb-4 pt-2 @[480px]/app:pt-3">
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
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 gap-2"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600">
                        Next Spawn
                      </span>
                      <CountdownBadge nextSpawn={nextSpawn} size="lg" />
                    </div>
                    <BellToggle
                      bossId={boss.id}
                      userId={userId}
                      initialSubscribed={subscribedBossIds.has(boss.id)}
                      onToggle={onBellToggle}
                    />
                  </div>
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
  subscribedBossIds,
  onBellToggle,
}: {
  dynamicTimers: DynamicTimerMap;
  currentUser: { id: string; username: string; avatarUrl?: string | null } | null;
  onReportKill: (bossId: string, bossName: string, floor: number) => Promise<void>;
  subscribedBossIds: Set<string>;
  onBellToggle: (bossId: string, newState: boolean) => void;
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
      "@container/card relative overflow-hidden rounded-2xl border p-2 @[480px]/app:p-3 backdrop-blur-sm transition-all flex flex-col gap-2";
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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
        {floorBosses.map((boss, index) => {
          const nextSpawn = getNextSpawnForBoss(boss);
          const state = getState(boss);
          const canReport =
            boss.type === "chamber1" || boss.type === "chamber2";

          return (
            <div key={boss.id} className={cardClasses(boss, state)} style={{ animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(nextSpawn ?? null) }} />
              {/* Compact row */}
              <div className="flex @[700px]/app:hidden items-center gap-2 flex-1">
                <BellToggle
                  bossId={boss.id}
                  userId={currentUser ? currentUser.id : null}
                  initialSubscribed={subscribedBossIds.has(boss.id)}
                  onToggle={onBellToggle}
                />
                <span className="font-semibold text-xs flex-1">{boss.name}</span>
                <span className="text-[10px] text-zinc-500 uppercase">F{boss.floor}</span>
                <CountdownBadge nextSpawn={nextSpawn ?? null} />
                {canReport && currentUser && state !== "cooldown" && (
                  <button
                    type="button"
                    disabled={reportingId === boss.id}
                    onClick={async () => {
                      if (!currentUser) return;
                      setReportingId(boss.id);
                      try {
                        await onReportKill(boss.id, boss.name, boss.floor);
                      } finally {
                        setReportingId(null);
                      }
                    }}
                    className="rounded-md border border-emerald-500/80 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:opacity-40"
                    title="Report Kill"
                  >
                    ⚔️
                  </button>
                )}
              </div>
              {/* Full card */}
              <div className="hidden @[700px]/app:flex flex-col gap-2 flex-1">
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

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                      Next spawn
                    </span>
                    <CountdownBadge nextSpawn={nextSpawn ?? null} size="lg" />
                  </div>
                  <BellToggle
                    bossId={boss.id}
                    userId={currentUser ? currentUser.id : null}
                    initialSubscribed={subscribedBossIds.has(boss.id)}
                    onToggle={onBellToggle}
                  />
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── World Bosses View ────────────────────────────────────────────────────

function WorldBossesView({
	userId,
	subscribedBossIds,
	onBellToggle,
}: {
	userId: string | null;
	subscribedBossIds: Set<string>;
	onBellToggle: (bossId: string, newState: boolean) => void;
}) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Daily
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
          {DAILY_WORLD_BOSSES.map((boss, index) => (
            <div
              key={boss.id}
              className="@container/card relative overflow-hidden glass-card rounded-xl p-2 @[480px]/app:p-3"
              style={{ animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(getNextFixedSpawn(boss.spawnHoursUTC8)) }} />
              {/* Compact row */}
              <div className="flex @[700px]/app:hidden items-center gap-2 flex-1">
                <BellToggle
                  bossId={boss.id}
                  userId={userId}
                  initialSubscribed={subscribedBossIds.has(boss.id)}
                  onToggle={onBellToggle}
                />
                <span className="font-semibold text-xs flex-1">{boss.name}</span>
                <span className="text-[10px] text-zinc-500">{boss.zone}</span>
                <CountdownBadge nextSpawn={getNextFixedSpawn(boss.spawnHoursUTC8)} />
              </div>
              {/* Full card */}
              <div className="hidden @[700px]/app:flex flex-col gap-2 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
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
                <div className="flex flex-wrap gap-1.5">
                  {boss.spawnHoursUTC8.map((h) => (
                    <span
                      key={h}
                      className="rounded bg-zinc-800/80 px-2 py-0.5 text-[11px] font-mono text-zinc-300"
                    >
                      {String(h).padStart(2, "0")}:00
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <CountdownBadge nextSpawn={getNextFixedSpawn(boss.spawnHoursUTC8)} size="lg" />
                  <BellToggle
                    bossId={boss.id}
                    userId={userId}
                    initialSubscribed={subscribedBossIds.has(boss.id)}
                    onToggle={onBellToggle}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Weekly
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
          {WEEKLY_WORLD_BOSSES.map((boss, index) => (
            <div
              key={boss.id}
              className="@container/card relative overflow-hidden glass-card rounded-xl p-2 @[480px]/app:p-3"
              style={{ animation: "fadeInUp 0.25s ease both", animationDelay: `${Math.min(index * 40, 200)}ms` }}
            >
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, borderRadius: "12px 0 0 12px", background: accentColor(getNextWeeklySpawn(boss.dayOfWeek, boss.spawnHourUTC8)) }} />
              {/* Compact row */}
              <div className="flex @[700px]/app:hidden items-center gap-2 flex-1">
                <BellToggle
                  bossId={boss.id}
                  userId={userId}
                  initialSubscribed={subscribedBossIds.has(boss.id)}
                  onToggle={onBellToggle}
                />
                <span className="font-semibold text-xs flex-1">{boss.name}</span>
                <span className="text-[10px] text-zinc-500">{weekDays[boss.dayOfWeek]}</span>
                <CountdownBadge
                  nextSpawn={getNextWeeklySpawn(
                    boss.dayOfWeek,
                    boss.spawnHourUTC8
                  )}
                />
              </div>
              {/* Full card */}
              <div className="hidden @[700px]/app:flex flex-col gap-1 flex-1">
                <div className="mb-1 flex items-start justify-between gap-2">
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
                      size="lg"
                    />
                    <BellToggle
                      bossId={boss.id}
                      userId={userId}
                      initialSubscribed={subscribedBossIds.has(boss.id)}
                      onToggle={onBellToggle}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mining / Gathering Calculator View ────────────────────────────────────

function BoostSection({
  title,
  emoji,
  note,
  id,
}: {
  title: string;
  emoji: string;
  note: string;
  id: string;
}) {
  const [boost, setBoost] = useState(0);

  const secPerHit = 10 / (1 + boost / 100);
  const speedup = (10 / secPerHit).toFixed(2);
  const hitsPerMin = (60 / secPerHit).toFixed(1);

  return (
    <div
      className="rounded-2xl p-4 @[480px]/app:p-5"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(248,113,113,0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(59,130,246,0.16), transparent 55%), rgba(15,23,42,0.92)",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow:
          "0 18px 45px rgba(15,23,42,0.9), 0 0 0 1px rgba(15,23,42,1) inset",
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm"
            style={
              {
                borderColor: "rgba(248,113,113,0.7)",
                background:
                  "radial-gradient(circle at 30% 20%, rgba(248,113,113,0.5), transparent 60%), rgba(15,23,42,0.9)",
                boxShadow: "0 0 18px rgba(248,113,113,0.55)",
              }
            }
          >
            <span>{emoji}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Boost calculator
            </span>
            <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          </div>
        </div>
      </div>

      {/* Boost input */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={1000}
          step={0.1}
          value={Math.min(boost, 1000)}
          onChange={(e) => setBoost(parseFloat(e.target.value))}
          className="h-1.5 flex-1 appearance-none rounded-full bg-zinc-700 accent-red-500"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            step={0.1}
            value={boost}
            onChange={(e) =>
              setBoost(Math.max(0, parseFloat(e.target.value) || 0))
            }
            className="w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-right text-sm text-zinc-100 outline-none focus:border-red-500/60"
          />
          <span className="text-sm text-zinc-500">%</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Sec / hit", value: secPerHit.toFixed(2), unit: "sec" },
          { label: "Speedup", value: `${speedup}×`, unit: "faster" },
          { label: "Hits / min", value: hitsPerMin, unit: "hits/min" },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"
            style={{
              background:
                "linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,64,175,0.35))",
              border: "1px solid rgba(148,163,184,0.45)",
            }}
          >
            <p className="mb-1 text-[11px] text-zinc-500">{label}</p>
            <p className="font-mono text-lg font-semibold text-zinc-50">
              {value}
            </p>
            <p className="text-[11px] text-zinc-500">{unit}</p>
          </div>
        ))}
      </div>

      {/* Mining-only: node table + DS/hour */}
      {id === "mining" && <MiningNodeTable secPerHit={secPerHit} />}

      <p className="mt-3 text-[11px] text-zinc-600">{note}</p>
    </div>
  );
}

const MINING_NODES = [
  { color: "Green", dotColor: "#22c55e", hp: 50, dsPerHit: 60 },
  { color: "Blue", dotColor: "#3b82f6", hp: 75, dsPerHit: 100 },
  { color: "Red", dotColor: "#ef4444", hp: 100, dsPerHit: 150 },
  { color: "Gold", dotColor: "#eab308", hp: 125, dsPerHit: 300 },
];

function MiningNodeTable({ secPerHit }: { secPerHit: number }) {
  return (
    <>
      <p className="mb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        Magic Square / Secret Peak — F1
      </p>
      <div className="mb-1 grid grid-cols-5 gap-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
        <span>Color</span>
        <span className="text-right">Hits</span>
        <span className="text-right">DS/hit</span>
        <span className="text-right">Time</span>
        <span className="text-right">DS/node</span>
      </div>
      {MINING_NODES.map((n) => {
        const totalSec = n.hp * secPerHit;
        const timeLabel =
          totalSec >= 60 ? `${(totalSec / 60).toFixed(2)}m` : `${totalSec.toFixed(1)}s`;
        return (
          <div
            key={n.color}
            className="grid grid-cols-5 gap-1 border-b border-zinc-800/60 px-1 py-1.5 text-xs"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ background: n.dotColor }}
              />
              {n.color}
            </span>
            <span className="text-right text-zinc-400">{n.hp}</span>
            <span className="text-right text-zinc-400">{n.dsPerHit}</span>
            <span className="text-right text-zinc-300">{timeLabel}</span>
            <span className="text-right text-zinc-300">
              {(n.hp * n.dsPerHit).toLocaleString()}
            </span>
          </div>
        );
      })}

      {/* DS/hour row */}
      <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        DS per hour (F1, no breaks)
      </p>
      <div className="grid grid-cols-4 gap-2">
        {MINING_NODES.map((n) => {
          const totalSec = n.hp * secPerHit;
          const dsPerHour = Math.round(((n.hp * n.dsPerHit) / totalSec) * 3600);
          return (
            <div
              key={n.color}
              className="rounded-lg p-2 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p className="text-[11px] font-semibold" style={{ color: n.dotColor }}>
                {n.color}
              </p>
              <p className="text-sm font-semibold text-zinc-100">
                {dsPerHour.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-600">DS/hr</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

function MiningCalculatorView() {
  type BoostId = "mining" | "gathering" | "energy";

  const [activeBoost, setActiveBoost] = useState<BoostId>("mining");

  const config: Record<BoostId, { title: string; emoji: string; note: string }> = {
    mining: {
      title: "Mining Boost",
      emoji: "⛏️",
      note:
        "Formula: 10 / (1 + boost/100) sec/hit — MIR4 Wiki. Roughly +10% DS for each higher floor.",
    },
    gathering: {
      title: "Gathering Boost",
      emoji: "🌿",
      note:
        "Same formula as Mining. Base is 10 sec per gather. Verify in game at 0%.",
    },
    energy: {
      title: "Energy Gathering Boost",
      emoji: "⚡",
      note:
        "May affect the amount of energy rather than speed. Numbers are approximate — verify in game.",
    },
  };

  const segments: { id: BoostId; label: string; emoji: string }[] = [
    { id: "mining", label: "Mining", emoji: "⛏️" },
    { id: "gathering", label: "Gathering", emoji: "🌿" },
    { id: "energy", label: "Energy", emoji: "⚡" },
  ];

  const current = config[activeBoost];

  return (
    <div className="flex flex-col gap-4 p-3 @[480px]/app:p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Calculator
          </span>
        </div>
        <div className="inline-flex rounded-full border border-zinc-700/70 bg-zinc-900/80 p-1 text-xs">
          {segments.map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setActiveBoost(seg.id)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium transition-all ${
                activeBoost === seg.id
                  ? "bg-zinc-100 text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <span>{seg.emoji}</span>
              <span>{seg.label}</span>
            </button>
          ))}
        </div>
      </div>

      <BoostSection
        id={activeBoost}
        title={current.title}
        emoji={current.emoji}
        note={current.note}
      />
    </div>
  );
}

// ─── SVG Icons ──────────────────────────────────────────────────────────

function SwordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.5 2.5l7 7-10 10-2-2 8-8-5-5-8 8-2-2 10-10zM3 17l1.5 1.5L3 20l1 1-3 1 1-3 1-1z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.028.015.057.03.07a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

function CraftingIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 4l4 4-8 8-2-2 6-6-2-2-6 6-2-2 8-8zM2 20l1-3 2 2-3 1z" />
    </svg>
  );
}

function PotentialIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L4.09 12.97 11 13l-2 9L20 11h-7l2-9z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L4 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-10-3z" />
    </svg>
  );
}

function InnerForceIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15v-4l4 2-4 2zm0-6V7l4 2-4 2z" />
    </svg>
  );
}

function WarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm4 13.59L14.59 17 12 14.41 9.41 17 8 15.59 10.59 13 8 10.41 9.41 9 12 11.59 14.59 9 16 10.41 13.41 13 16 15.59z" />
    </svg>
  );
}

// ─── HeroButton ───────────────────────────────────────────────────────────

interface HeroButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  glowColor: string;
}

function HeroButton({ icon, label, onClick, color, glowColor }: HeroButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0, shine: 60 });
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({ rotX: -ny * 12, rotY: nx * 18, shine: nx * 30 + 60 });
  };

  const handleMouseLeave = () => {
    setTilt({ rotX: 0, rotY: 0, shine: 60 });
    setHovered(false);
    setPressed(false);
  };

  const scale = pressed ? 0.94 : hovered ? 1.06 : 1;

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHovered(true)}
    >
      <div
        style={{
          position: "absolute",
          bottom: -8,
          left: "10%",
          width: "80%",
          height: 8,
          background: glowColor,
          filter: "blur(10px)",
          borderRadius: "50%",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
        }}
      />
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 20px",
          fontSize: "0.82rem",
          fontWeight: 700,
          letterSpacing: "0.03em",
          fontFamily: "inherit",
          cursor: "pointer",
          borderRadius: 14,
          border: `1px solid ${color}40`,
          background: `linear-gradient(135deg, ${color}22 0%, ${color}0a 100%)`,
          color,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          position: "relative",
          overflow: "hidden",
          transform: `perspective(600px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) scale(${scale})`,
          transition: "transform 0.15s ease, box-shadow 0.2s ease",
          boxShadow: hovered
            ? `0 0 24px ${glowColor}, inset 0 1px 0 ${color}60`
            : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: `${tilt.shine - 20}%`,
              width: "40%",
              height: "200%",
              background: "linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)",
              opacity: hovered ? 0.18 : 0.08,
              transform: "skewX(-15deg)",
              transition: "left 0.1s ease, opacity 0.2s ease",
            }}
          />
        </div>
        {icon}
        {label}
      </button>
    </div>
  );
}

// ─── TabBtn ────────────────────────────────────────────────────────────

interface TabBtnProps {
  id: Tab;
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabBtn({ id, label, active, onClick }: TabBtnProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <button
      data-tab-id={id}
      type="button"
      draggable={false}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      className={[
        "-mb-px shrink-0 border-b-2 px-3.5 py-2 text-[11px] font-semibold whitespace-nowrap",
        active
          ? "border-red-500 text-zinc-100"
          : "border-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-300",
      ].join(" ")}
      style={{
        position: "relative",
        overflow: "hidden",
        transform: `scale(${pressed ? 0.95 : hovered ? 1.05 : 1})`,
        transition: "transform 0.15s ease, color 0.15s ease",
        filter: active ? "drop-shadow(0 2px 6px rgba(239,68,68,0.6))" : undefined,
        textShadow: active ? "0 0 12px rgba(239,68,68,0.5)" : undefined,
      }}
    >
      {hovered && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      )}
      {label}
    </button>
  );
}

// ─── NavPill ────────────────────────────────────────────────────────────

interface NavPillProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  hidden?: boolean;
}

function NavPill({ href, icon, label, color, hidden: isHidden }: NavPillProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0, shine: 50 });
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <div
      className="ml-1 shrink-0"
      style={{ position: "relative", display: isHidden ? "none" : "inline-flex" }}
      onMouseMove={(e) => {
        const rect = linkRef.current?.getBoundingClientRect();
        if (!rect) return;
        const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        setTilt({ rotX: -ny * 8, rotY: nx * 12, shine: nx * 30 + 50 });
      }}
      onMouseLeave={() => { setTilt({ rotX: 0, rotY: 0, shine: 50 }); setHovered(false); setPressed(false); }}
      onMouseEnter={() => setHovered(true)}
    >
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: "10%",
          width: "80%",
          height: 6,
          background: color,
          opacity: hovered ? 0.5 : 0,
          filter: "blur(8px)",
          borderRadius: "50%",
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
        }}
      />
      <a
        ref={linkRef}
        href={href}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        className="flex items-center gap-1 rounded-full border px-2 @[600px]/app:px-3 py-1 text-[11px] font-semibold"
        style={{
          color,
          borderColor: `${color}59`,
          background: `${color}1e`,
          position: "relative",
          overflow: "hidden",
          textDecoration: "none",
          transform: `perspective(400px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) scale(${pressed ? 0.93 : hovered ? 1.07 : 1})`,
          transition: "transform 0.15s ease, box-shadow 0.2s ease",
          boxShadow: hovered ? `0 0 16px ${color}80, inset 0 1px 0 ${color}60` : "none",
        }}
      >
        <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: `${tilt.shine - 15}%`,
              width: "30%",
              height: "200%",
              background: "linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)",
              opacity: hovered ? 0.15 : 0.06,
              transform: "skewX(-15deg)",
              transition: "left 0.1s ease, opacity 0.2s ease",
            }}
          />
        </div>
        {icon}
        <span className="hidden @[500px]/app:inline">{label}</span>
      </a>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────---

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("world_bosses");
  const [currentUser, setCurrentUser] = useState<
    { id: string; username: string; avatarUrl?: string | null } | null
  >(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const [unauthorizedServer, setUnauthorizedServer] = useState(false);
  const [copied, setCopied] = useState(false);
  const ALLOWED_GUILD = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID ?? "";
  const [dynamicTimers, setDynamicTimers] = useState<DynamicTimerMap>({});
  const [subscribedBossIds, setSubscribedBossIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [discordAuthDone, setDiscordAuthDone] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [reminderLabel, setReminderLabel] = useState("");
  const [reminderNote, setReminderNote] = useState("");
  const [reminderMode, setReminderMode] = useState<"minutes" | "time">("minutes");
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [reminderTime, setReminderTime] = useState("");
  const [reminderSaving, setReminderSaving] = useState(false);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [guildMembers, setGuildMembers] = useState<{ id: string; displayName: string; avatarUrl: string | null }[]>([]);
  const [mentionSearch, setMentionSearch] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<DiscordSDKWithCommands | null>(null);
  const isDragging = useRef(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  useEffect(() => {
    if (!reminderModal) return;
    fetch("/api/guild-members")
      .then((r) => r.json())
      .then((data) => setGuildMembers(data as Array<{ id: string; displayName: string; avatarUrl: string | null }>))
      .catch(() => {});
  }, [reminderModal]);

  useEffect(() => {
    if (!tabsRef.current) return;
    const activeBtn = tabsRef.current.querySelector(
      `[data-tab-id="${activeTab}"]`
    ) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeTab]);

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
        sdkRef.current = sdk as DiscordSDKWithCommands;

        if (mounted) {
          setSdkReady(true);
          if (!savedUsername) {
            setSdkError(false);
          }
        }

        // Full Discord OAuth for real user ID and guild nickname
        try {
          const discordSdk = sdk as DiscordSDKWithCommands;
          console.log("[OAuth] Starting Discord OAuth flow...");

          // Step 1: Try reusing saved access_token from localStorage
          let auth: { user?: { id?: string; username?: string; global_name?: string | null } } | null = null;
          let accessToken: string | null = localStorage.getItem("mir4_discord_access_token");

          if (accessToken) {
            try {
              auth = await discordSdk.commands.authenticate({ access_token: accessToken });
              console.log("[OAuth] reused cached token, user:", auth?.user?.id ?? "none");
            } catch (reuseErr) {
              console.log("[OAuth] cached token expired or invalid, doing full flow:", reuseErr);
              localStorage.removeItem("mir4_discord_access_token");
              accessToken = null;
              auth = null;
            }
          }

          // Step 2: If no valid cached token — do full authorize + token exchange
          if (!auth?.user?.id) {
            let code: string;
            try {
              const authorizeRes = await discordSdk.commands.authorize({
                client_id: clientId,
                response_type: "code",
                state: "",
                scope: ["identify"],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any);
              code = authorizeRes.code;
              console.log("[OAuth] authorize() returned code:", code ? "yes" : "no");
            } catch (authorizeErr) {
              console.error("[OAuth] authorize() FAILED:", authorizeErr);
              throw new Error("authorize_failed");
            }

            const tokenRes = await fetch("/api/token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code }),
            });

            const tokenData = (await tokenRes.json()) as {
              access_token?: string;
              error?: string;
            };
            console.log("[OAuth] /api/token response:", tokenRes.status, tokenData.error ?? "ok");

            const newToken = tokenData.access_token;
            if (!tokenRes.ok || !newToken) {
              throw new Error("token_exchange_failed: " + (tokenData.error ?? String(tokenRes.status)));
            }

            accessToken = newToken;

            // Save token to localStorage — skip popup on next Activity open
            localStorage.setItem("mir4_discord_access_token", accessToken);

            try {
              auth = await discordSdk.commands.authenticate({
                access_token: accessToken,
              });
              console.log("[OAuth] authenticate(token) returned user:", auth?.user?.id ?? "no user");
            } catch (authErr) {
              console.error("[OAuth] authenticate() FAILED:", authErr);
              throw new Error("authenticate_failed");
            }
          }

          const user = auth?.user;
          if (!user?.id) {
            throw new Error("no_user_after_auth");
          }

          let displayName = user?.global_name ?? user?.username ?? "unknown";
          let avatarUrl: string | null = null;
          console.log("[OAuth] User from Discord:", user.id, displayName);

          // Step 3: Get nick and avatar via bot token (no user consent)
          try {
            const guildId = (discordSdk as unknown as { guildId?: string }).guildId;
            console.log("[OAuth] guildId:", guildId ?? "none");
            if (guildId && ALLOWED_GUILD && guildId !== ALLOWED_GUILD) {
              setUnauthorizedServer(true);
              return;
            }
            if (guildId) {
              const memberRes = await fetch(
                `/api/guild-member?userId=${user.id}&guildId=${guildId}`,
              );
              console.log("[OAuth] /api/guild-member response:", memberRes.status);
              if (memberRes.ok) {
                const member = (await memberRes.json()) as {
                  nick?: string | null;
                  globalName?: string | null;
                  avatarUrl?: string | null;
                };
                console.log("[OAuth] member data:", member);
                if (member?.nick) {
                  displayName = member.nick;
                } else if (member?.globalName) {
                  displayName = member.globalName;
                }
                if (member?.avatarUrl) {
                  avatarUrl = member.avatarUrl;
                }
              } else {
                console.error("[OAuth] /api/guild-member failed:", memberRes.status, await memberRes.text());
              }
            }
          } catch (memberErr) {
            console.error("[OAuth] guild-member fetch error:", memberErr);
          }

          if (mounted) {
            setCurrentUser({ id: user.id, username: displayName, avatarUrl });
            setDiscordAuthDone(true);
            localStorage.setItem("mir4_username", displayName);
            localStorage.setItem("mir4_user_id", user.id);
            console.log("[OAuth] User set successfully:", displayName, user.id);

            // Silently track user — fire-and-forget, no UI blocking
            fetch("/api/track-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ discord_id: user.id, username: displayName }),
            }).catch(() => {});
          }
        } catch (err) {
          console.error("[OAuth] Overall OAuth flow failed:", err);
          // OAuth failed — fall back to manual name prompt
          if (mounted && !savedUsername) {
            setSdkError(true);
          }
        }
      } catch (outerErr) {
        console.error("[OAuth] Discord SDK init failed:", outerErr);
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

  useEffect(() => {
    if (!currentUser?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSubscribedBossIds(new Set());
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/reminders?user_id=${currentUser.id}`);
        if (!res.ok) return;
        const data = (await res.json()) as string[];
        if (!cancelled) {
          setSubscribedBossIds(new Set(data));
        }
      } catch {
        // silent
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const handleBellToggle = useCallback(
    (bossId: string, newState: boolean) => {
      setSubscribedBossIds((prev) => {
        const next = new Set(prev);
        if (newState) {
          next.add(bossId);
        } else {
          next.delete(bossId);
        }
        return next;
      });
    },
    [],
  );

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

  // Show name prompt if SDK initialized but no user yet and Discord auth not done
  useEffect(() => {
    if (!currentUser && (sdkReady || sdkError) && !discordAuthDone) {
      const timer = setTimeout(() => {
        if (!currentUser) setShowNamePrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [sdkReady, sdkError, currentUser, discordAuthDone]);

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
    { id: "square_11", label: "Square 11" },
    { id: "dragon_tower", label: "Dragon Tower" },
    { id: "event_mirage", label: "Event Mirage" },
    { id: "purgatory", label: "Purgatory" },
    { id: "server", label: "Server" },
    { id: "calculator", label: "⛏ Calculator" },
  ];

  if (unauthorizedServer) {
    return (
      <div style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #060810 0%, #0d1117 100%)",
        padding: "32px 24px",
        textAlign: "center",
        gap: 0,
      }}>
        {/* Lock icon */}
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>

        {/* Title */}
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
          MIR4 Boss Tracker
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 32, maxWidth: 260, lineHeight: 1.6 }}>
          This app is private and available for selected servers only.
        </p>

        {/* Contact button */}
        <button
          onClick={() => {
            const url = "https://discord.com/users/992543055188078693";
            if (sdkRef.current) {
              (sdkRef.current as DiscordSDKWithCommands).commands
                .openExternalLink({ url })
                .catch(() => window.open(url, "_blank", "noopener,noreferrer"));
            } else {
              window.open(url, "_blank", "noopener,noreferrer");
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "linear-gradient(135deg, #5865F2, #4752c4)",
            border: "none",
            borderRadius: 12,
            padding: "12px 24px",
            color: "white",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            marginBottom: 24,
            boxShadow: "0 4px 20px rgba(88,101,242,0.4)",
          }}
        >
          💬 Contact TOTORO on Discord
        </button>

        {/* Donate */}
        <p style={{ fontSize: 10, color: "#334155", marginBottom: 6 }}>
          Want to support the project?
        </p>
        <p
          onClick={() => {
            navigator.clipboard?.writeText("TB5V2sNE5GXFnvUmqtpYgKctQJyWrwkiV5");
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          style={{
            fontSize: 10,
            color: copied ? "#22c55e" : "#475569",
            fontFamily: "monospace",
            cursor: "pointer",
            letterSpacing: "0.02em",
            wordBreak: "break-all",
            maxWidth: 280,
          }}
          title="Click to copy"
        >
          {copied ? "✓ Copied!" : "💛 USDT TRC-20: TB5V2sNE5GXFnvUmqtpYgKctQJyWrwkiV5"}
        </p>
      </div>
    );
  }

  return (
    <div className="@container/app flex h-screen flex-col text-zinc-100 antialiased">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-y-auto">
        <div style={{ position: "relative", height: 220, overflow: "hidden", flexShrink: 0 }}>
          <video
            autoPlay
            muted
            loop
            playsInline
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
          >
            <source src="/bg-loop.webm" type="video/webm" />
          </video>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(6,8,16,0.5) 100%)" }} />
          <div style={{ position: "relative", zIndex: 2, padding: "16px 16px 8px" }}>
            <header className="flex items-center justify-between gap-2">
              <div className="shrink-0 flex flex-col gap-0">
                <h1 className="font-bold tracking-tight text-zinc-100" style={{ fontSize: "1.4rem" }}>
                  MIR4 Boss Tracker
                </h1>
                <span
                  className="hidden @[400px]/app:inline text-[10px] leading-tight"
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.8)",
                  }}
                >
                  built for guilds · by devilren (AKA TOTORO)
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10, alignItems: "flex-start" }}>
                  <HeroButton
                    icon={<SwordIcon />}
                    label="Play MIR4 DreamScape"
                    color="#d4a017"
                    glowColor="rgba(212,160,23,0.5)"
                    onClick={() => {
                      const url = "https://dreamscapemir.com/#/signup?d=33";
                      if (sdkRef.current) {
                        sdkRef.current.commands.openExternalLink({ url }).catch(() => {
                          window.open(url, "_blank", "noopener,noreferrer");
                        });
                      } else {
                        window.open(url, "_blank", "noopener,noreferrer");
                      }
                    }}
                  />
                  <HeroButton
                    icon={<DiscordIcon />}
                    label="Official Discord"
                    color="#5865F2"
                    glowColor="rgba(88,101,242,0.5)"
                    onClick={() => {
                      const url = "https://discord.gg/officialdreamscape";
                      if (sdkRef.current) {
                        sdkRef.current.commands.openExternalLink({ url }).catch(() => {
                          window.open(url, "_blank", "noopener,noreferrer");
                        });
                      } else {
                        window.open(url, "_blank", "noopener,noreferrer");
                      }
                    }}
                  />
                  {currentUser && (
                    <HeroButton
                      icon={<BellIcon />}
                      label="Remind me"
                      color="#22c55e"
                      glowColor="rgba(34,197,94,0.5)"
                      onClick={() => setReminderModal(true)}
                    />
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="hidden @[500px]/app:block">
                    <ServerClock />
                  </span>
                  {currentUser ? (
                    <>
                      {currentUser.avatarUrl && (
                        <img
                          src={currentUser.avatarUrl}
                          alt=""
                          className="shrink-0 rounded-full object-cover"
                          style={{
                            width: 28,
                            height: 28,
                            marginRight: 6,
                          }}
                        />
                      )}
                      <span
                        className="max-w-[120px] truncate text-xs"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "20px",
                          padding: "2px 8px",
                          color: "#94a3b8",
                        }}
                      >
                        {currentUser.username}
                      </span>
                      {!discordAuthDone && (
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
                          className="shrink-0 text-[10px] text-zinc-600 transition-colors hover:text-zinc-400"
                        >
                          change
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowNamePrompt(true)}
                      className="shrink-0 text-xs text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-300"
                    >
                      {sdkError ? "Login (web mode)" : "Login"}
                    </button>
                  )}
                </div>
                <div style={{
                  textAlign: "right",
                  background: "rgba(0,0,0,0.45)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <p
                    onClick={() => {
                      navigator.clipboard?.writeText("TB5V2sNE5GXFnvUmqtpYgKctQJyWrwkiV5");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    title="Click to copy USDT TRC-20"
                    style={{ fontSize: 9, color: "rgba(255,220,80,0.85)", fontFamily: "monospace",
                      cursor: "pointer", marginBottom: 2, userSelect: "none" }}
                  >
                    {copied ? "✓ Copied!" : "💛 Donate USDT TRC-20"}
                  </p>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
                    Want this for your server?{" "}
                    <span
                      onClick={() => {
                        const url = "https://discord.com/users/992543055188078693";
                        if (sdkRef.current) {
                          sdkRef.current.commands.openExternalLink({ url })
                            .catch(() => window.open(url, "_blank", "noopener,noreferrer"));
                        } else {
                          window.open(url, "_blank", "noopener,noreferrer");
                        }
                      }}
                      style={{ color: "rgba(120,200,255,0.9)", cursor: "pointer",
                        textDecoration: "underline", textDecorationColor: "rgba(100,180,255,0.25)" }}
                    >
                      Contact me
                    </span>
                  </p>
                </div>
              </div>
            </header>
          </div>
        </div>

        <div style={{ position: "relative", flex: 1 }}>
          {/* Content video background */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.40 }}
            >
              <source src="/bg-primal.webm" type="video/webm" />
            </video>
            <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(6,8,16,0.45) 0%, rgba(6,8,16,0.2) 40%, rgba(6,8,16,0.45) 100%)" }} />
          </div>

          {/* Tab bar — always visible, drag-to-scroll */}
        <div className="flex items-center gap-1" style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(6,8,16,0.85)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingTop: 6, paddingBottom: 6, paddingLeft: 4, paddingRight: 4 }}>
          <button
            type="button"
            onClick={() => tabsRef.current?.scrollBy({ left: -160, behavior: "smooth" })}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              color: "#71717a",
              cursor: "pointer",
              fontSize: 12,
              padding: "1px 5px",
              flexShrink: 0,
              lineHeight: 1,
            }}
          >‹</button>
          <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
              maskImage: "linear-gradient(to right, transparent, black 28px, black calc(100% - 28px), transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 28px, black calc(100% - 28px), transparent)",
            }} />
            <nav
              ref={tabsRef}
              className="tabs-scroll flex gap-0 overflow-x-auto border-b border-zinc-800/50"
              style={{
                flexWrap: "nowrap",
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
                userSelect: "none",
                cursor: isGrabbing ? "grabbing" : "grab",
              }}
              onMouseDown={(e) => {
                isDragging.current = true;
                setIsGrabbing(true);
                dragStartX.current = e.pageX - (tabsRef.current?.offsetLeft ?? 0);
                dragScrollLeft.current = tabsRef.current?.scrollLeft ?? 0;
              }}
              onMouseMove={(e) => {
                if (!isDragging.current || !tabsRef.current) return;
                e.preventDefault();
                const x = e.pageX - tabsRef.current.offsetLeft;
                tabsRef.current.scrollLeft = dragScrollLeft.current - (x - dragStartX.current);
              }}
              onMouseUp={() => {
                isDragging.current = false;
                setIsGrabbing(false);
              }}
              onMouseLeave={() => {
                isDragging.current = false;
                setIsGrabbing(false);
              }}
            >
              {tabs.map((tab) => (
                <TabBtn
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>
          </div>
          <button
            type="button"
            onClick={() => tabsRef.current?.scrollBy({ left: 160, behavior: "smooth" })}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              color: "#71717a",
              cursor: "pointer",
              fontSize: 12,
              padding: "1px 5px",
              flexShrink: 0,
              lineHeight: 1,
            }}
          >›</button>
          <NavPill href="/crafting" icon={<CraftingIcon />} label="Crafting" color="#f59e0b" />
          <NavPill href="/potential" icon={<PotentialIcon />} label="Potential" color="#06b6d4" />
          <NavPill href="/primal-force" icon={<SwordIcon />} label="Primal Force" color="#f97316" />
          <NavPill href="/constitution" icon={<ShieldIcon />} label="Constitution" color="#34d399" hidden />
          <NavPill href="/inner-force" icon={<InnerForceIcon />} label="Inner Force" color="#8b5cf6" hidden />
          <NavPill href="/war" icon={<WarIcon />} label="WAR BOARD" color="#ef4444" />
        </div>

        <section className="p-2 @[480px]/app:p-4" style={{ position: "relative", zIndex: 2 }} suppressHydrationWarning>
          {activeTab === "secret_peak" && (
            <SecretPeakView
              dynamicTimers={dynamicTimers}
              currentUser={currentUser}
              onReportKill={handleReportKill}
              subscribedBossIds={subscribedBossIds}
              onBellToggle={handleBellToggle}
            />
          )}
          {activeTab === "magic_square" && (
            <MagicSquareView
              dynamicTimers={dynamicTimers}
              currentUser={currentUser}
              onReportKill={handleReportKill}
              subscribedBossIds={subscribedBossIds}
              onBellToggle={handleBellToggle}
            />
          )}
          {activeTab === "mirage" && (
            <MirageView
              userId={currentUser?.id ?? null}
              subscribedBossIds={subscribedBossIds}
              onBellToggle={handleBellToggle}
            />
          )}
          {activeTab === "world_bosses" && (
            <WorldBossesView
              userId={currentUser?.id ?? null}
              subscribedBossIds={subscribedBossIds}
              onBellToggle={handleBellToggle}
            />
          )}
          {activeTab === "square_11" && (
            <Square11View
              userId={currentUser?.id ?? null}
              subscribedBossIds={subscribedBossIds}
              onBellToggle={handleBellToggle}
            />
          )}
          {activeTab === "dragon_tower" && (
            <DragonTowerView
              userId={currentUser?.id ?? null}
              subscribedBossIds={subscribedBossIds}
              onBellToggle={handleBellToggle}
            />
          )}
          {activeTab === "event_mirage" && (
            <EventMirageView
              userId={currentUser?.id ?? null}
              subscribedBossIds={subscribedBossIds}
              onBellToggle={handleBellToggle}
            />
          )}
          {activeTab === "purgatory" && (
            <PurgatoryView
              userId={currentUser?.id ?? null}
              subscribedBossIds={subscribedBossIds}
              onBellToggle={handleBellToggle}
            />
          )}
          {activeTab === "server" && (
            <ServerView
              userId={currentUser?.id ?? null}
              subscribedBossIds={subscribedBossIds}
              onBellToggle={handleBellToggle}
            />
          )}
          {activeTab === "calculator" && <MiningCalculatorView />}
        </section>
        </div>
      </main>

      {/* Custom Reminder Modal */}
      {reminderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(3,7,17,0.85)", backdropFilter: "blur(16px)", overflowY: "auto", maxHeight: "100dvh" }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl mx-4 my-6"
            style={{
              background: "rgba(8,14,36,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 80px rgba(34,197,94,0.15), 0 32px 64px rgba(0,0,0,0.7)",
              marginBottom: 24,
            }}
          >
            {/* Header — outside scrollable body */}
            <div
              className="flex items-center gap-2.5"
              style={{ padding: "16px 16px 12px" }}
            >
              <svg width="28" height="28" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="rcBody" cx="38%" cy="32%" r="65%">
                    <stop offset="0%" stopColor="#ff7675" />
                    <stop offset="45%" stopColor="#d63031" />
                    <stop offset="100%" stopColor="#6b0000" />
                  </radialGradient>
                  <radialGradient id="rcShine" cx="30%" cy="28%" r="45%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                  <radialGradient id="rcMetal" cx="40%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#b2bec3" />
                    <stop offset="100%" stopColor="#2d3436" />
                  </radialGradient>
                </defs>
                <ellipse cx="25" cy="22" rx="9" ry="7" fill="url(#rcMetal)" transform="rotate(-35,25,22)" />
                <ellipse cx="85" cy="22" rx="9" ry="7" fill="url(#rcMetal)" transform="rotate(35,85,22)" />
                <line x1="31" y1="27" x2="43" y2="37" stroke="#888" strokeWidth="4" strokeLinecap="round" />
                <line x1="79" y1="27" x2="67" y2="37" stroke="#888" strokeWidth="4" strokeLinecap="round" />
                <circle cx="55" cy="62" r="42" fill="url(#rcBody)" />
                <circle cx="55" cy="62" r="42" fill="url(#rcShine)" />
                <circle cx="55" cy="62" r="42" stroke="rgba(255,150,150,0.4)" strokeWidth="1.5" fill="none" />
                <circle cx="55" cy="62" r="33" fill="rgba(0,0,0,0.25)" />
                <line x1="55" y1="31" x2="55" y2="37" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
                <line x1="55" y1="93" x2="55" y2="87" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
                <line x1="23" y1="62" x2="29" y2="62" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
                <line x1="87" y1="62" x2="81" y2="62" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
                <line x1="55" y1="62" x2="55" y2="41" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="55" y1="62" x2="71" y2="54" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="55" cy="62" r="4" fill="white" />
                <circle cx="55" cy="62" r="2" fill="#d63031" />
                <ellipse cx="38" cy="103" rx="8" ry="5" fill="url(#rcMetal)" transform="rotate(-15,38,103)" />
                <ellipse cx="72" cy="103" rx="8" ry="5" fill="url(#rcMetal)" transform="rotate(15,72,103)" />
              </svg>
              <span style={{ fontSize: 18, fontWeight: 700, color: "white" }}>Custom Reminder</span>
            </div>

            {/* Scrollable body */}
            <div style={{ overflowY: "auto", maxHeight: "50vh", padding: "0 16px 16px" }}>
              <input
                type="text"
                value={reminderLabel}
                onChange={(e) => setReminderLabel(e.target.value)}
                placeholder="Boss / event name"
                autoFocus
                className="mb-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
              />
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setReminderMode("minutes")}
                  className={`flex-1 rounded-xl border py-1.5 text-xs font-semibold transition-colors ${
                    reminderMode === "minutes"
                      ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300"
                      : "border-zinc-700 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  In X minutes
                </button>
                <button
                  type="button"
                  onClick={() => setReminderMode("time")}
                  className={`flex-1 rounded-xl border py-1.5 text-xs font-semibold transition-colors ${
                    reminderMode === "time"
                      ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300"
                      : "border-zinc-700 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  At time (UTC+8)
                </button>
              </div>
              {reminderMode === "minutes" ? (
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={reminderMinutes}
                  onChange={(e) => setReminderMinutes(Number(e.target.value))}
                  className="mb-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
                />
              ) : (
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="mb-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
                />
              )}
              <textarea
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                placeholder="Optional note..."
                rows={2}
                className="mb-3 w-full resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
              />
              {guildMembers.length > 0 && (
                <div className="mb-4">
                  <p className="mb-1.5 text-xs font-semibold text-zinc-400">Notify members:</p>

                  <div style={{ maxHeight: 220, overflowY: "auto", paddingRight: 2 }}>
                    {/* Zone 1 — selected (always visible) */}
                    {selectedMentions.length > 0 && (
                      <div
                        style={{
                          marginBottom: 8,
                          paddingBottom: 8,
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Selected:
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {selectedMentions.map((id) => {
                            const m = guildMembers.find((x) => x.id === id);
                            if (!m) return null;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setSelectedMentions((prev) => prev.filter((x) => x !== id))}
                                style={{
                                  padding: "4px 8px 4px 10px",
                                  borderRadius: 9999,
                                  fontSize: 12,
                                  fontFamily: "inherit",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  transition: "all 0.15s ease",
                                  background: "rgba(239,68,68,0.15)",
                                  border: "1px solid rgba(239,68,68,0.5)",
                                  color: "#ef4444",
                                }}
                              >
                                {m.displayName}
                                <span style={{ fontSize: 10, opacity: 0.7, lineHeight: 1 }}>×</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Zone 2 — all unselected, filterable */}
                    <input
                      type="text"
                      value={mentionSearch}
                      onChange={(e) => setMentionSearch(e.target.value)}
                      placeholder="Search member..."
                      className="mb-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-red-500/40"
                    />
                    {selectedMentions.length > 0 && (
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                        All members:
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      {guildMembers
                        .filter((m) => !selectedMentions.includes(m.id))
                        .filter((m) =>
                          mentionSearch.trim()
                            ? m.displayName.toLowerCase().includes(mentionSearch.toLowerCase())
                            : true
                        )
                        .map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setSelectedMentions((prev) => [...prev, m.id])}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 9999,
                              fontSize: 12,
                              fontFamily: "inherit",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.5)",
                            }}
                          >
                            {m.displayName}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer — buttons, outside scrollable body */}
            <div className="flex gap-2" style={{ padding: "0 16px 16px" }}>
              <button
                type="button"
                disabled={reminderSaving || !reminderLabel.trim()}
                onClick={async () => {
                  if (!currentUser) return;
                  setReminderSaving(true);
                  let fireAt: Date;
                  if (reminderMode === "minutes") {
                    fireAt = new Date(Date.now() + reminderMinutes * 60_000);
                  } else {
                    const [hStr, mStr] = reminderTime.split(":");
                    const h = parseInt(hStr ?? "0", 10);
                    const m = parseInt(mStr ?? "0", 10);
                    const nowUtc8 = new Date(Date.now() + 8 * 3600_000);
                    const y = nowUtc8.getUTCFullYear();
                    const mo = nowUtc8.getUTCMonth();
                    const d = nowUtc8.getUTCDate();
                    fireAt = new Date(Date.UTC(y, mo, d, h, m, 0) - 8 * 3600_000);
                    if (fireAt.getTime() <= Date.now()) {
                      fireAt = new Date(fireAt.getTime() + 24 * 3600_000);
                    }
                  }
                  await fetch("/api/custom-reminders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      user_id: currentUser.id,
                      label: reminderLabel.trim(),
                      note: reminderNote.trim() || undefined,
                      fire_at: fireAt.toISOString(),
                      mention_user_ids: selectedMentions,
                    }),
                  });
                  setReminderSaving(false);
                  setReminderModal(false);
                  setReminderLabel("");
                  setReminderNote("");
                  setReminderMode("minutes");
                  setReminderMinutes(30);
                  setReminderTime("");
                  setSelectedMentions([]);
                  setGuildMembers([]);
                  setMentionSearch("");
                }}
                className="flex-1 rounded-xl border border-emerald-500/80 bg-emerald-500/20 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {reminderSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReminderModal(false);
                  setReminderLabel("");
                  setReminderNote("");
                  setReminderMode("minutes");
                  setReminderMinutes(30);
                  setReminderTime("");
                  setSelectedMentions([]);
                  setGuildMembers([]);
                  setMentionSearch("");
                }}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Name Prompt Modal */}
      {showNamePrompt && !currentUser && !discordAuthDone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(3,7,17,0.85)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl mx-4"
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
