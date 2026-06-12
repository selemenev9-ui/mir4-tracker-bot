"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { getSupabaseClient } from "@/lib/supabase";

// Types and constants

type ZoneCategory = "lab" | "valley" | "purgatory" | "mirage" | "tower" | "weekly";

const ZONE_CATEGORY_CONFIG: Record<
  ZoneCategory,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
  }
> = {
  lab: {
    label: "Labyrinth",
    color: "#22d3ee",
    bgColor: "rgba(34,211,238,0.12)",
    borderColor: "rgba(34,211,238,0.35)",
    icon: "M12 2 L20.66 7 L20.66 17 L12 22 L3.34 17 L3.34 7 Z",
  },
  valley: {
    label: "Valley",
    color: "#4ade80",
    bgColor: "rgba(74,222,128,0.12)",
    borderColor: "rgba(74,222,128,0.35)",
    icon: "M12 2 L20 5 L20 12 C20 17 16 20.5 12 22 C8 20.5 4 17 4 12 L4 5 Z",
  },
  purgatory: {
    label: "Purgatory",
    color: "#f87171",
    bgColor: "rgba(248,113,113,0.12)",
    borderColor: "rgba(248,113,113,0.35)",
    icon:
      "M12 2 C12 2 17 8 17 13 C17 16.31 14.76 19.11 12 20 C9.24 19.11 7 16.31 7 13 C7 10 9 7 9 7 C9 7 10 10 12 10 C12 10 11 6 12 2 Z",
  },
  mirage: {
    label: "Mirage",
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.12)",
    borderColor: "rgba(167,139,250,0.35)",
    icon: "M12 2 L22 12 L12 22 L2 12 Z",
  },
  tower: {
    label: "Domination",
    color: "#fbbf24",
    bgColor: "rgba(251,191,36,0.12)",
    borderColor: "rgba(251,191,36,0.35)",
    icon: "M4 22 L4 8 L7 8 L7 5 L10 5 L10 8 L14 8 L14 5 L17 5 L17 8 L20 8 L20 22 Z",
  },
  weekly: {
    label: "Weekly Boss",
    color: "#fb923c",
    bgColor: "rgba(251,146,60,0.12)",
    borderColor: "rgba(251,146,60,0.35)",
    icon:
      "M12 2 L14.09 8.26 L20.63 8.27 L15.45 12.14 L17.54 18.4 L12 14.77 L6.46 18.4 L8.55 12.14 L3.37 8.27 L9.91 8.26 Z",
  },
};

const SQUADS = ["A", "B", "C", "D", "E", "F"] as const;
type Squad = (typeof SQUADS)[number];

const SQUAD_COLORS: Record<Squad, string> = {
  A: "#ef4444",
  B: "#3b82f6",
  C: "#22c55e",
  D: "#eab308",
  E: "#8b5cf6",
  F: "#f97316",
};

type WarMode = "deploy" | "map";
type MarkerType = "attack" | "defend" | "gather" | "support" | "retreat";

interface WarZone {
  id: string;
  name: string;
  category: ZoneCategory;
  scheduleLabel: string;
  scheduleTimes: string[];
  scheduleType: "daily" | "weekly";
  weekday?: number;
  mapIds: string[];
  description?: string;
}

interface MapFile {
  id: string;
  name: string;
  src: string;
  category: ZoneCategory;
  floor?: number;
}

interface Assignment {
  id?: string;
  war_date: string;
  zone_id: string;
  role: "attack" | "defend" | "support";
  squad: Squad | null;
  assigned_by: string;
}

interface MapMarker {
  id: string;
  map_id: string;
  marker_type: MarkerType;
  x_pct: number;
  y_pct: number;
  color: string;
  label: string | null;
  placed_by: string;
}

const glassCard = {
  background:
    "radial-gradient(ellipse at top left, rgba(148,163,184,0.06) 0%, transparent 60%), rgba(15,23,42,0.92)",
  border: "1px solid rgba(148,163,184,0.2)",
  borderRadius: 12,
} as const;

const supabase = getSupabaseClient();

function todayUTC8(): string {
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return utc8.toISOString().slice(0, 10);
}

const WAR_ZONES: WarZone[] = [
  // 
  // LABYRINTHS
  //
  {
    id: "abandoned-mine-lab",
    name: "Abandoned Mine Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["abandoned-mine-lab-4f"],
    description: undefined,
  },
  {
    id: "bicheon-lab",
    name: "Bicheon Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["bicheon-lab-4f"],
    description: undefined,
  },
  {
    id: "demonbull-lab",
    name: "Demonbull Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["demonbull-lab-4f"],
    description: undefined,
  },
  {
    id: "heavens-way-lab",
    name: "Heavens Way Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["heavens-way-lab-4f"],
    description: undefined,
  },
  {
    id: "nine-dragon-lab",
    name: "Nine Dragon Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["nine-dragon-lab-4f"],
    description: undefined,
  },
  {
    id: "phantasia-lab",
    name: "Phantasia Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["phantasia-lab-4f"],
    description: undefined,
  },
  {
    id: "redmoon-lab",
    name: "Redmoon Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["redmoon-lab-4f"],
    description: undefined,
  },
  {
    id: "rockcut-lab",
    name: "Rockcut Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["rockcut-lab-4f"],
    description: undefined,
  },
  {
    id: "sabuk-lab",
    name: "Sabuk Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["sabuk-lab-4f"],
    description: undefined,
  },
  {
    id: "snake-pit-lab",
    name: "Snake Pit Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["snake-pit-lab-4f"],
    description: undefined,
  },

  // 
  // VALLEYS
  //
  {
    id: "bicheon-valley",
    name: "Bicheon Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["bicheon-valley-4f"],
    description: "Krukan portal — Monday 22:00",
  },
  {
    id: "phantasia-valley",
    name: "Phantasia Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["phantasia-valley-4f"],
    description: "Turkan portal — Thursday 23:00",
  },
  {
    id: "redmoon-valley",
    name: "Redmoon Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["redmoon-valley-4f"],
    description: "Nerkan portal — Tuesday 23:00",
  },
  {
    id: "sagitation-valley",
    name: "Sagitation Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["sagitation-valley-4f"],
    description: undefined,
  },
  {
    id: "snake-valley",
    name: "Snake Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["snake-valley-4f"],
    description: "Utukan portal — Friday 22:00",
  },

  // 
  // WEEKLY BOSSES
  //
  {
    id: "krukan",
    name: "Krukan — Bicheon Valley 4F",
    category: "weekly",
    scheduleLabel: "Monday 22:00",
    scheduleTimes: ["22:00"],
    scheduleType: "weekly",
    weekday: 1,
    mapIds: ["bicheon-valley-4f"],
    description: "Demon Spider of Hell — Shackling Abaddon",
  },
  {
    id: "nerkan",
    name: "Nerkan — Redmoon Valley 4F",
    category: "weekly",
    scheduleLabel: "Tuesday 23:00",
    scheduleTimes: ["23:00"],
    scheduleType: "weekly",
    weekday: 2,
    mapIds: ["redmoon-valley-4f"],
    description: "Black Flame Arch Demon",
  },
  {
    id: "valley-capture",
    name: "Hidden Valley Capture",
    category: "weekly",
    scheduleLabel: "Wednesday 22:00",
    scheduleTimes: ["22:00"],
    scheduleType: "weekly",
    weekday: 3,
    mapIds: ["bicheon-valley-4f", "snake-valley-4f", "redmoon-valley-4f"],
    description: "All clan — 22:00–23:00",
  },
  {
    id: "helbar",
    name: "Helbar — Purgatory 7F",
    category: "weekly",
    scheduleLabel: "Wednesday 23:00",
    scheduleTimes: ["23:00"],
    scheduleType: "weekly",
    weekday: 3,
    mapIds: ["purgatory-7f"],
    description: "Special boss — floor 7",
  },
  {
    id: "wraiths",
    name: "Attack of the Living Wraiths",
    category: "weekly",
    scheduleLabel: "Thursday 22:00",
    scheduleTimes: ["22:00"],
    scheduleType: "weekly",
    weekday: 4,
    mapIds: ["bicheon-valley-4f", "snake-valley-4f", "redmoon-valley-4f"],
    description: "All three valleys 4F simultaneously",
  },
  {
    id: "turkan",
    name: "Turkan — Phantasia Valley 4F",
    category: "weekly",
    scheduleLabel: "Thursday 23:00",
    scheduleTimes: ["23:00"],
    scheduleType: "weekly",
    weekday: 4,
    mapIds: ["phantasia-valley-4f"],
    description: "Violet Demon God",
  },
  {
    id: "rallying-void",
    name: "Rallying of the Void — Mirage Ship",
    category: "weekly",
    scheduleLabel: "Thursday 23:00",
    scheduleTimes: ["23:00"],
    scheduleType: "weekly",
    weekday: 4,
    mapIds: [],
    description: "Mirage Ship — 23:00–00:00",
  },
  {
    id: "utukan",
    name: "Utukan — Snake Valley 4F",
    category: "weekly",
    scheduleLabel: "Friday 22:00",
    scheduleTimes: ["22:00"],
    scheduleType: "weekly",
    weekday: 5,
    mapIds: ["snake-valley-4f"],
    description: "Crimson Emperor — Crimson Abaddon",
  },

  // 
  // PURGATORY
  //
  {
    id: "purgatory",
    name: "Purgatory — All Floors",
    category: "purgatory",
    scheduleLabel: "Daily 06:00 / 12:00 / 18:00 / 00:00",
    scheduleTimes: ["06:00", "12:00", "18:00", "00:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: [
      "purgatory-1f",
      "purgatory-2f",
      "purgatory-3f",
      "purgatory-4f",
      "purgatory-5f",
      "purgatory-6f",
      "purgatory-7f",
    ],
    description: undefined,
  },

  // 
  // MIRAGE
  //
  {
    id: "mirage-void-bull",
    name: "Void Bull Specter — Demon Bull Temple 3F",
    category: "mirage",
    scheduleLabel: "Permanent field boss",
    scheduleTimes: [],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["world1-demon-bull-temple-3f"],
    description: "Layer 1 — W1 danger zone",
  },
  {
    id: "mirage-ice-demon",
    name: "Heavenly Ice Demon — Abandoned Mine 3F",
    category: "mirage",
    scheduleLabel: "Permanent field boss",
    scheduleTimes: [],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: ["world8-abandoned-mine-3f"],
    description: "Layer 8 — W8 danger zone",
  },

  // 
  // TOWER OF BLACK DRAGON
  //
  {
    id: "tower-juja",
    name: "Tower — Juja Neoul",
    category: "tower",
    scheduleLabel: "Daily 11:00 / 17:00 / 23:00",
    scheduleTimes: ["11:00", "17:00", "23:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: [
      "tower-black-dragon-1f",
      "tower-black-dragon-2f",
      "tower-black-dragon-3f",
      "tower-black-dragon-4f",
    ],
    description: "All 4 floors",
  },
  {
    id: "tower-wraiths",
    name: "Tower — Living Wraiths",
    category: "tower",
    scheduleLabel: "Daily 10:00/12:00/16:00/18:00/22:00/00:00",
    scheduleTimes: ["10:00", "12:00", "16:00", "18:00", "22:00", "00:00"],
    scheduleType: "daily",
    weekday: undefined,
    mapIds: [
      "tower-black-dragon-1f",
      "tower-black-dragon-2f",
      "tower-black-dragon-3f",
      "tower-black-dragon-4f",
    ],
    description: "All 4 floors",
  },
];

const MAP_FILES: Record<string, MapFile> = {
  "abandoned-mine-lab-4f": {
    id: "abandoned-mine-lab-4f",
    name: "Abandoned Mine Lab 4F",
    src: "/maps/war/abandoned-mine-lab-4f.png",
    category: "lab",
  },
  "bicheon-lab-4f": {
    id: "bicheon-lab-4f",
    name: "Bicheon Lab 4F",
    src: "/maps/war/bicheon-lab-4f.png",
    category: "lab",
  },
  "demonbull-lab-4f": {
    id: "demonbull-lab-4f",
    name: "Demonbull Lab 4F",
    src: "/maps/war/demonbull-lab-4f.png",
    category: "lab",
  },
  "heavens-way-lab-4f": {
    id: "heavens-way-lab-4f",
    name: "Heavens Way Lab 4F",
    src: "/maps/war/heavens-way-lab-4f.png",
    category: "lab",
  },
  "nine-dragon-lab-4f": {
    id: "nine-dragon-lab-4f",
    name: "Nine Dragon Lab 4F",
    src: "/maps/war/nine-dragon-lab-4f.png",
    category: "lab",
  },
  "phantasia-lab-4f": {
    id: "phantasia-lab-4f",
    name: "Phantasia Lab 4F",
    src: "/maps/war/phantasia-lab-4f.png",
    category: "lab",
  },
  "redmoon-lab-4f": {
    id: "redmoon-lab-4f",
    name: "Redmoon Lab 4F",
    src: "/maps/war/redmoon-lab-4f.png",
    category: "lab",
  },
  "rockcut-lab-4f": {
    id: "rockcut-lab-4f",
    name: "Rockcut Lab 4F",
    src: "/maps/war/rockcut-lab-4f.png",
    category: "lab",
  },
  "sabuk-lab-4f": {
    id: "sabuk-lab-4f",
    name: "Sabuk Lab 4F",
    src: "/maps/war/sabuk-lab-4f.png",
    category: "lab",
  },
  "snake-pit-lab-4f": {
    id: "snake-pit-lab-4f",
    name: "Snake Pit Lab 4F",
    src: "/maps/war/snake-pit-lab-4f.png",
    category: "lab",
  },
  "bicheon-valley-4f": {
    id: "bicheon-valley-4f",
    name: "Bicheon Valley 4F",
    src: "/maps/war/bicheon-valley-4f.png",
    category: "valley",
  },
  "phantasia-valley-4f": {
    id: "phantasia-valley-4f",
    name: "Phantasia Valley 4F",
    src: "/maps/war/phantasia-valley-4f.png",
    category: "valley",
  },
  "redmoon-valley-4f": {
    id: "redmoon-valley-4f",
    name: "Redmoon Valley 4F",
    src: "/maps/war/redmoon-valley-4f.png",
    category: "valley",
  },
  "sagitation-valley-4f": {
    id: "sagitation-valley-4f",
    name: "Sagitation Valley 4F",
    src: "/maps/war/sagitation-valley-4f.png",
    category: "valley",
  },
  "snake-valley-4f": {
    id: "snake-valley-4f",
    name: "Snake Valley 4F",
    src: "/maps/war/snake-valley-4f.png",
    category: "valley",
  },
  "purgatory-1f": {
    id: "purgatory-1f",
    name: "Purgatory 1F",
    src: "/maps/war/purgatory-1f.png",
    category: "purgatory",
    floor: 1,
  },
  "purgatory-2f": {
    id: "purgatory-2f",
    name: "Purgatory 2F",
    src: "/maps/war/purgatory-2f.png",
    category: "purgatory",
    floor: 2,
  },
  "purgatory-3f": {
    id: "purgatory-3f",
    name: "Purgatory 3F",
    src: "/maps/war/purgatory-3f.png",
    category: "purgatory",
    floor: 3,
  },
  "purgatory-4f": {
    id: "purgatory-4f",
    name: "Purgatory 4F",
    src: "/maps/war/purgatory-4f.png",
    category: "purgatory",
    floor: 4,
  },
  "purgatory-5f": {
    id: "purgatory-5f",
    name: "Purgatory 5F",
    src: "/maps/war/purgatory-5f.png",
    category: "purgatory",
    floor: 5,
  },
  "purgatory-6f": {
    id: "purgatory-6f",
    name: "Purgatory 6F",
    src: "/maps/war/purgatory-6f.png",
    category: "purgatory",
    floor: 6,
  },
  "purgatory-7f": {
    id: "purgatory-7f",
    name: "Purgatory 7F",
    src: "/maps/war/purgatory-7f.png",
    category: "purgatory",
    floor: 7,
  },
  "world1-demon-bull-temple-3f": {
    id: "world1-demon-bull-temple-3f",
    name: "Demon Bull Temple 3F (W1)",
    src: "/maps/war/world1-demon-bull-temple-3f.png",
    category: "mirage",
  },
  "world2-heavens-way-peak": {
    id: "world2-heavens-way-peak",
    name: "Heavens Way Peak (W2)",
    src: "/maps/war/world2-heavens-way-peak.png",
    category: "mirage",
  },
  "world3-rockcut-tomb": {
    id: "world3-rockcut-tomb",
    name: "Rockcut Tomb (W3)",
    src: "/maps/war/world3-rockcut-tomb.png",
    category: "mirage",
  },
  "world4-bladehaven-2f": {
    id: "world4-bladehaven-2f",
    name: "Bladehaven 2F (W4)",
    src: "/maps/war/world4-bladehaven-2f.png",
    category: "mirage",
  },
  "world5-illusion-temple": {
    id: "world5-illusion-temple",
    name: "Illusion Temple (W5)",
    src: "/maps/war/world5-illusion-temple.png",
    category: "mirage",
  },
  "world6-bicheon-lab": {
    id: "world6-bicheon-lab",
    name: "Bicheon Lab (W6)",
    src: "/maps/war/world6-bicheon-lab.png",
    category: "mirage",
  },
  "world7-redmoon-gorge-3f": {
    id: "world7-redmoon-gorge-3f",
    name: "Redmoon Gorge 3F (W7)",
    src: "/maps/war/world7-redmoon-gorge-3f.png",
    category: "mirage",
  },
  "world8-abandoned-mine-3f": {
    id: "world8-abandoned-mine-3f",
    name: "Abandoned Mine 3F (W8)",
    src: "/maps/war/world8-abandoned-mine-3f.png",
    category: "mirage",
  },
  "tower-black-dragon-1f": {
    id: "tower-black-dragon-1f",
    name: "Tower of Black Dragon 1F",
    src: "/maps/war/tower-black-dragon.jpg",
    category: "tower",
    floor: 1,
  },
  "tower-black-dragon-2f": {
    id: "tower-black-dragon-2f",
    name: "Tower of Black Dragon 2F",
    src: "/maps/war/tower-black-dragon.jpg",
    category: "tower",
    floor: 2,
  },
  "tower-black-dragon-3f": {
    id: "tower-black-dragon-3f",
    name: "Tower of Black Dragon 3F",
    src: "/maps/war/tower-black-dragon.jpg",
    category: "tower",
    floor: 3,
  },
  "tower-black-dragon-4f": {
    id: "tower-black-dragon-4f",
    name: "Tower of Black Dragon 4F",
    src: "/maps/war/tower-black-dragon.jpg",
    category: "tower",
    floor: 4,
  },
};

function ZoneBadge({ category }: { category: ZoneCategory }) {
  const cfg = ZONE_CATEGORY_CONFIG[category];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        color: cfg.color,
        background: cfg.bgColor,
        border: `1px solid ${cfg.borderColor}`,
      }}
    >
      <svg width={10} height={10} viewBox="0 0 24 24" fill={cfg.color}>
        <path d={cfg.icon} />
      </svg>
      {cfg.label}
    </span>
  );
}

function SquadBadge({ squad }: { squad: Squad | null }) {
  if (!squad) {
    return (
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed text-xs text-zinc-500"
        style={{ borderColor: "rgba(148,163,184,0.6)" }}
      >
        
      </span>
    );
  }
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
      style={{
        background: SQUAD_COLORS[squad],
        color: "#0b1120",
        boxShadow: `0 0 0 1px rgba(15,23,42,0.8), 0 0 12px ${SQUAD_COLORS[squad]}`,
      }}
    >
      {squad}
    </span>
  );
}

function MarkerIcon({
  type,
  color,
  size,
}: {
  type: MarkerType;
  color: string;
  size: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.7))" },
  } as const;

  if (type === "attack") {
    return (
      <svg {...common} stroke={color} strokeWidth={2} fill="none">
        <line x1={6} y1={6} x2={18} y2={18} />
        <line x1={18} y1={6} x2={6} y2={18} />
      </svg>
    );
  }
  if (type === "defend") {
    return (
      <svg {...common} fill={color}>
        <path d="M12 2 L20 5 L20 12 C20 17 16 20.5 12 22 C8 20.5 4 17 4 12 L4 5 Z" />
      </svg>
    );
  }
  if (type === "gather") {
    return (
      <svg {...common}>
        <circle cx={12} cy={12} r={5} fill={color} />
        <circle
          cx={12}
          cy={12}
          r={8}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
      </svg>
    );
  }
  if (type === "support") {
    return (
      <svg {...common} fill={color}>
        <rect x={10} y={4} width={4} height={16} rx={1} />
        <rect x={4} y={10} width={16} height={4} rx={1} />
      </svg>
    );
  }
  // retreat
  return (
    <svg {...common} stroke={color} strokeWidth={2} fill="none">
      <path d="M15 5 L7 12 L15 19" />
      <line x1={7} y1={12} x2={19} y2={12} />
    </svg>
  );
}
function WarClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      const h = String(utc8.getUTCHours()).padStart(2, "0");
      const m = String(utc8.getUTCMinutes()).padStart(2, "0");
      setTime(`UTC+8 ${h}:${m}`);
    }
    update();
    const id = window.setInterval(update, 30000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className="rounded-full px-3 py-1 text-xs text-zinc-400"
      style={{
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(148,163,184,0.35)",
      }}
    >
      {time}
    </span>
  );
}

const CATEGORY_ORDER: ZoneCategory[] = [
  "lab",
  "valley",
  "purgatory",
  "mirage",
  "tower",
];

function parseTimeToMinutes(timeStr: string | undefined): number {
  if (!timeStr) return 0;
  const [hStr, mStr] = timeStr.split(":");
  const h = Number(hStr);
  const m = Number(mStr ?? "0");
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function getZonesForDate(date: string): WarZone[] {
  const d = new Date(`${date}T00:00:00`);
  const dow = d.getDay();

  const daily = WAR_ZONES.filter((z) => z.scheduleType === "daily");
  const weekly = WAR_ZONES.filter(
    (z) => z.scheduleType === "weekly" && z.weekday === dow
  );

  daily.sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  );

  weekly.sort(
    (a, b) =>
      parseTimeToMinutes(a.scheduleTimes[0]) -
      parseTimeToMinutes(b.scheduleTimes[0])
  );

  return [...daily, ...weekly];
}

function timeBadgeStyle(timeStr: string | undefined) {
  let background = "rgba(100,116,139,0.3)";
  let color = "#94a3b8";

  if (timeStr) {
    const [hStr, mStr] = timeStr.split(":");
    const h = Number(hStr);
    const m = Number(mStr ?? "0");
    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      const now = new Date();
      const utc8 = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      const nowMinutes =
        utc8.getUTCHours() * 60 + utc8.getUTCMinutes();
      const eventMinutes = h * 60 + m;
      const diff = eventMinutes - nowMinutes;

      if (diff >= 0 && diff <= 15) {
        background = "rgba(239,68,68,0.85)";
        color = "#ffffff";
      } else if (diff > 0 && diff <= 60) {
        background = "rgba(234,179,8,0.9)";
        color = "#000000";
      } else if (diff < 0 && diff >= -30) {
        background = "rgba(34,197,94,0.9)";
        color = "#000000";
      }
    }
  }

  return {
    background,
    color,
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 700,
  };
}

function RoleRow({
  zoneId,
  role,
  roleColor,
  assignments,
  onAssign,
}: {
  zoneId: string;
  role: "attack" | "defend" | "support";
  roleColor: string;
  assignments: Assignment[];
  onAssign: (
    zoneId: string,
    role: "attack" | "defend" | "support",
    squad: Squad | null
  ) => void;
}) {
  const current = assignments.find(
    (a) => a.zone_id === zoneId && a.role === role
  );

  return (
    <div className="mt-2 flex items-center gap-2">
      <span
        style={{
          color: roleColor,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          width: 60,
          flexShrink: 0,
          textTransform: "uppercase",
        }}
      >
        {role}
      </span>
      <div className="flex gap-1">
        {SQUADS.map((sq) => {
          const active = current?.squad === sq;
          return (
            <button
              key={sq}
              type="button"
              onClick={() =>
                onAssign(zoneId, role, active ? null : sq)
              }
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: active
                  ? SQUAD_COLORS[sq]
                  : "rgba(15,23,42,0.9)",
                border: `2px solid ${
                  active
                    ? SQUAD_COLORS[sq]
                    : "rgba(148,163,184,0.5)"
                }`,
                color: active ? "#ffffff" : "#94a3b8",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
                boxShadow: active
                  ? `0 0 12px ${SQUAD_COLORS[sq]}80`
                  : "none",
                transition: "all 0.15s ease",
              }}
            >
              {sq}
            </button>
          );
        })}
      </div>
      {current?.assigned_by && current.squad && (
        <span className="ml-2 text-[10px] text-zinc-500">
          {current.assigned_by}
        </span>
      )}
    </div>
  );
}

function DeployBoard({
  selectedDate,
  username,
}: {
  selectedDate: string;
  username: string;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const loadAssignments = useCallback(async () => {
    const { data } = await supabase
      .from("war_assignments")
      .select("*")
      .eq("war_date", selectedDate);
    setAssignments((data as Assignment[]) ?? []);
  }, [selectedDate]);

  const handleAssign = useCallback(
    async (
      zoneId: string,
      role: "attack" | "defend" | "support",
      squad: Squad | null
    ) => {
      if (!selectedDate) return;
      if (squad === null) {
        await supabase
          .from("war_assignments")
          .delete()
          .eq("war_date", selectedDate)
          .eq("zone_id", zoneId)
          .eq("role", role);
      } else {
        await supabase.from("war_assignments").upsert(
          {
            war_date: selectedDate,
            zone_id: zoneId,
            role,
            squad,
            assigned_by: username,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "war_date,zone_id,role" }
        );
      }
      await loadAssignments();
    },
    [loadAssignments, selectedDate, username]
  );

  useEffect(() => {
    void loadAssignments();
    const channel = supabase
      .channel(`war-deploy-${selectedDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "war_assignments",
          filter: `war_date=eq.${selectedDate}`,
        },
        () => {
          void loadAssignments();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAssignments, selectedDate]);

  const zonesForDay = getZonesForDate(selectedDate);

  return (
    <section className="grid gap-3">
      {zonesForDay.map((zone) => {
        const colorCfg = ZONE_CATEGORY_CONFIG[zone.category];
        return (
          <div
            key={zone.id}
            style={{
              background: glassCard.background,
              border: glassCard.border,
              borderRadius: glassCard.borderRadius,
              padding: 16,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.transform =
                "perspective(800px) rotateX(-1deg) rotateY(2deg) translateY(-3px)";
              el.style.boxShadow =
                "0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(148,163,184,0.3)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.transform = "none";
              el.style.boxShadow = "none";
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <ZoneBadge category={zone.category} />
                <div className="text-sm font-semibold text-zinc-100">
                  {zone.name}
                </div>
                <div className="text-xs text-zinc-500">
                  {zone.scheduleLabel}
                </div>
                {zone.description && (
                  <div className="text-[11px] text-zinc-500">
                    {zone.description}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                {zone.scheduleTimes.length > 0 ? (
                  zone.scheduleTimes.map((t) => (
                    <span key={t} style={timeBadgeStyle(t)}>
                      {t}
                    </span>
                  ))
                ) : (
                  <span style={timeBadgeStyle(undefined)}>Any time</span>
                )}
              </div>
            </div>

            <hr
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                margin: "12px 0",
              }}
            />

            <RoleRow
              zoneId={zone.id}
              role="attack"
              roleColor={colorCfg.color}
              assignments={assignments}
              onAssign={handleAssign}
            />
            <RoleRow
              zoneId={zone.id}
              role="defend"
              roleColor={colorCfg.color}
              assignments={assignments}
              onAssign={handleAssign}
            />
            <RoleRow
              zoneId={zone.id}
              role="support"
              roleColor={colorCfg.color}
              assignments={assignments}
              onAssign={handleAssign}
            />
          </div>
        );
      })}
    </section>
  );
}

interface MapCanvasProps {
  mapId: string;
  markers: MapMarker[];
  activeMarkerType: MarkerType;
  activeSquad: Squad;
  onPlaceMarker: (params: {
    mapId: string;
    marker_type: MarkerType;
    x_pct: number;
    y_pct: number;
  }) => void;
  onRemoveMarker: (id: string) => void;
}

function MapCanvas({
  mapId,
  markers,
  activeMarkerType,
  activeSquad,
  onPlaceMarker,
  onRemoveMarker,
}: MapCanvasProps) {
  const mapFile = MAP_FILES[mapId];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imgRect, setImgRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const imgEl = containerRef.current.querySelector("img");
    if (!imgEl) return;

    const naturalW = (imgEl as HTMLImageElement).naturalWidth || container.width;
    const naturalH = (imgEl as HTMLImageElement).naturalHeight || container.height;
    const scale = Math.min(container.width / naturalW, container.height / naturalH);
    const renderedW = naturalW * scale;
    const renderedH = naturalH * scale;
    const offsetX = (container.width - renderedW) / 2;
    const offsetY = (container.height - renderedH) / 2;

    const clickX = e.clientX - container.left - offsetX;
    const clickY = e.clientY - container.top - offsetY;

    if (clickX < 0 || clickY < 0 || clickX > renderedW || clickY > renderedH) {
      return;
    }

    const x_pct = (clickX / renderedW) * 100;
    const y_pct = (clickY / renderedH) * 100;

    onPlaceMarker({
      mapId,
      marker_type: activeMarkerType,
      x_pct,
      y_pct,
    });
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full cursor-crosshair"
      style={{
        aspectRatio: "16/9",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(148,163,184,0.2)",
        background: "#020617",
      }}
    >
      <Image
        src={mapFile.src}
        alt={mapFile.name}
        fill
        style={{ objectFit: "contain" }}
        onLoad={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          if (!containerRef.current) return;
          const c = containerRef.current.getBoundingClientRect();
          const naturalW = img.naturalWidth || c.width;
          const naturalH = img.naturalHeight || c.height;
          const scale = Math.min(c.width / naturalW, c.height / naturalH);
          const renderedW = naturalW * scale;
          const renderedH = naturalH * scale;
          const offsetX = (c.width - renderedW) / 2;
          const offsetY = (c.height - renderedH) / 2;
          setImgRect({ x: offsetX, y: offsetY, w: renderedW, h: renderedH });
        }}
      />
      <svg
        style={{
          position: "absolute",
          left: imgRect.x,
          top: imgRect.y,
          width: imgRect.w,
          height: imgRect.h,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        {markers.map((m) => {
          const isPrimarySquad = m.color === SQUAD_COLORS[activeSquad];
          return (
            <g
              key={m.id}
              transform={`translate(${(m.x_pct / 100) * imgRect.w}, ${(m.y_pct / 100) * imgRect.h})`}
              style={{ cursor: "pointer", pointerEvents: "all" }}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveMarker(m.id);
              }}
            >
              <MarkerIcon
                type={m.marker_type}
                color={m.color}
                size={isPrimarySquad ? 26 : 22}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const MARKER_CONFIG: Record<
  MarkerType,
  {
    label: string;
    color: string;
  }
> = {
  attack: { label: "Attack", color: "#ef4444" },
  defend: { label: "Defend", color: "#3b82f6" },
  gather: { label: "Gather", color: "#22c55e" },
  support: { label: "Support", color: "#eab308" },
  retreat: { label: "Retreat", color: "#a78bfa" },
};

function MapBoard({ username }: { username: string }) {
  const [categoryFilter, setCategoryFilter] = useState<ZoneCategory | "all">(
    "all"
  );
  const [selectedMapId, setSelectedMapId] = useState<string | null>(() => {
    const keys = Object.keys(MAP_FILES);
    return keys.length > 0 ? keys[0] : null;
  });
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [markerCounts, setMarkerCounts] = useState<Record<string, number>>({});
  const [activeMarkerType, setActiveMarkerType] = useState<MarkerType>(
    "attack"
  );
  const [activeSquad, setActiveSquad] = useState<Squad>("A");

  const loadMarkers = useCallback(
    async (mapId: string) => {
      const { data } = await supabase
        .from("war_map_markers")
        .select("*")
        .eq("map_id", mapId);
      const rows = (data as MapMarker[]) ?? [];
      setMarkers(rows);
      setMarkerCounts((prev) => ({ ...prev, [mapId]: rows.length }));
    },
    []
  );

  const handlePlaceMarker = useCallback(
    async (params: {
      mapId: string;
      marker_type: MarkerType;
      x_pct: number;
      y_pct: number;
    }) => {
      await supabase.from("war_map_markers").insert({
        map_id: params.mapId,
        marker_type: params.marker_type,
        x_pct: params.x_pct,
        y_pct: params.y_pct,
        color: SQUAD_COLORS[activeSquad],
        placed_by: username,
      });
    },
    [activeSquad, username]
  );

  const handleRemoveMarker = useCallback(async (id: string) => {
    await supabase.from("war_map_markers").delete().eq("id", id);
  }, []);

  useEffect(() => {
    if (!selectedMapId) return;
    void loadMarkers(selectedMapId);
    const channel = supabase
      .channel(`war-map-${selectedMapId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "war_map_markers",
          filter: `map_id=eq.${selectedMapId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as MapMarker;
            setMarkers((prev) =>
              prev.some((m) => m.id === row.id) ? prev : [...prev, row]
            );
            setMarkerCounts((prev) => ({
              ...prev,
              [row.map_id]: (prev[row.map_id] ?? 0) + 1,
            }));
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as { id: string; map_id: string };
            setMarkers((prev) => prev.filter((m) => m.id !== row.id));
            setMarkerCounts((prev) => ({
              ...prev,
              [row.map_id]: Math.max(0, (prev[row.map_id] ?? 1) - 1),
            }));
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMarkers, selectedMapId]);

  const categoryTabs: Array<{ id: ZoneCategory | "all"; label: string }> = [
    { id: "all", label: "All" },
    { id: "lab", label: "Labyrinth" },
    { id: "valley", label: "Valley" },
    { id: "purgatory", label: "Purgatory" },
    { id: "mirage", label: "Mirage" },
    { id: "tower", label: "Tower" },
  ];

  const allMaps = Object.values(MAP_FILES);
  const filteredMaps = allMaps
    .filter((m) =>
      categoryFilter === "all" ? true : m.category === categoryFilter
    )
    .filter((m, index, self) => {
      if (m.category !== "tower") return true;
      return m.id === "tower-black-dragon-1f";
    });

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="w-full md:w-64 md:shrink-0">
        <div
          className="mb-3 flex gap-1 overflow-x-auto rounded-full border border-zinc-800 bg-zinc-950/60 px-1 py-1 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categoryTabs.map((tab) => {
            const active = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className="rounded-full px-3 py-1 font-medium"
                style={{
                  background: active
                    ? "rgba(239,68,68,0.16)"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid transparent",
                  color: active ? "#fca5a5" : "#9ca3af",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
          {filteredMaps.map((map) => {
            const active = map.id === selectedMapId;
            const count = markerCounts[map.id] ?? 0;
            return (
              <button
                key={map.id}
                type="button"
                onClick={() => setSelectedMapId(map.id)}
                className="relative overflow-hidden rounded-xl text-left text-xs"
                style={{
                  background: glassCard.background,
                  border: active
                    ? "1px solid rgba(239,68,68,0.6)"
                    : glassCard.border,
                }}
              >
                <div className="relative h-20 w-full">
                  <Image
                    src={map.src}
                    alt={map.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-1 px-2 py-2">
                  <span className="line-clamp-2 text-[11px] text-zinc-200">
                    {map.name}
                  </span>
                  {count > 0 && (
                    <span
                      className="ml-1 rounded-full px-2 py-0.5 text-[10px] text-zinc-100"
                      style={{
                        background: "rgba(37,99,235,0.6)",
                        border: "1px solid rgba(191,219,254,0.6)",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs"
        >
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(MARKER_CONFIG) as MarkerType[]).map((type) => {
              const cfg = MARKER_CONFIG[type];
              const active = type === activeMarkerType;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveMarkerType(type)}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1"
                  style={{
                    border: active
                      ? `1px solid ${cfg.color}`
                      : "1px solid rgba(148,163,184,0.4)",
                    background: active
                      ? "rgba(15,23,42,0.9)"
                      : "transparent",
                    color: "#e5e7eb",
                  }}
                >
                  <MarkerIcon type={type} color={cfg.color} size={16} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                Squad
              </span>
              <div className="flex gap-1">
                {SQUADS.map((sq) => (
                  <button
                    key={sq}
                    type="button"
                    onClick={() => setActiveSquad(sq)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "999px",
                      background:
                        activeSquad === sq
                          ? SQUAD_COLORS[sq]
                          : "rgba(15,23,42,0.9)",
                      border:
                        activeSquad === sq
                          ? `1px solid ${SQUAD_COLORS[sq]}`
                          : "1px solid rgba(148,163,184,0.6)",
                      color: activeSquad === sq ? "#0b1120" : "#9ca3af",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {sq}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!selectedMapId) return;
                await supabase
                  .from("war_map_markers")
                  .delete()
                  .eq("map_id", selectedMapId);
                setMarkers([]);
                setMarkerCounts((prev) => ({
                  ...prev,
                  [selectedMapId]: 0,
                }));
              }}
              className="flex items-center gap-1 rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800/70"
            >
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                className="text-zinc-300"
              >
                <path
                  d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Clear</span>
            </button>
          </div>
        </div>

        {selectedMapId ? (
          <MapCanvas
            mapId={selectedMapId}
            markers={markers}
            activeMarkerType={activeMarkerType}
            activeSquad={activeSquad}
            onPlaceMarker={handlePlaceMarker}
            onRemoveMarker={handleRemoveMarker}
          />
        ) : (
          <div
            style={glassCard}
            className="flex h-64 items-center justify-center px-4 text-sm text-zinc-500"
          >
            Select a map from the list to start placing markers.
          </div>
        )}
      </div>
    </div>
  );
}

function WarPageInner() {
  const [mode, setMode] = useState<WarMode>("deploy");
  const [username, setUsername] = useState<string>("unknown");
  const [selectedDate, setSelectedDate] = useState<string>(todayUTC8());

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_APP_ID;
    if (!clientId) return;
    const sdk = new DiscordSDK(clientId);
    sdk
      .ready()
      .then(async () => {
        try {
          const auth = await (sdk as any).commands.authenticate({
            access_token: "",
          });
          setUsername(auth?.user?.username ?? "unknown");
        } catch {
          setUsername("unknown");
        }
      })
      .catch(() => {
        setUsername("unknown");
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#030711] text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
        <header className="flex flex-col gap-3 border-b border-zinc-800 pb-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-100 md:text-base">
              WAR BOARD
            </h1>
            <p className="text-xs text-zinc-500">Tactical coordination</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              style={glassCard}
              className="flex items-center rounded-full p-1 text-xs"
            >
              <button
                type="button"
                onClick={() => setMode("deploy")}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  mode === "deploy"
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-500"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={16}
                  height={16}
                  className="text-zinc-300"
                >
                  <rect x={3} y={3} width={7} height={7} rx={1} fill="currentColor" />
                  <rect x={14} y={3} width={7} height={7} rx={1} fill="currentColor" />
                  <rect x={3} y={14} width={7} height={7} rx={1} fill="currentColor" />
                  <rect x={14} y={14} width={7} height={7} rx={1} fill="currentColor" />
                </svg>
                <span>DEPLOY</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("map")}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  mode === "map"
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-500"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width={16}
                  height={16}
                  className="text-zinc-300"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="currentColor"
                  />
                </svg>
                <span>MAP</span>
              </button>
            </div>
            {mode === "deploy" && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: "#e2e8f0",
                  padding: "4px 10px",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            )}
            <WarClock />
            <div
              className="rounded-full px-3 py-1 text-xs text-zinc-400"
              style={{
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(148,163,184,0.35)",
              }}
            >
              User: {username}
            </div>
          </div>
        </header>

        <section className="flex-1 pb-4">
          {mode === "deploy" ? (
            <DeployBoard selectedDate={selectedDate} username={username} />
          ) : (
            <MapBoard username={username} />
          )}
        </section>
      </div>
    </main>
  );
}

export default function WarPage() {
  return <WarPageInner />;
}
