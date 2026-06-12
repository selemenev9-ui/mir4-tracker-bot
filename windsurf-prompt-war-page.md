# Windsurf Agent Prompt — /war Tactical War Page

## CONTEXT

You are working in the Next.js 16.2.9 App Router project at `mir4-tracker-bot.vercel.app`.
Stack: React 19, TypeScript, Tailwind CSS v4, Supabase JS v2, `@discord/embedded-app-sdk`.
No external icon libraries are installed — use **inline SVG only** for all icons and visual elements.
**Zero emojis anywhere** — not in code, not in labels, not in comments.

Existing design language (from `src/app/layout.tsx` and `src/app/page.tsx`):
- Dark background `#030711`
- Glass cards: `background: radial-gradient(...), rgba(15,23,42,0.92)`, `border: 1px solid rgba(148,163,184,0.35)`
- Three animated orbs (purple, cyan, red) already in layout — do NOT add more orbs
- Font: Geist (already loaded in layout)
- Color palette: zinc grays, emerald/cyan/violet/amber/red accents
- Supabase client: import from `@/lib/supabase`

---

## CREATE `src/app/war/page.tsx`

> Note: Supabase tables (`war_assignments`, `war_map_markers`) are already created.
> Map images are already in `public/maps/war/` with correct filenames.

Create a single file `src/app/war/page.tsx` with `"use client"` at the top.

---

### IMPORTS

```tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DiscordSDK } from "@discord/embedded-app-sdk";
import { createClient } from "@supabase/supabase-js";
```

Get the Supabase client the same way as `src/lib/supabase.ts` (import from `@/lib/supabase`).

---

### DATA DEFINITIONS

#### Zone Type Visual Badges (inline SVG, no emoji)

```ts
type ZoneCategory = "lab" | "valley" | "purgatory" | "mirage" | "tower" | "weekly";

const ZONE_CATEGORY_CONFIG: Record<ZoneCategory, {
  label: string;
  color: string;       // tailwind text color
  bgColor: string;     // rgba bg
  borderColor: string; // rgba border
  icon: string;        // inline SVG path d= string
}> = {
  lab: {
    label: "Labyrinth",
    color: "#22d3ee",
    bgColor: "rgba(34,211,238,0.12)",
    borderColor: "rgba(34,211,238,0.35)",
    // hexagon shape
    icon: `M12 2 L20.66 7 L20.66 17 L12 22 L3.34 17 L3.34 7 Z`,
  },
  valley: {
    label: "Valley",
    color: "#4ade80",
    bgColor: "rgba(74,222,128,0.12)",
    borderColor: "rgba(74,222,128,0.35)",
    // shield shape
    icon: `M12 2 L20 5 L20 12 C20 17 16 20.5 12 22 C8 20.5 4 17 4 12 L4 5 Z`,
  },
  purgatory: {
    label: "Purgatory",
    color: "#f87171",
    bgColor: "rgba(248,113,113,0.12)",
    borderColor: "rgba(248,113,113,0.35)",
    // flame shape
    icon: `M12 2 C12 2 17 8 17 13 C17 16.31 14.76 19.11 12 20 C9.24 19.11 7 16.31 7 13 C7 10 9 7 9 7 C9 7 10 10 12 10 C12 10 11 6 12 2 Z`,
  },
  mirage: {
    label: "Mirage",
    color: "#a78bfa",
    bgColor: "rgba(167,139,250,0.12)",
    borderColor: "rgba(167,139,250,0.35)",
    // diamond/crystal shape
    icon: `M12 2 L22 12 L12 22 L2 12 Z`,
  },
  tower: {
    label: "Domination",
    color: "#fbbf24",
    bgColor: "rgba(251,191,36,0.12)",
    borderColor: "rgba(251,191,36,0.35)",
    // tower/castle battlement shape
    icon: `M4 22 L4 8 L7 8 L7 5 L10 5 L10 8 L14 8 L14 5 L17 5 L17 8 L20 8 L20 22 Z`,
  },
  weekly: {
    label: "Weekly Boss",
    color: "#fb923c",
    bgColor: "rgba(251,146,60,0.12)",
    borderColor: "rgba(251,146,60,0.35)",
    // star shape (5-point)
    icon: `M12 2 L14.09 8.26 L20.63 8.27 L15.45 12.14 L17.54 18.4 L12 14.77 L6.46 18.4 L8.55 12.14 L3.37 8.27 L9.91 8.26 Z`,
  },
};
```

#### Squad Config

```ts
const SQUADS = ["A", "B", "C", "D", "E", "F"] as const;
type Squad = typeof SQUADS[number];

const SQUAD_COLORS: Record<Squad, string> = {
  A: "#ef4444",
  B: "#3b82f6",
  C: "#22c55e",
  D: "#eab308",
  E: "#8b5cf6",
  F: "#f97316",
};
```

#### War Zone Definitions

```ts
interface WarZone {
  id: string;
  name: string;
  category: ZoneCategory;
  scheduleLabel: string;     // human-readable, no emoji
  scheduleTimes: string[];   // e.g. ["10:00", "20:00"]
  scheduleType: "daily" | "weekly";
  weekday?: number;          // 0=Sun 1=Mon ... 6=Sat, for weekly
  mapIds: string[];          // keys into MAP_FILES
  description?: string;
}

const WAR_ZONES: WarZone[] = [
  // ── LABYRINTHS (daily 10:00 + 20:00 UTC+8) ─────────────────────────────
  {
    id: "abandoned-mine-lab",
    name: "Abandoned Mine Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["abandoned-mine-lab-4f"],
  },
  {
    id: "bicheon-lab",
    name: "Bicheon Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["bicheon-lab-4f"],
  },
  {
    id: "demonbull-lab",
    name: "Demonbull Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["demonbull-lab-4f"],
  },
  {
    id: "heavens-way-lab",
    name: "Heavens Way Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["heavens-way-lab-4f"],
  },
  {
    id: "nine-dragon-lab",
    name: "Nine Dragon Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["nine-dragon-lab-4f"],
  },
  {
    id: "phantasia-lab",
    name: "Phantasia Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["phantasia-lab-4f"],
  },
  {
    id: "redmoon-lab",
    name: "Redmoon Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["redmoon-lab-4f"],
  },
  {
    id: "rockcut-lab",
    name: "Rockcut Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["rockcut-lab-4f"],
  },
  {
    id: "sabuk-lab",
    name: "Sabuk Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["sabuk-lab-4f"],
  },
  {
    id: "snake-pit-lab",
    name: "Snake Pit Labyrinth 4F",
    category: "lab",
    scheduleLabel: "Daily 10:00 / 20:00",
    scheduleTimes: ["10:00", "20:00"],
    scheduleType: "daily",
    mapIds: ["snake-pit-lab-4f"],
  },

  // ── VALLEYS (daily 12:00 + 22:00 UTC+8) ───────────────────────────────
  {
    id: "bicheon-valley",
    name: "Bicheon Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    mapIds: ["bicheon-valley-4f"],
    description: "Krukan portal opens Monday 22:00",
  },
  {
    id: "phantasia-valley",
    name: "Phantasia Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    mapIds: ["phantasia-valley-4f"],
    description: "Turkan portal opens Thursday 23:00",
  },
  {
    id: "redmoon-valley",
    name: "Redmoon Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    mapIds: ["redmoon-valley-4f"],
    description: "Nerkan portal opens Tuesday 23:00",
  },
  {
    id: "sagitation-valley",
    name: "Sagitation Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    mapIds: ["sagitation-valley-4f"],
  },
  {
    id: "snake-valley",
    name: "Snake Valley 4F",
    category: "valley",
    scheduleLabel: "Daily 12:00 / 22:00",
    scheduleTimes: ["12:00", "22:00"],
    scheduleType: "daily",
    mapIds: ["snake-valley-4f"],
    description: "Utukan portal opens Friday 22:00",
  },

  // ── WEEKLY WORLD BOSSES ────────────────────────────────────────────────
  {
    id: "krukan",
    name: "Krukan — Bicheon Valley 4F",
    category: "weekly",
    scheduleLabel: "Monday 22:00",
    scheduleTimes: ["22:00"],
    scheduleType: "weekly",
    weekday: 1,
    mapIds: ["bicheon-valley-4f"],
    description: "Demon Spider of Hell — Shackling Abaddon portal",
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
    description: "All clan members participate — 22:00–23:00",
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
    id: "utukan",
    name: "Utukan — Snake Valley 4F",
    category: "weekly",
    scheduleLabel: "Friday 22:00",
    scheduleTimes: ["22:00"],
    scheduleType: "weekly",
    weekday: 5,
    mapIds: ["snake-valley-4f"],
    description: "Crimson Emperor — Crimson Abaddon portal",
  },

  // ── PURGATORY (daily 06:00 / 12:00 / 18:00 / 24:00 UTC+8) ─────────────
  {
    id: "purgatory",
    name: "Purgatory — All Floors",
    category: "purgatory",
    scheduleLabel: "Daily 06:00 / 12:00 / 18:00 / 00:00",
    scheduleTimes: ["06:00", "12:00", "18:00", "00:00"],
    scheduleType: "daily",
    mapIds: [
      "purgatory-1f","purgatory-2f","purgatory-3f","purgatory-4f",
      "purgatory-5f","purgatory-6f","purgatory-7f"
    ],
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
    description: "Special boss on Purgatory floor 7",
  },

  // ── MIRAGE REGION ──────────────────────────────────────────────────────
  {
    id: "mirage-void-bull",
    name: "Void Bull Specter — Demon Bull Temple 3F",
    category: "mirage",
    scheduleLabel: "Permanent field boss",
    scheduleTimes: [],
    scheduleType: "daily",
    mapIds: ["world1-demon-bull-temple-3f"],
    description: "Layer 1 — World 1 danger zone permanent boss",
  },
  {
    id: "mirage-ice-demon",
    name: "Heavenly Ice Demon — Abandoned Mine 3F",
    category: "mirage",
    scheduleLabel: "Permanent field boss",
    scheduleTimes: [],
    scheduleType: "daily",
    mapIds: ["world8-abandoned-mine-3f"],
    description: "Layer 8 — World 8 danger zone permanent boss",
  },
  {
    id: "rallying-of-void",
    name: "Rallying of the Void — Mirage Ship",
    category: "weekly",
    scheduleLabel: "Thursday 23:00",
    scheduleTimes: ["23:00"],
    scheduleType: "weekly",
    weekday: 4,
    mapIds: [],
    description: "Mirage Ship event — 23:00–00:00",
  },

  // ── TOWER OF BLACK DRAGON (Domination Server) ──────────────────────────
  {
    id: "tower-juja",
    name: "Tower — Juja Neoul",
    category: "tower",
    scheduleLabel: "Daily 11:00 / 17:00 / 23:00",
    scheduleTimes: ["11:00", "17:00", "23:00"],
    scheduleType: "daily",
    mapIds: [
      "tower-black-dragon-1f","tower-black-dragon-2f",
      "tower-black-dragon-3f","tower-black-dragon-4f"
    ],
    description: "Tower of Black Dragon — all 4 floors",
  },
  {
    id: "tower-wraiths",
    name: "Tower — Living Wraiths",
    category: "tower",
    scheduleLabel: "Daily 10:00/12:00/16:00/18:00/22:00/00:00",
    scheduleTimes: ["10:00","12:00","16:00","18:00","22:00","00:00"],
    scheduleType: "daily",
    mapIds: [
      "tower-black-dragon-1f","tower-black-dragon-2f",
      "tower-black-dragon-3f","tower-black-dragon-4f"
    ],
    description: "Tower of Black Dragon wraith events",
  },
];
```

#### Map File Registry

```ts
interface MapFile {
  id: string;
  name: string;
  src: string;   // path under /maps/war/
  category: ZoneCategory;
  floor?: number;
}

const MAP_FILES: Record<string, MapFile> = {
  // Labyrinths
  "abandoned-mine-lab-4f":  { id: "abandoned-mine-lab-4f",  name: "Abandoned Mine Lab 4F",  src: "/maps/war/abandoned-mine-lab-4f.png",  category: "lab" },
  "bicheon-lab-4f":         { id: "bicheon-lab-4f",          name: "Bicheon Lab 4F",          src: "/maps/war/bicheon-lab-4f.png",          category: "lab" },
  "demonbull-lab-4f":       { id: "demonbull-lab-4f",        name: "Demonbull Lab 4F",        src: "/maps/war/demonbull-lab-4f.png",        category: "lab" },
  "heavens-way-lab-4f":     { id: "heavens-way-lab-4f",      name: "Heavens Way Lab 4F",      src: "/maps/war/heavens-way-lab-4f.png",      category: "lab" },
  "nine-dragon-lab-4f":     { id: "nine-dragon-lab-4f",      name: "Nine Dragon Lab 4F",      src: "/maps/war/nine-dragon-lab-4f.png",      category: "lab" },
  "phantasia-lab-4f":       { id: "phantasia-lab-4f",        name: "Phantasia Lab 4F",        src: "/maps/war/phantasia-lab-4f.png",        category: "lab" },
  "redmoon-lab-4f":         { id: "redmoon-lab-4f",          name: "Redmoon Lab 4F",          src: "/maps/war/redmoon-lab-4f.png",          category: "lab" },
  "rockcut-lab-4f":         { id: "rockcut-lab-4f",          name: "Rockcut Lab 4F",          src: "/maps/war/rockcut-lab-4f.png",          category: "lab" },
  "sabuk-lab-4f":           { id: "sabuk-lab-4f",            name: "Sabuk Lab 4F",            src: "/maps/war/sabuk-lab-4f.png",            category: "lab" },
  "snake-pit-lab-4f":       { id: "snake-pit-lab-4f",        name: "Snake Pit Lab 4F",        src: "/maps/war/snake-pit-lab-4f.png",        category: "lab" },
  // Valleys
  "bicheon-valley-4f":      { id: "bicheon-valley-4f",       name: "Bicheon Valley 4F",       src: "/maps/war/bicheon-valley-4f.png",       category: "valley" },
  "phantasia-valley-4f":    { id: "phantasia-valley-4f",     name: "Phantasia Valley 4F",     src: "/maps/war/phantasia-valley-4f.png",     category: "valley" },
  "redmoon-valley-4f":      { id: "redmoon-valley-4f",       name: "Redmoon Valley 4F",       src: "/maps/war/redmoon-valley-4f.png",       category: "valley" },
  "sagitation-valley-4f":   { id: "sagitation-valley-4f",    name: "Sagitation Valley 4F",    src: "/maps/war/sagitation-valley-4f.png",    category: "valley" },
  "snake-valley-4f":        { id: "snake-valley-4f",         name: "Snake Valley 4F",         src: "/maps/war/snake-valley-4f.png",         category: "valley" },
  // Purgatory
  "purgatory-1f":           { id: "purgatory-1f",  name: "Purgatory 1F",  src: "/maps/war/purgatory-1f.png",  category: "purgatory", floor: 1 },
  "purgatory-2f":           { id: "purgatory-2f",  name: "Purgatory 2F",  src: "/maps/war/purgatory-2f.png",  category: "purgatory", floor: 2 },
  "purgatory-3f":           { id: "purgatory-3f",  name: "Purgatory 3F",  src: "/maps/war/purgatory-3f.png",  category: "purgatory", floor: 3 },
  "purgatory-4f":           { id: "purgatory-4f",  name: "Purgatory 4F",  src: "/maps/war/purgatory-4f.png",  category: "purgatory", floor: 4 },
  "purgatory-5f":           { id: "purgatory-5f",  name: "Purgatory 5F",  src: "/maps/war/purgatory-5f.png",  category: "purgatory", floor: 5 },
  "purgatory-6f":           { id: "purgatory-6f",  name: "Purgatory 6F",  src: "/maps/war/purgatory-6f.png",  category: "purgatory", floor: 6 },
  "purgatory-7f":           { id: "purgatory-7f",  name: "Purgatory 7F",  src: "/maps/war/purgatory-7f.png",  category: "purgatory", floor: 7 },
  // Mirage worlds
  "world1-demon-bull-temple-3f": { id: "world1-demon-bull-temple-3f", name: "Demon Bull Temple 3F (W1)", src: "/maps/war/world1-demon-bull-temple-3f.png", category: "mirage" },
  "world2-heavens-way-peak":     { id: "world2-heavens-way-peak",     name: "Heavens Way Peak (W2)",     src: "/maps/war/world2-heavens-way-peak.png",     category: "mirage" },
  "world3-rockcut-tomb":         { id: "world3-rockcut-tomb",         name: "Rockcut Tomb (W3)",         src: "/maps/war/world3-rockcut-tomb.png",         category: "mirage" },
  "world4-bladehaven-2f":        { id: "world4-bladehaven-2f",        name: "Bladehaven 2F (W4)",        src: "/maps/war/world4-bladehaven-2f.png",        category: "mirage" },
  "world5-illusion-temple":      { id: "world5-illusion-temple",      name: "Illusion Temple (W5)",      src: "/maps/war/world5-illusion-temple.png",      category: "mirage" },
  "world6-bicheon-lab":          { id: "world6-bicheon-lab",          name: "Bicheon Lab (W6)",          src: "/maps/war/world6-bicheon-lab.png",          category: "mirage" },
  "world7-redmoon-gorge-3f":     { id: "world7-redmoon-gorge-3f",     name: "Redmoon Gorge 3F (W7)",     src: "/maps/war/world7-redmoon-gorge-3f.png",     category: "mirage" },
  "world8-abandoned-mine-3f":    { id: "world8-abandoned-mine-3f",    name: "Abandoned Mine 3F (W8)",    src: "/maps/war/world8-abandoned-mine-3f.png",    category: "mirage" },
  // Tower — same image used for all 4 floors
  "tower-black-dragon-1f":  { id: "tower-black-dragon-1f", name: "Tower of Black Dragon 1F", src: "/maps/war/tower-black-dragon.jpg", category: "tower", floor: 1 },
  "tower-black-dragon-2f":  { id: "tower-black-dragon-2f", name: "Tower of Black Dragon 2F", src: "/maps/war/tower-black-dragon.jpg", category: "tower", floor: 2 },
  "tower-black-dragon-3f":  { id: "tower-black-dragon-3f", name: "Tower of Black Dragon 3F", src: "/maps/war/tower-black-dragon.jpg", category: "tower", floor: 3 },
  "tower-black-dragon-4f":  { id: "tower-black-dragon-4f", name: "Tower of Black Dragon 4F", src: "/maps/war/tower-black-dragon.jpg", category: "tower", floor: 4 },
};
```

---

### PAGE STATE

```ts
type WarMode = "deploy" | "map";
type MarkerType = "attack" | "defend" | "gather" | "support" | "retreat";

interface Assignment {
  id: string;
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
```

State vars:
- `mode: WarMode` — "deploy" | "map", default "deploy"
- `username: string` — from Discord SDK (same pattern as page.tsx), default "unknown"
- `selectedDate: string` — ISO date string (YYYY-MM-DD), default today in UTC+8
- `assignments: Assignment[]` — loaded from Supabase
- `selectedMapId: string | null` — which map is open in MAP mode
- `markers: MapMarker[]` — markers for selectedMapId
- `activeMarkerType: MarkerType` — which marker type the user is placing, default "attack"
- `activeSquad: Squad` — which squad to assign in DEPLOY mode, default "A"
- `isPlacingMarker: boolean` — cursor mode for MAP mode

---

### INLINE SVG COMPONENTS

#### `<ZoneBadge category={ZoneCategory} />`
A small pill badge showing the zone type icon + label. Uses `ZONE_CATEGORY_CONFIG`.

```tsx
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
      <svg width="10" height="10" viewBox="0 0 24 24" fill={cfg.color}>
        <path d={cfg.icon} />
      </svg>
      {cfg.label}
    </span>
  );
}
```

#### `<SquadBadge squad={Squad | null} />`
A small colored circular badge with the squad letter. If null, shows a gray dashed circle (unassigned).

#### `<MarkerIcon type={MarkerType} color={string} size={number} />`
Returns an inline SVG for each marker type:
- `attack` — two crossed swords: `<line>` elements forming an X, or simplified crossed lines
- `defend` — shield: `M12 2 L20 5 L20 12 C20 17 16 20.5 12 22 C8 20.5 4 17 4 12 L4 5 Z`
- `gather` — filled circle with ring: `<circle>` + `<circle>` (hollow outer)
- `support` — plus/cross: horizontal + vertical rect
- `retreat` — arrow pointing left: `M15 5 L7 12 L15 19 M7 12 L19 12`

All marker icons should be **visually distinct at small sizes** (18–24px).

---

### LAYOUT STRUCTURE

```
<main> (full page, min-h-screen, dark bg)
  <header>          // page title + mode toggle + date picker (DEPLOY only) + server clock
  <div.content>
    if mode === "deploy":  <DeployBoard />
    if mode === "map":     <MapBoard />
```

#### Header

```tsx
// Header contains:
// Left:  title "WAR BOARD" in bold zinc-100, subtitle "tactical coordination" in zinc-500
// Center: mode toggle — two buttons DEPLOY / MAP with active glass highlight
// Right:  date selector (deploy mode only) + server time badge
```

The mode toggle buttons should look like:
- Active: `background: rgba(255,255,255,0.1)`, `border: 1px solid rgba(255,255,255,0.2)`, text bright white
- Inactive: transparent, text zinc-500

Mode toggle button icons (SVG, no emoji):
- DEPLOY mode icon: grid of dots (tactical planning grid)
  ```
  <svg viewBox="0 0 24 24" width="16" height="16">
    <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor"/>
    <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor"/>
    <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor"/>
    <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor"/>
  </svg>
  ```
- MAP mode icon: location pin
  ```
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
  </svg>
  ```

---

### DEPLOY MODE — `<DeployBoard />`

Shows the full daily event timeline for the selected date, with squad assignment slots.

**Layout:** vertical list of zone event cards, grouped by time slot, sorted ascending by time.

For the selected date, compute which weekly bosses apply based on day-of-week. Show all daily zones + applicable weekly zones.

**Zone Event Card design:**

```
[3D glass card with hover: perspective(800px) rotateX(-1deg) rotateY(2deg) translateY(-3px)]
┌──────────────────────────────────────────────────────────────────┐
│  [ZoneBadge]  Zone Name                    TIME BADGE            │
│  description text (if any), zinc-400 small                       │
│  ─────────────────────────────────────────────────────           │
│  [ATTACK]  Squad: [A][B][C][D][E][F]  current: [SquadBadge]      │
│  [DEFEND]  Squad: [A][B][C][D][E][F]  current: [SquadBadge]      │
│  [SUPPORT] Squad: [A][B][C][D][E][F]  current: [SquadBadge]      │
│  assigned by: username                                            │
└──────────────────────────────────────────────────────────────────┘
```

Card CSS:
```css
background: radial-gradient(ellipse at top left, rgba(148,163,184,0.06) 0%, transparent 60%),
            rgba(15,23,42,0.92);
border: 1px solid rgba(148,163,184,0.2);
border-radius: 12px;
padding: 16px;
transition: transform 0.2s ease, box-shadow 0.2s ease;
transform-style: preserve-3d;
```

Hover:
```css
transform: perspective(800px) rotateX(-1deg) rotateY(2deg) translateY(-3px);
box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(148,163,184,0.3);
```

**Time badge:** right-aligned pill showing the event time (e.g. "22:00"). Color:
- Past: zinc-600 bg, zinc-400 text
- Within 60 min: amber bg, black text
- Within 15 min: red bg, white text  
- Current/spawned: emerald bg, black text

**Squad selector row:**
- Role label: `ATTACK` / `DEFEND` / `SUPPORT` in small caps
- 6 squad buttons A–F, each a small circle (28px) with the squad's color
- Clicking a squad button calls `upsertAssignment(zoneId, eventTime, role, squad, username)` which upserts to Supabase
- The currently assigned squad glows with its color shadow

**upsertAssignment** function:
```ts
async function upsertAssignment(
  zoneId: string,
  role: "attack" | "defend" | "support",
  squad: Squad | null,
  assignedBy: string
) {
  await supabase.from("war_assignments").upsert({
    war_date: selectedDate,
    zone_id: zoneId,
    role,
    squad,
    assigned_by: assignedBy,
    updated_at: new Date().toISOString(),
  }, { onConflict: "war_date,zone_id,role" });
  // reload assignments
  loadAssignments();
}
```

**loadAssignments** fetches all assignments for `selectedDate`:
```ts
const { data } = await supabase
  .from("war_assignments")
  .select("*")
  .eq("war_date", selectedDate);
setAssignments(data ?? []);
```

Subscribe to Supabase realtime on `war_assignments` table for the selectedDate to get live updates from other guild members.

---

### MAP MODE — `<MapBoard />`

**Layout:** two panels on desktop (sidebar + main canvas). On mobile: stacked (toolbar top, map full width below).

**Left sidebar / top toolbar:**
- Category filter tabs (horizontal pills): All / Labyrinth / Valley / Purgatory / Mirage / Tower
- Grid of map thumbnails for selected category
- Each thumbnail is a small glass card showing:
  - Map image (Next.js `<Image>` with `fill`, parent div `relative` + fixed size)
  - Map name below
  - Marker count badge if markers exist

**Main canvas area:**
- Selected map shown in `<MapCanvas mapId={selectedMapId} />`
- Marker type toolbar above the map:
  - Five buttons: Attack / Defend / Gather / Support / Retreat
  - Each shows `<MarkerIcon>` + label
  - Active type has colored border matching marker color
  - Clear All button (trash icon SVG, no emoji)
- Map container:
  - `position: relative`, `overflow: hidden`, rounded corners
  - `<Image>` with `fill` and `objectFit: contain`
  - SVG overlay absolutely positioned on top (100% w/h) for markers
  - Click handler on the container calculates x_pct and y_pct from click coordinates
  - Each marker rendered as a `<g>` element at `(x_pct%, y_pct%)` in the SVG

#### `<MapCanvas />` component

```tsx
interface ImgRect { x: number; y: number; w: number; h: number; }

function MapCanvas({ mapId, markers, onPlaceMarker, onRemoveMarker, activeMarkerType, activeSquad }: MapCanvasProps) {
  const mapFile = MAP_FILES[mapId];
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgRect, setImgRect] = useState<ImgRect>({ x: 0, y: 0, w: 0, h: 0 });

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const imgEl = containerRef.current.querySelector("img");
    if (!imgEl) return;

    // objectFit:contain — compute actual rendered image rect inside container
    const naturalW = imgEl.naturalWidth || container.width;
    const naturalH = imgEl.naturalHeight || container.height;
    const scale = Math.min(container.width / naturalW, container.height / naturalH);
    const renderedW = naturalW * scale;
    const renderedH = naturalH * scale;
    const offsetX = (container.width - renderedW) / 2;
    const offsetY = (container.height - renderedH) / 2;

    const clickX = e.clientX - container.left - offsetX;
    const clickY = e.clientY - container.top  - offsetY;

    // ignore clicks outside the actual image area (letterbox zones)
    if (clickX < 0 || clickY < 0 || clickX > renderedW || clickY > renderedH) return;

    const x_pct = (clickX / renderedW) * 100;
    const y_pct = (clickY / renderedH) * 100;
    onPlaceMarker({ mapId, marker_type: activeMarkerType, x_pct, y_pct });
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full cursor-crosshair"
      style={{ aspectRatio: "16/9", borderRadius: 12, overflow: "hidden",
               border: "1px solid rgba(148,163,184,0.2)" }}
      onClick={handleMapClick}
    >
      <Image
        src={mapFile.src}
        alt={mapFile.name}
        fill
        style={{ objectFit: "contain" }}
        onLoad={(e) => {
          // Store rendered image rect so SVG overlay aligns exactly with the image
          const img = e.currentTarget as HTMLImageElement;
          const c = containerRef.current!.getBoundingClientRect();
          const scale = Math.min(c.width / img.naturalWidth, c.height / img.naturalHeight);
          setImgRect({
            w: img.naturalWidth * scale,
            h: img.naturalHeight * scale,
            x: (c.width  - img.naturalWidth  * scale) / 2,
            y: (c.height - img.naturalHeight * scale) / 2,
          });
        }}
      />
      {/* SVG overlay positioned and sized to match the rendered image exactly — not the full container */}
      <svg
        style={{
          position: "absolute",
          left:   imgRect.x,
          top:    imgRect.y,
          width:  imgRect.w,
          height: imgRect.h,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        {/* SVG markers: coordinates are % of the actual rendered image area,
           so compute the same offset/scale as handleMapClick and apply via transform */}
      {markers.map(m => (
          <g key={m.id}
             transform={`translate(${m.x_pct}%, ${m.y_pct}%)`}
             style={{ cursor: "pointer", pointerEvents: "all" }}
             onClick={(e) => { e.stopPropagation(); onRemoveMarker(m.id); }}
          >
            {/* render MarkerIcon centered at 0,0 */}
            <MarkerIcon type={m.marker_type} color={m.color} size={24} />
            {m.label && (
              <text x="14" y="-4" fill="white" fontSize="10"
                    style={{ textShadow: "0 1px 2px #000", pointerEvents: "none" }}>
                {m.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
```

**Marker color** = `SQUAD_COLORS[activeSquad]` — markers are squad-colored.

**onPlaceMarker** inserts to `war_map_markers`:
```ts
async function placeMarker({ mapId, marker_type, x_pct, y_pct }: ...) {
  await supabase.from("war_map_markers").insert({
    map_id: mapId,
    marker_type,
    x_pct,
    y_pct,
    color: SQUAD_COLORS[activeSquad],
    placed_by: username,
  });
}
```

**onRemoveMarker** deletes by id.

**loadMarkers** fetches all markers for `selectedMapId`.

**Supabase Realtime** for map markers: subscribe to `war_map_markers` filtered by `map_id=eq.${selectedMapId}`. On INSERT event, append to local markers state. On DELETE event, remove from local markers state. This gives real-time sync to all guild members viewing the same map.

```ts
useEffect(() => {
  if (!selectedMapId) return;
  loadMarkers(selectedMapId);
  const channel = supabase
    .channel(`war-map-${selectedMapId}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "war_map_markers",
      filter: `map_id=eq.${selectedMapId}`,
    }, (payload) => {
      if (payload.eventType === "INSERT") {
        setMarkers(prev => [...prev, payload.new as MapMarker]);
      } else if (payload.eventType === "DELETE") {
        setMarkers(prev => prev.filter(m => m.id !== (payload.old as MapMarker).id));
      }
    })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [selectedMapId]);
```

---

### USERNAME INITIALIZATION

Same pattern as `src/app/page.tsx`:

```ts
useEffect(() => {
  const sdk = new DiscordSDK(process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!);
  sdk.ready().then(async () => {
    const auth = await sdk.commands.authenticate({ access_token: "" });
    setUsername(auth?.user?.username ?? "unknown");
  }).catch(() => setUsername("unknown"));
}, []);
```

---

### MOBILE RESPONSIVE LAYOUT

- Header: on mobile, mode toggle and date picker stack vertically. Title stays top-left.
- DEPLOY mode: single column, full width cards
- MAP mode: 
  - On mobile: map category pills scroll horizontally (overflow-x: auto), map thumbnails are 2-column grid
  - Map canvas takes full viewport width
  - Marker toolbar wraps or scrolls horizontally
- Use Tailwind: `flex-col md:flex-row`, `grid-cols-2 md:grid-cols-4`, etc.

---

### NAVIGATION — ADD WAR LINK TO MAIN PAGE

In `src/app/page.tsx`, find the tab/navigation area and add a link to `/war`. Use a styled `<a href="/war">` (not a tab) with:
- A crossed-swords SVG icon (no emoji):
  ```
  M6 6 L18 18 M18 6 L6 18
  ```
  (two diagonal lines forming an X, representing crossed swords)
- Label: "WAR BOARD"
- Styled as a pill button: `background: rgba(239,68,68,0.15)`, `border: 1px solid rgba(239,68,68,0.4)`, `color: #f87171`
- Hover: `background: rgba(239,68,68,0.25)`

Place this link near the top of the page, next to or after the existing tab navigation.

---

### GLASSMORPHIC CARD STYLE (reusable inline style object)

```ts
const glassCard = {
  background: "radial-gradient(ellipse at top left, rgba(148,163,184,0.06) 0%, transparent 60%), rgba(15,23,42,0.92)",
  border: "1px solid rgba(148,163,184,0.2)",
  borderRadius: "12px",
} as const;
```

---

### ZERO EMOJI CHECKLIST

Before finishing, search the entire file for any emoji characters (Unicode ranges U+1F000–U+1FFFF, U+2600–U+26FF, U+2700–U+27BF). Remove all. Replace any emoji-based labels with SVG icons as described above. Check all hardcoded strings, button labels, descriptions, and zone names.

---

### SUPABASE REALTIME — DEPLOY MODE

Subscribe to `war_assignments` for `selectedDate` to get live assignment updates:

```ts
useEffect(() => {
  loadAssignments();
  const channel = supabase
    .channel(`war-deploy-${selectedDate}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "war_assignments",
      filter: `war_date=eq.${selectedDate}`,
    }, () => { loadAssignments(); })
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, [selectedDate]);
```

---

### COMPLETE FILE STRUCTURE

The final `src/app/war/page.tsx` must contain (in order):
1. `"use client";`
2. All imports
3. Type definitions
4. Data constants (`ZONE_CATEGORY_CONFIG`, `SQUADS`, `SQUAD_COLORS`, `WAR_ZONES`, `MAP_FILES`)
5. Helper functions (`glassCard`, utility functions)
6. `ZoneBadge`, `SquadBadge`, `MarkerIcon` sub-components
7. `MapCanvas` sub-component
8. `DeployBoard` sub-component
9. `MapBoard` sub-component
10. `export default function WarPage()`

---

### VERIFICATION STEP

After creating the file, run:

```bash
npx tsc --noEmit
```

Fix all TypeScript errors. Then run:

```bash
grep -P "[\x{1F000}-\x{1FFFF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]" src/app/war/page.tsx
```

This must return no matches (zero emojis).

Also verify:
- `MAP_FILES` keys match exactly the `mapIds` strings used in `WAR_ZONES`
- All 31 map entries are present (10 labs + 5 valleys + 7 purgatory + 8 mirage worlds + 1 tower image used for 4 entries)
- `SQUADS` array has exactly 6 entries A–F
- No `localStorage` usage
- No `import` from any external icon library
