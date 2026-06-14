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
			<div
				className="grid gap-2"
				style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
			>
				{SQUARE_11_EVENTS.map((event) => (
					<div
						key={event.id}
						className="glass-card flex flex-col justify-between rounded-xl p-3"
					>
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
			<div
				className="grid gap-2"
				style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
			>
				{DRAGON_TOWER_EVENTS.map((event) => (
					<div
						key={event.id}
						className="glass-card flex flex-col justify-between rounded-xl p-3"
					>
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
			<div
				className="grid gap-2"
				style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
			>
				{EVENT_MIRAGE_EVENTS.map((event) => (
					<div
						key={event.id}
						className="glass-card flex flex-col justify-between rounded-xl p-3"
					>
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
			<div
				className="grid gap-2"
				style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
			>
				{PURGATORY_EVENTS.map((event) => (
					<div
						key={event.id}
						className="glass-card flex flex-col justify-between rounded-xl p-3"
					>
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
			<div
				className="grid gap-2"
				style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
			>
				{SERVER_EVENTS.map((event) => (
					<div
						key={event.id}
						className="glass-card flex flex-col justify-between rounded-xl p-3"
					>
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

  return (
    <button
      type="button"
      onClick={() => {
        void toggle();
      }}
      disabled={loading}
      title={subscribed ? "Отключить уведомление" : "Уведомить за 10 мин"}
      style={{
        background: "none",
        border: "none",
        cursor: loading ? "wait" : "pointer",
        fontSize: 16,
        opacity: loading ? 0.5 : 1,
        padding: "2px 4px",
      }}
    >
      {subscribed ? "🔔" : "🔕"}
    </button>
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
    "flex items-center justify-between rounded-xl px-3 py-2.5 glass-card";

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
                    if (!nextSpawn) {
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
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
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
              <div className="flex items-center gap-2">
                <CountdownBadge nextSpawn={nextSpawn ?? null} />
                {state === "cooldown" && (
                  <BellToggle
                    bossId={boss.id}
                    userId={currentUser ? currentUser.id : null}
                    initialSubscribed={subscribedBossIds.has(boss.id)}
                    onToggle={onBellToggle}
                  />
                )}
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

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
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
                    <CountdownBadge nextSpawn={nextSpawn} large />
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
      "rounded-2xl border p-3 backdrop-blur-sm transition-all flex flex-col gap-2";
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

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
      >
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

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                    Next spawn
                  </span>
                  <CountdownBadge nextSpawn={nextSpawn ?? null} />
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
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {DAILY_WORLD_BOSSES.map((boss) => (
            <div
              key={boss.id}
              className="glass-card rounded-xl p-3"
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
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                    Next spawn
                  </span>
                  <CountdownBadge nextSpawn={getNextFixedSpawn(boss.spawnHoursUTC8)} />
                </div>
                <BellToggle
                  bossId={boss.id}
                  userId={userId}
                  initialSubscribed={subscribedBossIds.has(boss.id)}
                  onToggle={onBellToggle}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Weekly
        </h3>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {WEEKLY_WORLD_BOSSES.map((boss) => (
            <div
              key={boss.id}
              className="glass-card rounded-xl p-3"
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
      className="rounded-2xl p-4 sm:p-5"
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
    <div className="flex flex-col gap-4 p-3 sm:p-5">
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

// ─── Main Page ─────────────────────────────────────────────────────────---

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("world_bosses");
  const [currentUser, setCurrentUser] = useState<
    { id: string; username: string; avatarUrl?: string | null } | null
  >(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const [dynamicTimers, setDynamicTimers] = useState<DynamicTimerMap>({});
  const [subscribedBossIds, setSubscribedBossIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [discordAuthDone, setDiscordAuthDone] = useState(false);

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

        if (mounted) {
          setSdkReady(true);
          if (!savedUsername) {
            setSdkError(false);
          }
        }

        // Full Discord OAuth for real user ID and guild nickname
        try {
          const discordSdk = sdk as DiscordSDKWithCommands;

          const { code } = await discordSdk.commands.authorize({
            client_id: clientId,
            response_type: "code",
            state: "",
            scope: ["identify"],
          });

          const tokenRes = await fetch("/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const tokenData = (await tokenRes.json()) as {
            access_token?: string;
          };
          const accessToken = tokenData.access_token;

          if (!tokenRes.ok || !accessToken) {
            throw new Error("token_exchange_failed");
          }

          const auth = await discordSdk.commands.authenticate({
            access_token: accessToken,
          });

          const user = auth?.user;
          let displayName = user?.global_name ?? user?.username ?? "unknown";
          let avatarUrl: string | null = null;

          // Get nick and avatar via bot token (no user consent)
          try {
            const guildId = (discordSdk as unknown as { guildId?: string }).guildId;
            if (guildId && user?.id) {
              const memberRes = await fetch(
                `/api/guild-member?userId=${user.id}&guildId=${guildId}`,
              );
              if (memberRes.ok) {
                const member = (await memberRes.json()) as {
                  nick?: string | null;
                  globalName?: string | null;
                  avatarUrl?: string | null;
                };
                if (member?.nick) {
                  displayName = member.nick;
                } else if (member?.globalName) {
                  displayName = member.globalName;
                }
                if (member?.avatarUrl) {
                  avatarUrl = member.avatarUrl;
                }
              }
            }
          } catch {
            // fallback
          }

          if (mounted && user?.id) {
            setCurrentUser({ id: user.id, username: displayName, avatarUrl });
            setDiscordAuthDone(true);
            localStorage.setItem("mir4_username", displayName);
            localStorage.setItem("mir4_user_id", user.id);
          }
        } catch {
          // OAuth failed — fall back to manual name prompt
          if (mounted && !savedUsername) {
            setSdkError(true);
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

  useEffect(() => {
    if (!currentUser?.id) {
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

  return (
    <div className="flex h-screen flex-col overflow-hidden text-zinc-100 antialiased">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden px-3 pt-3 sm:px-5">
        <header
          className="flex items-center justify-between gap-3 pb-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h1
            className="shrink-0 text-base font-bold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ⚔️ MIR4 Boss Tracker
          </h1>
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden sm:block">
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
        </header>

        <div className="flex items-center justify-between gap-2">
          <nav
            className="tabs-scroll flex gap-0 overflow-x-scroll border-b border-zinc-800/80"
            style={{
              overflowX: "scroll",
              flexWrap: "nowrap",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "-mb-px shrink-0 border-b-2 px-2 py-1 text-[11px] font-semibold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-red-500 text-zinc-100"
                    : "border-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-300",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <a
            href="/war"
            className="ml-2 flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold text-red-300 transition-colors hover:bg-red-500/25"
            style={{
              background: "rgba(239,68,68,0.15)",
              borderColor: "rgba(239,68,68,0.4)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={14}
              height={14}
              className="text-red-300"
            >
              <line x1={6} y1={6} x2={18} y2={18} stroke="currentColor" strokeWidth={2} />
              <line x1={18} y1={6} x2={6} y2={18} stroke="currentColor" strokeWidth={2} />
            </svg>
            <span>WAR BOARD</span>
          </a>
        </div>

        <section className="flex-1 overflow-y-auto pb-4" suppressHydrationWarning>
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
      </main>

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
