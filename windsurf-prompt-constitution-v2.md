# Windsurf Agent Prompt: Constitution Tab (v2 — Correct Design)

## Overview

Add a **"📖 Constitution"** tab to `src/app/page.tsx`.  
Uses BOTH data files: `ConstituionData` (7 stats, per-level herb costs + base stat values) AND `ConstitutionMasteryData` (21 tiers, mastery bonuses + promotion costs).  
Each of 7 stats has its own from/to level. Tier navigation shifts all stats by 5 simultaneously.

**Files to touch:** `src/app/page.tsx` only.  
**Do NOT touch:** any other file.

---

## Step 0 — Verify page.tsx integrity

```bash
wc -l src/app/page.tsx
```

Must be **≥ 1400 lines** and contain `export default function DashboardPage`. If not:
```bash
git checkout HEAD -- src/app/page.tsx
```

---

## Step 1 — Add `"constitution"` to the Tab type

Find the `type Tab =` declaration and add `| "constitution"` to it.

---

## Step 2 — Add imports

After all existing imports at the top of the file:

```tsx
import ConstituionData from "@/data/mir4tools/ConstituionData";
import ConstitutionMasteryData from "@/data/mir4tools/ConstitutionMasteryData";
```

---

## Step 3 — Add tab to the tabs array

In `DashboardPage`, find the `tabs` array and add:
```tsx
    { id: "constitution", label: "📖 Constitution" },
```

---

## Step 4 — Add rendering in the section block

After the last `{activeTab === ...}` line, add:
```tsx
          {activeTab === "constitution" && <ConstitutionView />}
```

---

## Step 5 — Add `ConstitutionView` component

Add this complete component **before** `export default function DashboardPage()`:

```tsx
// ─── Constitution View ───────────────────────────────────────────────────────

type ConstitutionStat = "PHYS DEF" | "HP" | "EVA" | "PHYS ATK" | "Accuracy" | "MP" | "Spell DEF";

const CONSTITUTION_STATS: ConstitutionStat[] = [
  "PHYS DEF", "HP", "EVA", "PHYS ATK", "Accuracy", "MP", "Spell DEF",
];

// Positions around the circle (top, top-left, bottom-left, bottom, bottom-right, top-right, top-right2)
const STAT_CIRCLE_POSITIONS: Record<ConstitutionStat, string> = {
  "PHYS DEF":  "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "HP":        "top-[18%] left-0 -translate-x-1/2",
  "EVA":       "bottom-[18%] left-0 -translate-x-1/2",
  "PHYS ATK":  "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  "Accuracy":  "bottom-[18%] right-0 translate-x-1/2",
  "MP":        "top-[18%] right-0 translate-x-1/2",
  "Spell DEF": "top-0 right-[18%] -translate-y-1/2",
};

const STAT_ABBREV: Record<ConstitutionStat, string> = {
  "PHYS DEF": "P.DEF",
  "HP": "HP",
  "EVA": "EVA",
  "PHYS ATK": "P.ATK",
  "Accuracy": "ACC",
  "MP": "MP",
  "Spell DEF": "S.DEF",
};

type StatLevels = { from: number; to: number };
type AllStatLevels = Record<ConstitutionStat, StatLevels>;

function getConstitutionVal(stat: ConstitutionStat, level: number, tierIndex: number): number {
  const data = ConstituionData as unknown as Record<string, Array<Record<string, number>>>;
  const base = data[stat]?.[level - 1]?.[stat] ?? 0;
  const bonus = (ConstitutionMasteryData[tierIndex]?.Effects as Record<string, number>)?.[stat] ?? 0;
  return base + bonus;
}

function constitutionHumanizeTier(tierIndex: number): string {
  return `Tier ${tierIndex + 1}`;
}

function ConstitutionView() {
  const defaultLevels = Object.fromEntries(
    CONSTITUTION_STATS.map((s) => [s, { from: 1, to: 5 }])
  ) as AllStatLevels;

  const [levels, setLevels] = useState<AllStatLevels>(defaultLevels);
  const [activeStat, setActiveStat] = useState<ConstitutionStat | null>("PHYS DEF");
  const [showPromo, setShowPromo] = useState(false);

  const minFrom = Math.min(...CONSTITUTION_STATS.map((s) => levels[s].from));
  const tierIndex = Math.min(Math.round(minFrom / 5), 20);
  const currentTier = tierIndex + 1;

  // Tier navigation — shifts ALL stats by 5
  function handleTierChange(dir: 1 | -1) {
    const tier = Math.round(Math.min(...CONSTITUTION_STATS.map((s) => levels[s].from)) / 5);
    const newTier = tier + dir;
    const newFrom = Math.max(1, Math.min(105, 5 * newTier));
    const newTo   = Math.max(1, Math.min(105, 5 * (newTier + 1)));
    setLevels(
      Object.fromEntries(CONSTITUTION_STATS.map((s) => [s, { from: newFrom, to: newTo }])) as AllStatLevels
    );
  }

  // Herb cost calculation: sum ConstituionData[stat][i] for i in [from-1, to-1)
  const herbCosts: Record<string, number> = {};
  CONSTITUTION_STATS.forEach((stat) => {
    const data = ConstituionData as unknown as Record<string, Array<Record<string, number>>>;
    const arr = data[stat];
    if (!arr) return;
    for (let i = levels[stat].from - 1; i < levels[stat].to - 1; i++) {
      const entry = arr[i];
      if (!entry) continue;
      Object.entries(entry).forEach(([key, val]) => {
        if (key === "Level" || key === stat) return;
        herbCosts[key] = (herbCosts[key] ?? 0) + (val as number);
      });
    }
  });

  // Promotion costs: sum ConstitutionMasteryData[ti+1].Cost for tiers crossed
  if (showPromo) {
    const maxTo = Math.round(Math.max(...CONSTITUTION_STATS.map((s) => levels[s].to)) / 5);
    for (let ti = tierIndex; ti < maxTo && ti < 20; ti++) {
      const cost = ConstitutionMasteryData[ti + 1]?.Cost as Record<string, number> | undefined;
      if (!cost) continue;
      Object.entries(cost).forEach(([key, val]) => {
        herbCosts[key] = (herbCosts[key] ?? 0) + val;
      });
    }
  }

  // Herb item image helper
  function herbImg(name: string): string | null {
    const n = name.replace(/^\[(UC|R|E|L)\]\s*/, "").toLowerCase().trim();
    const m: Record<string, string> = {
      "herb leaf": "/items/herb_leaf.webp",
      "reishi": "/items/reishi.webp",
      "unihorn slice": "/items/unihorn_slice.webp",
      "herb root": "/items/herb_root.webp",
      "century fruit": "/items/century_fruit.webp",
      "snow panax": "/items/snow_panax.webp",
      "eternal snow panax": "/items/eternal_snow_panax.webp",
      "moonlight magic stone": "/items/moonlight_magic_stone.webp",
      "blue devil stone": "/items/blue_devil_stone.webp",
      "purified water": "/items/purified_water.webp",
      "virtue pill": "/items/virtue_pill.webp",
      "copper": "/items/copper.webp",
    };
    return m[n] ?? null;
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* Tier navigation */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => handleTierChange(-1)}
          disabled={currentTier <= 1}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-30"
        >
          −
        </button>
        <span className="min-w-[9rem] text-center text-sm font-bold text-zinc-100">
          {constitutionHumanizeTier(tierIndex)} Constitution
        </span>
        <button
          type="button"
          onClick={() => handleTierChange(1)}
          disabled={currentTier >= 21}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-30"
        >
          +
        </button>
      </div>

      <div className="flex gap-3">
        {/* Circular stat selector */}
        <div className="relative mx-auto shrink-0" style={{ width: 200, height: 200 }}>
          {/* Circle ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}
          />
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">MaxLv</span>
            <span className="font-mono text-sm font-bold text-zinc-100">
              {ConstitutionMasteryData[tierIndex]?.MaxLv ?? 5}
            </span>
          </div>
          {/* 7 stat buttons */}
          {CONSTITUTION_STATS.map((stat) => {
            const isActive = activeStat === stat;
            const pos = STAT_CIRCLE_POSITIONS[stat];
            const lvs = levels[stat];
            return (
              <button
                key={stat}
                type="button"
                onClick={() => setActiveStat(isActive ? null : stat)}
                className={[
                  "absolute flex flex-col items-center gap-0.5 rounded-full px-2 py-1 transition-all",
                  pos,
                  isActive
                    ? "border border-red-500/60 bg-red-500/15 text-red-300"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
                ].join(" ")}
                style={{ minWidth: 40 }}
              >
                <span className="text-[9px] font-bold leading-tight">
                  {STAT_ABBREV[stat]}
                </span>
                <span className="font-mono text-[8px] leading-none opacity-75">
                  {lvs.from}→{lvs.to}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right panel: active stat input + stats table */}
        <div className="flex flex-1 flex-col gap-2 min-w-0">
          {/* Stat level editor */}
          {activeStat && (
            <div
              className="rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="mb-2 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                {activeStat}
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-8 text-[9px] text-zinc-500">From</span>
                <input
                  type="range" min={1} max={104}
                  value={levels[activeStat].from}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setLevels((prev) => ({
                      ...prev,
                      [activeStat]: { from: v, to: Math.max(prev[activeStat].to, v + 1) },
                    }));
                  }}
                  className="h-1.5 flex-1 appearance-none rounded-full bg-zinc-700 accent-red-500"
                />
                <span className="w-6 text-right font-mono text-[10px] text-zinc-200">
                  {levels[activeStat].from}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 text-[9px] text-zinc-500">To</span>
                <input
                  type="range" min={2} max={105}
                  value={levels[activeStat].to}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setLevels((prev) => ({
                      ...prev,
                      [activeStat]: { from: Math.min(prev[activeStat].from, v - 1), to: v },
                    }));
                  }}
                  className="h-1.5 flex-1 appearance-none rounded-full bg-zinc-700 accent-red-500"
                />
                <span className="w-6 text-right font-mono text-[10px] text-zinc-200">
                  {levels[activeStat].to}
                </span>
              </div>
            </div>
          )}

          {/* Stats table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="grid px-3 py-1.5"
              style={{
                gridTemplateColumns: "1fr 60px 70px",
                background: "rgba(255,255,255,0.04)",
                fontSize: 9,
                color: "#71717a",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span>Stat</span>
              <span style={{ textAlign: "right" }}>Current</span>
              <span style={{ textAlign: "right" }}>Next</span>
            </div>
            {CONSTITUTION_STATS.map((stat, idx) => {
              const cur = getConstitutionVal(stat, levels[stat].from, tierIndex);
              const nxt = getConstitutionVal(stat, levels[stat].to, tierIndex);
              return (
                <div
                  key={stat}
                  className="grid px-3 py-1.5"
                  style={{
                    gridTemplateColumns: "1fr 60px 70px",
                    background: idx % 2 === 0 ? "rgba(0,0,0,0.2)" : "transparent",
                    borderTop: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span style={{ fontSize: 10, color: "#a1a1aa" }}>{stat}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#e4e4e7", textAlign: "right" }}>
                    {cur.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      textAlign: "right",
                      color: nxt > cur ? "#4ade80" : "#e4e4e7",
                    }}
                  >
                    {nxt > cur ? `→ ${nxt.toLocaleString()}` : cur.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cost section */}
      <div
        className="rounded-xl p-3"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Cost
          </span>
          <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-zinc-500">
            <input
              type="checkbox"
              checked={showPromo}
              onChange={(e) => setShowPromo(e.target.checked)}
              className="accent-red-500"
            />
            Show promotion cost
          </label>
        </div>
        {Object.keys(herbCosts).length === 0 ? (
          <p className="text-[11px] text-zinc-600">No cost for this range.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {Object.entries(herbCosts)
              .sort(([a], [b]) => {
                if (a === "Copper") return 1;
                if (b === "Copper") return -1;
                return a.localeCompare(b);
              })
              .map(([item, count]) => {
                const imgSrc = herbImg(item);
                return (
                  <div key={item} className="flex flex-col items-center gap-1.5">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={item}
                          width={32}
                          height={32}
                          className="rounded"
                          unoptimized
                        />
                      ) : (
                        <span className="text-[10px] text-zinc-500">?</span>
                      )}
                    </div>
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold text-zinc-100"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {count >= 1000000
                        ? `${(count / 1000000).toFixed(1)}M`
                        : count >= 1000
                        ? `${(count / 1000).toFixed(0)}K`
                        : count.toLocaleString()}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Step 6 — Verify

```bash
npx tsc --noEmit
```

Zero errors required.

```bash
git add src/app/page.tsx
git commit -m "feat: add Constitution tab — tier navigation, 7 stats, per-stat levels, combined mastery data, herb+promotion costs"
git push
```

---

## НЕ трогать

- `src/data/mir4tools/ConstituionData.ts`
- `src/data/mir4tools/ConstitutionMasteryData.ts`
- Any file other than `src/app/page.tsx`
