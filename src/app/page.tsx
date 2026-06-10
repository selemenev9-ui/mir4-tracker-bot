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

export default function DashboardPage() {
  const [sdkStatus, setSdkStatus] = useState<SdkStatus>("idle");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
  } | null>(null);

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

        {/* Map grid */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bossLocationCards.map((card) => (
            <article
              key={card.id}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 to-slate-950/90 shadow-lg shadow-black/60 transition-transform hover:-translate-y-0.5 hover:border-zinc-500/80"
            >
              <div
                className={`pointer-events-none absolute inset-px rounded-2xl bg-gradient-to-br ${card.accent} opacity-60 mix-blend-screen`}
                aria-hidden="true"
              />
              <div className="relative flex h-full flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-50 sm:text-base">
                      {card.label}
                    </h2>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                      {card.region} region
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-zinc-700/80 bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-300">
                    Placeholder
                  </span>
                </div>

                <p className="text-xs text-zinc-300/90 sm:text-[13px]">{card.subtitle}</p>

                <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Interactive map slot
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-700/80 bg-zinc-900/60 px-2.5 py-1 text-[11px] font-medium text-zinc-100 transition-colors hover:border-zinc-400 hover:bg-zinc-800/80"
                  >
                    Open tracker
                  </button>
                </div>
              </div>
            </article>
          ))}
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
