# Windsurf Agent Prompt: Constitution Crafting Calculator Tab

## Task

Add a new **"Crafting"** tab to the existing MIR4 Boss Tracker Discord Activity
(`src/app/page.tsx`). The tab contains a **Constitution Upgrade Calculator** that
lets players calculate exactly how many raw materials they need to upgrade any
combination of constitutions from one level to another.

**DO NOT touch** globals.css, layout.tsx, gameData.ts, or any API routes.  
**Only edit** `src/app/page.tsx`.

---

## 1. Extend the Tab type

```ts
type Tab = "secret_peak" | "mirage" | "world_bosses" | "magic_square" | "crafting";
```

Add it to the `tabs` array (after "Mirage"):
```ts
{ id: "crafting", label: "⚗️ Crafting" },
```

---

## 2. Add the crafting data constants (paste near the top of the file, after the imports, before any component definitions)

```ts
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
```

---

## 3. Add the CraftingCalculator component (paste just above the main exported default function)

```tsx
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

  // Aggregate costs across all selected constitutions.
  // Each selected constitution has its own mat1 and mat2 (different items
  // but same quantities), so we group by item name.
  const materialTotals = useMemo(() => {
    const totals: Record<string, Record<HerbTier, number>> = {};

    for (const con of CONSTITUTIONS) {
      if (!selectedConstitutions.has(con.id)) continue;
      const { mat1, mat2 } = calcConstitutionCost(fromLevel, toLevel);

      // mat1
      if (!totals[con.mat1])
        totals[con.mat1] = { C: 0, UC: 0, R: 0, E: 0, L: 0 };
      for (const t of TIER_ORDER) totals[con.mat1][t] += mat1[t];

      // mat2
      if (!totals[con.mat2])
        totals[con.mat2] = { C: 0, UC: 0, R: 0, E: 0, L: 0 };
      for (const t of TIER_ORDER) totals[con.mat2][t] += mat2[t];
    }

    // Remove zero-total entries
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
      {/* ── Section: Select Constitutions ── */}
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
        <div className="flex items-center justify-between mb-4">
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
              className="text-[11px] px-2.5 py-1 rounded-lg transition-colors"
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
              className="text-[11px] px-2.5 py-1 rounded-lg transition-colors"
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
                  boxShadow: selected ? `0 0 12px ${con.color}20` : "none",
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

      {/* ── Section: Level Range ── */}
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
          className="text-sm font-semibold uppercase tracking-widest mb-4"
          style={{ color: "#94a3b8" }}
        >
          Level Range
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {/* From */}
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
          {/* To */}
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

        {/* Visual range indicator */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className="text-xs px-3 py-1 rounded-full font-mono"
            style={{
              background: "rgba(34,211,238,0.12)",
              border: "1px solid rgba(34,211,238,0.3)",
              color: "#67e8f9",
            }}
          >
            Lv {fromLevel}
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <span className="text-xs" style={{ color: "#475569" }}>
            {toLevel - fromLevel} level{toLevel - fromLevel !== 1 ? "s" : ""}
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <span
            className="text-xs px-3 py-1 rounded-full font-mono"
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

      {/* ── Section: Results ── */}
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
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: "#94a3b8" }}
            >
              Materials Required
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[11px]" style={{ color: "#64748b" }}>
                Show raw Common qty
              </span>
              <div
                className="relative w-8 h-4 rounded-full transition-colors cursor-pointer"
                style={{
                  background: showRawCommon
                    ? "rgba(34,211,238,0.5)"
                    : "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
                onClick={() => setShowRawCommon((v) => !v)}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
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
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "#e2e8f0" }}
                  >
                    {mat.name}
                  </span>
                  {showRawCommon && (
                    <span className="text-xs" style={{ color: "#64748b" }}>
                      ≈{" "}
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
                {/* Tier breakdown */}
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
                          className="text-xs hidden sm:inline"
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

          {/* Note about promotions */}
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

      {/* Empty state */}
      {!isValidRange && (
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-2 text-center"
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
```

---

## 4. Add the crafting tab to the render section

Find the block inside the main return that renders each tab's content (the `{activeTab === "mirage" && ...}` block). After the last tab block, add:

```tsx
{activeTab === "crafting" && (
  <section>
    <div className="mb-6">
      <h2
        className="text-base font-bold tracking-tight"
        style={{
          background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        ⚗️ Constitution Crafting Calculator
      </h2>
      <p className="mt-0.5 text-xs" style={{ color: "#475569" }}>
        Calculate total herbs & materials needed to upgrade your constitutions
      </p>
    </div>
    <CraftingCalculator />
  </section>
)}
```

---

## 5. Add `useMemo` to the imports if not already present

The `CraftingCalculator` component uses `useMemo`. Make sure the import at the top of the file includes it:

```ts
import { useCallback, useEffect, useMemo, useState } from "react";
```

(`useMemo` is already in the existing import line — no change needed if it's already there.)

---

## Summary of changes

- **`src/app/page.tsx`** only:
  1. Extend `Tab` type with `"crafting"`
  2. Add crafting data constants + helper functions after imports
  3. Add `TierBadge` and `CraftingCalculator` components
  4. Add `{ id: "crafting", label: "⚗️ Crafting" }` to the `tabs` array
  5. Add `{activeTab === "crafting" && ...}` render block

No new files, no new dependencies, no changes to any other file.
