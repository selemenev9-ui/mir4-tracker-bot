"use client";

import { useEffect, useMemo, useState } from "react";
import { DiscordSDK } from "@discord/embedded-app-sdk";

type DiscordAuthenticateResponse = {
  access_token: string;
  scopes: string[];
  user: {
    id: string;
    username: string;
    avatar?: string | null;
  };
};

type BossRegion = "Secret Peak" | "Mirage" | "Valley" | "Labyrinth";

type BossLocationCard = {
  id: string;
  label: string;
  subtitle: string;
  region: BossRegion;
  accent: string;
};

type BossPinData = {
  id: string;
  bossName: string;
  locationLabel: string;
  region: BossRegion;
};

const bossLocationCards: BossLocationCard[] = [
  {
    id: "sp_f1",
    label: "Secret Peak · Floor 1",
    subtitle: "Entry-level bosses and warm-up rotations.",
    region: "Secret Peak",
    accent: "from-cyan-500/40 to-sky-500/10",
  },
  {
    id: "sp_f3",
    label: "Secret Peak · Floor 3",
    subtitle: "High-traffic farming and contested spawns.",
    region: "Secret Peak",
    accent: "from-sky-500/40 to-indigo-500/10",
  },
  {
    id: "mirage_blue",
    label: "Mirage · Blue Boss",
    subtitle: "Solo-friendly route, ideal for warm-up runs.",
    region: "Mirage",
    accent: "from-blue-500/40 to-slate-800/40",
  },
  {
    id: "mirage_red",
    label: "Mirage · Red Boss",
    subtitle: "High-risk, high-reward with PvP pressure.",
    region: "Mirage",
    accent: "from-red-500/50 to-rose-900/40",
  },
  {
    id: "valley_elite",
    label: "Valley · Elite Boss Ring",
    subtitle: "Guild-controlled rotations and elite bosses.",
    region: "Valley",
    accent: "from-emerald-500/40 to-emerald-900/40",
  },
  {
    id: "labyrinth_core",
    label: "Labyrinth · Core Rooms",
    subtitle: "End-game bosses with coordinated timing.",
    region: "Labyrinth",
    accent: "from-fuchsia-500/40 to-slate-900/60",
  },
];

type SdkStatus = "idle" | "initializing" | "ready" | "error";

type BossPinProps = {
  x: number;
  y: number;
  data: BossPinData;
  onClick: () => void;
};

function BossPin({ x, y, data, onClick }: BossPinProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute -translate-x-1/2 -translate-y-full rounded-full border border-emerald-400/70 bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold text-emerald-50 shadow-lg shadow-emerald-900/60 transition-transform hover:-translate-y-[110%] hover:bg-emerald-400/90"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="flex items-center gap-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-100" />
        <span className="truncate max-w-[7rem]">{data.bossName}</span>
      </span>
    </button>
  );
}

export default function DashboardPage() {
  const [sdkStatus, setSdkStatus] = useState<SdkStatus>("idle");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [activePin, setActivePin] = useState<
    (BossPinData & { x: number; y: number }) | null
  >(null);
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let isMounted = true;

    async function bootstrapDiscordSdk() {
      setSdkStatus("initializing");

      try {
        const clientId =
          process.env.NEXT_PUBLIC_DISCORD_APP_ID ?? process.env.DISCORD_APP_ID;

        if (!clientId) {
          // Без корректного clientId SDK не сможет инициализироваться.
          setSdkStatus("error");
          return;
        }

        const discordSdk = new DiscordSDK(clientId);

        await discordSdk.ready();

        const auth =
          (await discordSdk.commands.authenticate({})) as DiscordAuthenticateResponse;

        if (!auth || !auth.user || !auth.access_token) {
          setSdkStatus("error");
          return;
        }

        if (!isMounted) return;

        setCurrentUser({
          id: auth.user.id,
          username: auth.user.username,
        });
        setSdkStatus("ready");
      } catch (error) {
        console.error("Failed to initialize Discord Embedded App SDK", error);
        if (!isMounted) return;
        setSdkStatus("error");
      }
    }

    void bootstrapDiscordSdk();

    return () => {
      isMounted = false;
    };
  }, []);

  const statusLabel = useMemo(() => {
    switch (sdkStatus) {
      case "initializing":
        return "Connecting to Discord Activity environment...";
      case "ready":
        return "Connected to Discord. Timers are synced with your account.";
      case "error":
        return "Could not connect to Discord Activity. Some features may be unavailable.";
      default:
        return "";
    }
  }, [sdkStatus]);

  return (
    <div className="min-h-screen bg-[#050712] text-zinc-100 antialiased">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-8 pt-6 sm:px-8">
        {/* Header */}
        <header className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-amber-500 shadow-lg shadow-red-900/40">
              <span className="text-lg font-black">⚔️</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                MIR4 Global Boss Tracker
              </h1>
              <p className="text-xs text-zinc-400 sm:text-sm">
                Embedded Discord dashboard for Secret Peak, Mirage, Valley, and Labyrinth bosses.
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-col items-start gap-1 text-xs text-zinc-400 sm:mt-0 sm:items-end">
            {currentUser ? (
              <span>
                Logged in as <span className="font-medium text-zinc-100">{currentUser.username}</span>
              </span>
            ) : (
              <span>Waiting for Discord authentication...</span>
            )}
            {statusLabel && <span className="text-[11px] text-zinc-500">{statusLabel}</span>}
          </div>
        </header>

        {/* Interactive map container */}
        <section className="grid gap-4 md:grid-cols-[minmax(0,3fr)] md:grid-rows-1 lg:grid-cols-[minmax(0,3fr)]">
          <article className="relative col-span-1 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 shadow-lg shadow-black/60">
            <div className="flex items-center justify-between border-b border-zinc-800/70 px-4 py-3 sm:px-5">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-zinc-50 sm:text-base">
                  Secret Peak · Prototype Map
                </h2>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                  Interactive pins · {bossLocationCards.length} presets
                </p>
              </div>
              <span className="inline-flex items-center rounded-full border border-zinc-700/80 bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-300">
                Map Prototype
              </span>
            </div>

            <div className="relative h-[360px] w-full overflow-hidden bg-neutral-800/90 sm:h-[420px] md:h-[460px]">
              {/* Здесь позже будет фон-карта. Пока просто тёмный placeholder. */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(15,23,42,0.9),_transparent_55%)] mix-blend-screen" />

              {/* Dummy pins с координатами в процентах */}
              <BossPin
                x={22}
                y={38}
                data={{
                  id: "pin_1",
                  bossName: "Kruel · F1",
                  locationLabel: "Secret Peak F1",
                  region: "Secret Peak",
                }}
                onClick={() =>
                  setActivePin({
                    id: "pin_1",
                    bossName: "Kruel · F1",
                    locationLabel: "Secret Peak Floor 1",
                    region: "Secret Peak",
                    x: 22,
                    y: 38,
                  })
                }
              />
              <BossPin
                x={63}
                y={52}
                data={{
                  id: "pin_2",
                  bossName: "Red Boss · Core",
                  locationLabel: "Labyrinth Core",
                  region: "Labyrinth",
                }}
                onClick={() =>
                  setActivePin({
                    id: "pin_2",
                    bossName: "Red Boss · Core",
                    locationLabel: "Labyrinth Core Rooms",
                    region: "Labyrinth",
                    x: 63,
                    y: 52,
                  })
                }
              />
              <BossPin
                x={78}
                y={22}
                data={{
                  id: "pin_3",
                  bossName: "Mirage Blue",
                  locationLabel: "Mirage Blue Route",
                  region: "Mirage",
                }}
                onClick={() =>
                  setActivePin({
                    id: "pin_3",
                    bossName: "Mirage Blue",
                    locationLabel: "Mirage Blue Boss Route",
                    region: "Mirage",
                    x: 78,
                    y: 22,
                  })
                }
              />

              {/* Popover над картой */}
              {activePin && (
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="pointer-events-auto absolute z-20 w-[220px] max-w-[70vw] -translate-x-1/2 -translate-y-full rounded-2xl border border-zinc-700/80 bg-zinc-950/95 px-3 py-3 text-xs text-zinc-100 shadow-xl shadow-black/70 backdrop-blur"
                    style={{ left: `${activePin.x}%`, top: `${activePin.y}%` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-400">
                          Report Kill
                        </p>
                        <h3 className="mt-0.5 text-sm font-semibold">
                          {activePin.bossName}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-zinc-400">
                          {activePin.locationLabel} · {activePin.region}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePin(null);
                          setReportError(null);
                          setReportSuccess(false);
                        }}
                        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-900/80 text-[10px] text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {reportError && (
                        <p className="text-[11px] text-rose-400">
                          {reportError}
                        </p>
                      )}
                      {reportSuccess && (
                        <p className="text-[11px] text-emerald-400">
                          Kill reported. Timer updated.
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActivePin(null);
                          setReportError(null);
                          setReportSuccess(false);
                        }}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-700/80 bg-zinc-900/70 px-2 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800/80"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isReporting || !currentUser}
                        onClick={async () => {
                          if (!currentUser || !activePin) return;
                          setIsReporting(true);
                          setReportError(null);
                          setReportSuccess(false);

                          try {
                            const response = await fetch("/api/report-kill", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                bossName: activePin.bossName,
                                location: activePin.locationLabel,
                                reporterId: currentUser.id,
                              }),
                            });

                            const json = (await response.json()) as {
                              success?: boolean;
                              error?: string;
                            };

                            if (!response.ok || !json.success) {
                              setReportError(
                                json.error ||
                                  "Failed to record kill. Please try again."
                              );
                            } else {
                              setReportSuccess(true);
                            }
                          } catch (error) {
                            console.error("Failed to call /api/report-kill", error);
                            setReportError(
                              "Unexpected error while reporting kill."
                            );
                          } finally {
                            setIsReporting(false);
                          }
                        }}
                        className="inline-flex flex-1 items-center justify-center rounded-full border border-emerald-500/80 bg-emerald-500 px-2 py-1.5 text-[11px] font-semibold text-emerald-950 shadow-sm shadow-emerald-900/50 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:border-emerald-900/60 disabled:bg-emerald-900/60 disabled:text-emerald-300/60"
                      >
                        {isReporting
                          ? "Reporting..."
                          : currentUser
                          ? "Confirm Report Kill"
                          : "Login required"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </article>
        </section>

        {/* Footer hint */}
        <footer className="mt-4 flex items-center justify-between border-t border-zinc-900 pt-3 text-[11px] text-zinc-500">
          <span>MIR4 Boss Activity · Discord Embedded App</span>
          <span>Next.js · Supabase · Discord SDK</span>
        </footer>
      </main>
    </div>
  );
}
