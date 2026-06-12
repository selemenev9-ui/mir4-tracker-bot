"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { createClient } from "@supabase/supabase-js";

// Types and constants

type ZoneCategory = "lab" | "valley" | "purgatory" | "mirage" | "tower" | "weekly";

type DiscordAuthenticateResult = {
  user?: {
    username?: string;
  };
};

type DiscordSDKWithCommands = DiscordSDK & {
  commands: {
    authenticate(args: {
      access_token: string;
    }): Promise<DiscordAuthenticateResult>;
  };
};

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
type MarkerType =
  | "attack"
  | "defend"
  | "gather"
  | "support"
  | "retreat"
  | "draw";

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
  w: number;
  h: number;
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

let supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

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
    w: 1003,
    h: 735,
  },
  "bicheon-lab-4f": {
    id: "bicheon-lab-4f",
    name: "Bicheon Lab 4F",
    src: "/maps/war/bicheon-lab-4f.png",
    category: "lab",
    w: 1018,
    h: 733,
  },
  "demonbull-lab-4f": {
    id: "demonbull-lab-4f",
    name: "Demonbull Lab 4F",
    src: "/maps/war/demonbull-lab-4f.png",
    category: "lab",
    w: 1007,
    h: 734,
  },
  "heavens-way-lab-4f": {
    id: "heavens-way-lab-4f",
    name: "Heavens Way Lab 4F",
    src: "/maps/war/heavens-way-lab-4f.png",
    category: "lab",
    w: 1001,
    h: 739,
  },
  "nine-dragon-lab-4f": {
    id: "nine-dragon-lab-4f",
    name: "Nine Dragon Lab 4F",
    src: "/maps/war/nine-dragon-lab-4f.png",
    category: "lab",
    w: 1003,
    h: 729,
  },
  "phantasia-lab-4f": {
    id: "phantasia-lab-4f",
    name: "Phantasia Lab 4F",
    src: "/maps/war/phantasia-lab-4f.png",
    category: "lab",
    w: 1005,
    h: 737,
  },
  "redmoon-lab-4f": {
    id: "redmoon-lab-4f",
    name: "Redmoon Lab 4F",
    src: "/maps/war/redmoon-lab-4f.png",
    category: "lab",
    w: 1002,
    h: 733,
  },
  "rockcut-lab-4f": {
    id: "rockcut-lab-4f",
    name: "Rockcut Lab 4F",
    src: "/maps/war/rockcut-lab-4f.png",
    category: "lab",
    w: 1008,
    h: 735,
  },
  "sabuk-lab-4f": {
    id: "sabuk-lab-4f",
    name: "Sabuk Lab 4F",
    src: "/maps/war/sabuk-lab-4f.png",
    category: "lab",
    w: 1006,
    h: 732,
  },
  "snake-pit-lab-4f": {
    id: "snake-pit-lab-4f",
    name: "Snake Pit Lab 4F",
    src: "/maps/war/snake-pit-lab-4f.png",
    category: "lab",
    w: 999,
    h: 728,
  },
  "bicheon-valley-4f": {
    id: "bicheon-valley-4f",
    name: "Bicheon Valley 4F",
    src: "/maps/war/bicheon-valley-4f.png",
    category: "valley",
    w: 995,
    h: 724,
  },
  "phantasia-valley-4f": {
    id: "phantasia-valley-4f",
    name: "Phantasia Valley 4F",
    src: "/maps/war/phantasia-valley-4f.png",
    category: "valley",
    w: 999,
    h: 736,
  },
  "redmoon-valley-4f": {
    id: "redmoon-valley-4f",
    name: "Redmoon Valley 4F",
    src: "/maps/war/redmoon-valley-4f.png",
    category: "valley",
    w: 1003,
    h: 729,
  },
  "sagitation-valley-4f": {
    id: "sagitation-valley-4f",
    name: "Sagitation Valley 4F",
    src: "/maps/war/sagitation-valley-4f.png",
    category: "valley",
    w: 1004,
    h: 731,
  },
  "snake-valley-4f": {
    id: "snake-valley-4f",
    name: "Snake Valley 4F",
    src: "/maps/war/snake-valley-4f.png",
    category: "valley",
    w: 1000,
    h: 730,
  },
  "purgatory-1f": {
    id: "purgatory-1f",
    name: "Purgatory 1F",
    src: "/maps/war/purgatory-1f.png",
    category: "purgatory",
    w: 928,
    h: 688,
    floor: 1,
  },
  "purgatory-2f": {
    id: "purgatory-2f",
    name: "Purgatory 2F",
    src: "/maps/war/purgatory-2f.png",
    category: "purgatory",
    w: 927,
    h: 687,
    floor: 2,
  },
  "purgatory-3f": {
    id: "purgatory-3f",
    name: "Purgatory 3F",
    src: "/maps/war/purgatory-3f.png",
    category: "purgatory",
    w: 925,
    h: 687,
    floor: 3,
  },
  "purgatory-4f": {
    id: "purgatory-4f",
    name: "Purgatory 4F",
    src: "/maps/war/purgatory-4f.png",
    category: "purgatory",
    w: 925,
    h: 692,
    floor: 4,
  },
  "purgatory-5f": {
    id: "purgatory-5f",
    name: "Purgatory 5F",
    src: "/maps/war/purgatory-5f.png",
    category: "purgatory",
    w: 930,
    h: 689,
    floor: 5,
  },
  "purgatory-6f": {
    id: "purgatory-6f",
    name: "Purgatory 6F",
    src: "/maps/war/purgatory-6f.png",
    category: "purgatory",
    w: 926,
    h: 697,
    floor: 6,
  },
  "purgatory-7f": {
    id: "purgatory-7f",
    name: "Purgatory 7F",
    src: "/maps/war/purgatory-7f.png",
    category: "purgatory",
    w: 925,
    h: 676,
    floor: 7,
  },
  "world1-demon-bull-temple-3f": {
    id: "world1-demon-bull-temple-3f",
    name: "Demon Bull Temple 3F (W1)",
    src: "/maps/war/world1-demon-bull-temple-3f.png",
    category: "mirage",
    w: 1003,
    h: 749,
  },
  "world2-heavens-way-peak": {
    id: "world2-heavens-way-peak",
    name: "Heavens Way Peak (W2)",
    src: "/maps/war/world2-heavens-way-peak.png",
    category: "mirage",
    w: 982,
    h: 751,
  },
  "world3-rockcut-tomb": {
    id: "world3-rockcut-tomb",
    name: "Rockcut Tomb (W3)",
    src: "/maps/war/world3-rockcut-tomb.png",
    category: "mirage",
    w: 1012,
    h: 750,
  },
  "world4-bladehaven-2f": {
    id: "world4-bladehaven-2f",
    name: "Bladehaven 2F (W4)",
    src: "/maps/war/world4-bladehaven-2f.png",
    category: "mirage",
    w: 1004,
    h: 739,
  },
  "world5-illusion-temple": {
    id: "world5-illusion-temple",
    name: "Illusion Temple (W5)",
    src: "/maps/war/world5-illusion-temple.png",
    category: "mirage",
    w: 984,
    h: 753,
  },
  "world6-bicheon-lab": {
    id: "world6-bicheon-lab",
    name: "Bicheon Lab (W6)",
    src: "/maps/war/world6-bicheon-lab.png",
    category: "mirage",
    w: 1006,
    h: 745,
  },
  "world7-redmoon-gorge-3f": {
    id: "world7-redmoon-gorge-3f",
    name: "Redmoon Gorge 3F (W7)",
    src: "/maps/war/world7-redmoon-gorge-3f.png",
    category: "mirage",
    w: 1009,
    h: 743,
  },
  "world8-abandoned-mine-3f": {
    id: "world8-abandoned-mine-3f",
    name: "Abandoned Mine 3F (W8)",
    src: "/maps/war/world8-abandoned-mine-3f.png",
    category: "mirage",
    w: 1006,
    h: 740,
  },
  "tower-black-dragon-1f": {
    id: "tower-black-dragon-1f",
    name: "Tower of Black Dragon 1F",
    src: "/maps/war/tower-black-dragon.jpg",
    category: "tower",
    w: 1016,
    h: 603,
    floor: 1,
  },
  "tower-black-dragon-2f": {
    id: "tower-black-dragon-2f",
    name: "Tower of Black Dragon 2F",
    src: "/maps/war/tower-black-dragon.jpg",
    category: "tower",
    w: 1016,
    h: 603,
    floor: 2,
  },
  "tower-black-dragon-3f": {
    id: "tower-black-dragon-3f",
    name: "Tower of Black Dragon 3F",
    src: "/maps/war/tower-black-dragon.jpg",
    category: "tower",
    w: 1016,
    h: 603,
    floor: 3,
  },
  "tower-black-dragon-4f": {
    id: "tower-black-dragon-4f",
    name: "Tower of Black Dragon 4F",
    src: "/maps/war/tower-black-dragon.jpg",
    category: "tower",
    w: 1016,
    h: 603,
    floor: 4,
  },
};

const MAP_SORT_ORDER: Record<string, number> = {
  // Labyrinths — weakest to strongest
  "demonbull-lab-4f": 1,
  "bicheon-lab-4f": 2,
  "snake-pit-lab-4f": 3,
  "abandoned-mine-lab-4f": 4,
  "heavens-way-lab-4f": 5,
  "redmoon-lab-4f": 6,
  "phantasia-lab-4f": 7,
  "rockcut-lab-4f": 8,
  "sabuk-lab-4f": 9,
  "nine-dragon-lab-4f": 10,

  // Valleys — same regional order
  "bicheon-valley-4f": 1,
  "snake-valley-4f": 2,
  "redmoon-valley-4f": 3,
  "phantasia-valley-4f": 4,
  "sagitation-valley-4f": 5,

  // Purgatory — by floor
  "purgatory-1f": 1,
  "purgatory-2f": 2,
  "purgatory-3f": 3,
  "purgatory-4f": 4,
  "purgatory-5f": 5,
  "purgatory-6f": 6,
  "purgatory-7f": 7,

  // Mirage — by world number
  "world1-demon-bull-temple-3f": 1,
  "world2-heavens-way-peak": 2,
  "world3-rockcut-tomb": 3,
  "world4-bladehaven-2f": 4,
  "world5-illusion-temple": 5,
  "world6-bicheon-lab": 6,
  "world7-redmoon-gorge-3f": 7,
  "world8-abandoned-mine-3f": 8,

  // Tower — by floor
  "tower-black-dragon-1f": 1,
  "tower-black-dragon-2f": 2,
  "tower-black-dragon-3f": 3,
  "tower-black-dragon-4f": 4,
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
  if (type === "draw") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
  squadNames,
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
  squadNames: Record<Squad, string>;
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
              title={squadNames[sq]}
            >
              {sq}
            </button>
          );
        })}
      </div>
      {current?.assigned_by && current.squad && (
        <span className="ml-2 text-[10px] text-zinc-500">
          {current.assigned_by}
          {" "+"\u00b7"+" "}
          {squadNames[current.squad]}
        </span>
      )}
    </div>
  );
}

function DeployBoard({
  selectedDate,
  username,
  squadNames,
  updateSquadName,
}: {
  selectedDate: string;
  username: string;
  squadNames: Record<Squad, string>;
  updateSquadName: (squad: Squad, name: string) => void;
}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [inputValues, setInputValues] = useState<Record<Squad, string>>(squadNames);

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
    const initialLoad = window.setTimeout(() => {
      void loadAssignments();
    }, 0);
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
    const pollInterval = window.setInterval(() => {
      void loadAssignments();
    }, 5000);
    return () => {
      window.clearTimeout(initialLoad);
      supabase.removeChannel(channel);
      window.clearInterval(pollInterval);
    };
  }, [loadAssignments, selectedDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValues(squadNames);
  }, [squadNames]);

  const zonesForDay = getZonesForDate(selectedDate);

  return (
    <section className="grid gap-3">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {SQUADS.map((sq) => (
          <div
            key={sq}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: SQUAD_COLORS[sq],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              {sq}
            </span>
            <input
              value={inputValues[sq]}
              onChange={(e) =>
                setInputValues((prev) => ({ ...prev, [sq]: e.target.value }))
              }
              onBlur={() => updateSquadName(sq, inputValues[sq])}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateSquadName(sq, inputValues[sq]);
                }
              }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                color: "#e2e8f0",
                padding: "2px 8px",
                fontSize: 11,
                width: 100,
                outline: "none",
              }}
              maxLength={16}
              placeholder={`Squad ${sq}`}
            />
          </div>
        ))}
      </div>
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
              squadNames={squadNames}
            />
            <RoleRow
              zoneId={zone.id}
              role="defend"
              roleColor={colorCfg.color}
              assignments={assignments}
              onAssign={handleAssign}
              squadNames={squadNames}
            />
            <RoleRow
              zoneId={zone.id}
              role="support"
              roleColor={colorCfg.color}
              assignments={assignments}
              onAssign={handleAssign}
              squadNames={squadNames}
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
  isDrawMode: boolean;
  onPlaceDraw: (p: {
    mapId: string;
    path: Array<{ x: number; y: number }>;
    color: string;
  }) => void;
}

function MapCanvas({
  mapId,
  markers,
  activeMarkerType,
  activeSquad,
  onPlaceMarker,
  onRemoveMarker,
  isDrawMode,
  onPlaceDraw,
}: MapCanvasProps) {
  const mapFile = MAP_FILES[mapId];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imgRect, setImgRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawPathRef = useRef<Array<{ x: number; y: number }>>([]);
  const isDrawingRef = useRef(false);
  const activeSquadRef = useRef(activeSquad);

  useEffect(() => {
    activeSquadRef.current = activeSquad;
  }, [activeSquad]);

  useEffect(() => {
    const compute = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cW = rect.width || container.clientWidth;
      const cH = rect.height || container.clientHeight;
      if (!cW || !cH) return;
      const scale = Math.min(cW / mapFile.w, cH / mapFile.h);
      const w = mapFile.w * scale;
      const h = mapFile.h * scale;
      setImgRect({ x: (cW - w) / 2, y: (cH - h) / 2, w, h });
    };

    const observer = new ResizeObserver(compute);
    if (containerRef.current) observer.observe(containerRef.current);

    const t1 = window.setTimeout(compute, 300);
    const t2 = window.setTimeout(compute, 1000);

    return () => {
      observer.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [mapId]);

  function getCoords(
    e: React.MouseEvent<HTMLDivElement>
  ): { x_pct: number; y_pct: number } | null {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const cW = rect.width || containerRef.current.clientWidth;
    const cH = rect.height || containerRef.current.clientHeight;
    if (!cW || !cH) return null;

    const nW = mapFile.w;
    const nH = mapFile.h;
    const scale = Math.min(cW / nW, cH / nH);
    const renderedW = nW * scale;
    const renderedH = nH * scale;
    const offsetX = (cW - renderedW) / 2;
    const offsetY = (cH - renderedH) / 2;

    const clickX = e.clientX - rect.left - offsetX;
    const clickY = e.clientY - rect.top - offsetY;

    if (clickX < 0 || clickY < 0 || clickX > renderedW || clickY > renderedH) {
      return null;
    }

    const x_pct = (clickX / renderedW) * 100;
    const y_pct = (clickY / renderedH) * 100;

    setImgRect({ x: offsetX, y: offsetY, w: renderedW, h: renderedH });

    return { x_pct, y_pct };
  }

  function getCanvasCoords(clientX: number, clientY: number): { x: number; y: number } | null {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const cW = rect.width || containerRef.current.clientWidth;
    const cH = rect.height || containerRef.current.clientHeight;
    if (!cW || !cH) return null;
    const scale = Math.min(cW / mapFile.w, cH / mapFile.h);
    const renderedW = mapFile.w * scale;
    const renderedH = mapFile.h * scale;
    const offsetX = (cW - renderedW) / 2;
    const offsetY = (cH - renderedH) / 2;
    const x = clientX - rect.left - offsetX;
    const y = clientY - rect.top - offsetY;
    if (x < 0 || y < 0 || x > renderedW || y > renderedH) return null;
    return { x: (x / renderedW) * 100, y: (y / renderedH) * 100 };
  }

  function redrawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pts = rawPathRef.current;
    if (pts.length < 2) return;
    const cW = canvas.width;
    const cH = canvas.height;
    ctx.beginPath();
    ctx.strokeStyle = SQUAD_COLORS[activeSquadRef.current];
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.85;
    ctx.moveTo((pts[0].x / 100) * cW, (pts[0].y / 100) * cH);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo((pts[i].x / 100) * cW, (pts[i].y / 100) * cH);
    }
    ctx.stroke();
  }

  function finishDrawing() {
    isDrawingRef.current = false;
    const path = rawPathRef.current;
    rawPathRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    if (path.length >= 2) {
      onPlaceDraw({
        mapId,
        path,
        color: SQUAD_COLORS[activeSquadRef.current],
      });
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isDrawMode) {
      const pt = getCanvasCoords(e.clientX, e.clientY);
      if (!pt) return;
      isDrawingRef.current = true;
      rawPathRef.current = [pt];
      return;
    }

    if (e.button !== 0) return;
    const coords = getCoords(e);
    if (!coords) return;
    onPlaceMarker({
      mapId,
      marker_type: activeMarkerType,
      x_pct: coords.x_pct,
      y_pct: coords.y_pct,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawMode || !isDrawingRef.current) return;
    const pt = getCanvasCoords(e.clientX, e.clientY);
    if (!pt) return;
    rawPathRef.current.push(pt);
    redrawCanvas();
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawMode || !isDrawingRef.current) return;
    finishDrawing();
  };

  const handleMouseLeave = () => {
    if (isDrawMode && isDrawingRef.current) {
      finishDrawing();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    if (isDrawMode) {
      const pt = getCanvasCoords(touch.clientX, touch.clientY);
      if (!pt) return;
      isDrawingRef.current = true;
      rawPathRef.current = [pt];
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cW = rect.width || container.clientWidth;
    const cH = rect.height || container.clientHeight;
    if (!cW || !cH) return;
    const scale = Math.min(cW / mapFile.w, cH / mapFile.h);
    const renderedW = mapFile.w * scale;
    const renderedH = mapFile.h * scale;
    const offsetX = (cW - renderedW) / 2;
    const offsetY = (cH - renderedH) / 2;
    const x = touch.clientX - rect.left - offsetX;
    const y = touch.clientY - rect.top - offsetY;
    if (x < 0 || y < 0 || x > renderedW || y > renderedH) return;
    setImgRect({ x: offsetX, y: offsetY, w: renderedW, h: renderedH });
    onPlaceMarker({
      mapId,
      marker_type: activeMarkerType,
      x_pct: (x / renderedW) * 100,
      y_pct: (y / renderedH) * 100,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDrawMode || !isDrawingRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const pt = getCanvasCoords(touch.clientX, touch.clientY);
    if (!pt) return;
    rawPathRef.current.push(pt);
    redrawCanvas();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDrawMode || !isDrawingRef.current) return;
    finishDrawing();
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDragStart={(e) => e.preventDefault()}
      className={`relative w-full ${
        isDrawMode ? "cursor-cell" : "cursor-crosshair"
      }`}
      style={{
        aspectRatio: "4/3",
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid rgba(148,163,184,0.2)",
        background: "#020617",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "none",
      }}
    >
      <Image
        src={mapFile.src}
        alt={mapFile.name}
        fill
        style={{ objectFit: "contain" }}
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onLoad={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const cW = rect.width || containerRef.current.clientWidth;
          const cH = rect.height || containerRef.current.clientHeight;
          if (!cW || !cH) return;
          const scale = Math.min(cW / mapFile.w, cH / mapFile.h);
          const renderedW = mapFile.w * scale;
          const renderedH = mapFile.h * scale;
          const offsetX = (cW - renderedW) / 2;
          const offsetY = (cH - renderedH) / 2;
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
          if (m.marker_type === "draw" && m.label && imgRect.w && imgRect.h) {
            let pts: Array<{ x: number; y: number }> = [];
            try {
              pts = JSON.parse(m.label) as Array<{ x: number; y: number }>;
            } catch {
              pts = [];
            }
            if (pts.length < 2) return null;
            const points = pts
              .map(
                (p) =>
                  `${(p.x / 100) * imgRect.w},${(p.y / 100) * imgRect.h}`
              )
              .join(" ");
            return (
              <g
                key={m.id}
                style={{ cursor: "pointer", pointerEvents: "all" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMarker(m.id);
                }}
              >
                <polyline
                  points={points}
                  fill="none"
                  stroke={m.color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.85}
                />
              </g>
            );
          }

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
      <canvas
        ref={canvasRef}
        width={imgRect.w || 800}
        height={imgRect.h || 600}
        style={{
          position: "absolute",
          left: imgRect.x,
          top: imgRect.y,
          width: imgRect.w || "100%",
          height: imgRect.h || "100%",
          pointerEvents: "none",
        }}
      />
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
  draw: { label: "Draw", color: "#f8fafc" },
};

function MapBoard({
  username,
  squadNames,
}: {
  username: string;
  squadNames: Record<Squad, string>;
}) {
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
  const [lastActionId, setLastActionId] = useState<string | null>(null);
  const [clearPending, setClearPending] = useState(false);

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
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const tempMarker: MapMarker = {
        id: tempId,
        map_id: params.mapId,
        marker_type: params.marker_type,
        x_pct: params.x_pct,
        y_pct: params.y_pct,
        color: SQUAD_COLORS[activeSquad],
        label: null,
        placed_by: username,
      };

      setMarkers((prev) => [...prev, tempMarker]);

      try {
        const { data, error } = await supabase
          .from("war_map_markers")
          .insert({
            map_id: params.mapId,
            marker_type: params.marker_type,
            x_pct: params.x_pct,
            y_pct: params.y_pct,
            color: SQUAD_COLORS[activeSquad],
            placed_by: username,
          })
          .select()
          .single();

        if (error) {
          setMarkers((prev) => prev.filter((m) => m.id !== tempId));
          console.error("marker insert failed:", error);
          return;
        }

        if (data) {
          const realMarker = data as MapMarker;
          setMarkers((prev) =>
            prev.map((m) => (m.id === tempId ? realMarker : m))
          );
          setLastActionId(realMarker.id);
        }
      } catch (err) {
        setMarkers((prev) => prev.filter((m) => m.id !== tempId));
        console.error("supabase exception:", err);
      }
    },
    [activeSquad, username]
  );

  const handleRemoveMarker = useCallback(async (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
    try {
      await supabase.from("war_map_markers").delete().eq("id", id);
    } catch (err) {
      console.error("supabase exception:", err);
    }
  }, []);

  const handleUndo = useCallback(async () => {
    if (!lastActionId) return;
    setMarkers((prev) => prev.filter((m) => m.id !== lastActionId));
    try {
      await supabase.from("war_map_markers").delete().eq("id", lastActionId);
      setLastActionId(null);
    } catch (err) {
      console.error("supabase exception:", err);
    }
  }, [lastActionId]);

  // NOTE: Supabase table must allow marker_type = 'draw'
  // Run this SQL in Supabase dashboard if drawings disappear:
  // ALTER TABLE war_map_markers DROP CONSTRAINT IF EXISTS war_map_markers_marker_type_check;
  // ALTER TABLE war_map_markers ADD CONSTRAINT war_map_markers_marker_type_check
  //   CHECK (marker_type IN ('attack','defend','gather','support','retreat','draw'));

  const handlePlaceDraw = useCallback(
    async ({
      mapId,
      path,
      color,
    }: {
      mapId: string;
      path: Array<{ x: number; y: number }>;
      color: string;
    }) => {
      const tempId = `temp-draw-${Date.now()}`;
      const optimistic: MapMarker = {
        id: tempId,
        map_id: mapId,
        marker_type: "draw",
        x_pct: path[0]?.x ?? 0,
        y_pct: path[0]?.y ?? 0,
        color,
        label: JSON.stringify(path),
        placed_by: username,
      };

      setMarkers((prev) => [...prev, optimistic]);

      try {
        const { data, error } = await supabase
          .from("war_map_markers")
          .insert({
            map_id: mapId,
            marker_type: "draw" as MarkerType,
            x_pct: path[0]?.x ?? 0,
            y_pct: path[0]?.y ?? 0,
            color,
            label: JSON.stringify(path),
            placed_by: username,
          })
          .select()
          .single();

        if (error) {
          setMarkers((prev) => prev.filter((m) => m.id !== tempId));
          console.error("draw insert failed:", error);
          return;
        }

        if (data) {
          const real = data as MapMarker;
          setMarkers((prev) =>
            prev.map((m) => (m.id === tempId ? real : m))
          );
        }
      } catch (err) {
        setMarkers((prev) => prev.filter((m) => m.id !== tempId));
        console.error("supabase exception:", err);
      }
    },
    [username]
  );

  useEffect(() => {
    if (!selectedMapId) return;
    const initialLoad = window.setTimeout(() => {
      void loadMarkers(selectedMapId);
    }, 0);
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
    const pollInterval = window.setInterval(() => {
      void loadMarkers(selectedMapId);
    }, 5000);
    return () => {
      window.clearTimeout(initialLoad);
      supabase.removeChannel(channel);
      window.clearInterval(pollInterval);
    };
  }, [loadMarkers, selectedMapId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "1") setActiveMarkerType("attack");
      if (e.key === "2") setActiveMarkerType("defend");
      if (e.key === "3") setActiveMarkerType("gather");
      if (e.key === "4") setActiveMarkerType("support");
      if (e.key === "5") setActiveMarkerType("retreat");
      if (e.key === "d" || e.key === "D") setActiveMarkerType("draw");
      if (e.key === "z" || e.key === "Z") void handleUndo();
      if (e.key === "Escape") setClearPending(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo]);

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
    .filter((m) => {
      if (m.category !== "tower") return true;
      return m.id === "tower-black-dragon-1f";
    })
    .sort(
      (a, b) => (MAP_SORT_ORDER[a.id] ?? 99) - (MAP_SORT_ORDER[b.id] ?? 99)
    );

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div
          className="mb-2 flex gap-1 overflow-x-auto rounded-full border border-zinc-800 bg-zinc-950/60 px-1 py-1 text-xs [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categoryTabs.map((tab) => {
            const active = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className="rounded-full font-medium"
                style={{
                  background: active
                    ? "rgba(239,68,68,0.16)"
                    : "transparent",
                  border: active
                    ? "1px solid rgba(239,68,68,0.5)"
                    : "1px solid transparent",
                  color: active ? "#fca5a5" : "#9ca3af",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  padding: "4px 10px",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ width: "100%" }}>
          <select
            value={selectedMapId ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedMapId(value === "" ? null : value);
            }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          >
            <option value="">— Select a map —</option>
            {filteredMaps.map((map) => {
              const count = markerCounts[map.id] ?? 0;
              const label =
                count > 0 ? `${map.name} (${count})` : map.name;
              return (
                <option key={map.id} value={map.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
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
                  className="flex items-center gap-1 rounded-full"
                  style={{
                    border: active
                      ? `1px solid ${cfg.color}`
                      : "1px solid rgba(148,163,184,0.4)",
                    background: active
                      ? "rgba(15,23,42,0.9)"
                      : "transparent",
                    color: "#e5e7eb",
                    padding: "5px 10px",
                    fontSize: 11,
                    borderRadius: 8,
                  }}
                >
                  <MarkerIcon type={type} color={cfg.color} size={14} />
                  <span className="hidden sm:inline" style={{ marginLeft: 4 }}>
                    {cfg.label}
                  </span>
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
                      width: 28,
                      height: 28,
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
              <span
                style={{
                  fontSize: 10,
                  color: SQUAD_COLORS[activeSquad],
                  marginLeft: 4,
                }}
              >
                {squadNames[activeSquad]}
              </span>
            </div>
            {lastActionId !== null && (
              <button
                type="button"
                onClick={handleUndo}
                className="flex items-center gap-1 rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800/70"
              >
                <svg
                  viewBox="0 0 24 24"
                  width={14}
                  height={14}
                  className="text-zinc-300"
                >
                  <path
                    d="M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 010 11H11"
                    stroke="currentColor"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Undo</span>
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                if (!selectedMapId) return;
                if (!clearPending) {
                  setClearPending(true);
                  window.setTimeout(() => setClearPending(false), 3000);
                  return;
                }
                await supabase
                  .from("war_map_markers")
                  .delete()
                  .eq("map_id", selectedMapId);
                setMarkers([]);
                setMarkerCounts((prev) => ({
                  ...prev,
                  [selectedMapId]: 0,
                }));
                setLastActionId(null);
                setClearPending(false);
              }}
              className="flex items-center gap-1 rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800/70"
              style={{
                borderColor: clearPending
                  ? "rgba(239,68,68,0.7)"
                  : undefined,
                background: clearPending ? "rgba(239,68,68,0.2)" : undefined,
                color: clearPending ? "#f9a8d4" : undefined,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                className={clearPending ? "text-pink-300" : "text-zinc-300"}
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
              <span>{clearPending ? "Confirm?" : "Clear"}</span>
            </button>
          </div>
        </div>

        <div className="hidden sm:flex gap-3 text-[10px] text-zinc-600 px-1">
          <span>1–5 = tools</span>
          <span>D = draw</span>
          <span>Z = undo</span>
        </div>

        {selectedMapId ? (
          <MapCanvas
            mapId={selectedMapId}
            markers={markers}
            activeMarkerType={activeMarkerType}
            activeSquad={activeSquad}
            onPlaceMarker={handlePlaceMarker}
            onRemoveMarker={handleRemoveMarker}
            isDrawMode={activeMarkerType === "draw"}
            onPlaceDraw={handlePlaceDraw}
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
  const [squadNames, setSquadNames] = useState<Record<Squad, string>>({
    A: "Squad A",
    B: "Squad B",
    C: "Squad C",
    D: "Squad D",
    E: "Squad E",
    F: "Squad F",
  });

  useEffect(() => {
    try {
      const sdk = new DiscordSDK(
        process.env.NEXT_PUBLIC_DISCORD_APP_ID ??
          process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ??
          "",
      );
      sdk
        .ready()
        .then(async () => {
          const discordSdk = sdk as DiscordSDKWithCommands;
          supabase = createClient(
            `${window.location.origin}/supabase`,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          );

          try {
            const auth = await discordSdk.commands.authenticate({
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
    } catch {
      window.setTimeout(() => setUsername("unknown"), 0);
    }
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("mir4_squad_names");
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Record<Squad, string>>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSquadNames((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const updateSquadName = useCallback((squad: Squad, name: string) => {
    setSquadNames((prev) => {
      const next = { ...prev, [squad]: name.trim() || `Squad ${squad}` };
      try {
        window.localStorage.setItem("mir4_squad_names", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
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
            <DeployBoard
              selectedDate={selectedDate}
              username={username}
              squadNames={squadNames}
              updateSquadName={updateSquadName}
            />
          ) : (
            <MapBoard username={username} squadNames={squadNames} />
          )}
        </section>
      </div>
    </main>
  );
}

export default function WarPage() {
  return <WarPageInner />;
}
