# Windsurf Agent Prompt: Constitution Tab (Card Redesign)

## Overview

Add a new **"📖 Constitution"** tab to `src/app/page.tsx`. It shows 3 stat cards (PHYS DEF, Spell DEF, PHYS ATK), lets the user pick a level range, and displays cumulative material costs with item images.

**Files to touch:** `src/app/page.tsx`  
**Do NOT touch:** any other files.

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

Find:
```tsx
type Tab =
  | "secret_peak"
  | "mirage"
  | "world_bosses"
  | "magic_square"
  | "calculator";
```

Replace with:
```tsx
type Tab =
  | "secret_peak"
  | "mirage"
  | "world_bosses"
  | "magic_square"
  | "calculator"
  | "constitution";
```

*(If `"conquest"` was already added by a previous prompt, keep it and add `| "constitution"` after it.)*

---

## Step 2 — Add import

After all existing imports near the top of the file:
```tsx
import ConstitutionData from "@/data/mir4tools/ConstituionData";
```

*(Note the typo in filename: `ConstituionData` — that's correct, match exactly.)*

---

## Step 3 — Add tab to the tabs array

Find the `tabs` array in `DashboardPage`. Add at the end (before the closing `]`):
```tsx
    { id: "constitution", label: "📖 Constitution" },
```

---

## Step 4 — Add rendering in the `<section>` block

Find the last `{activeTab === ...}` line in the section. After it, add:
```tsx
          {activeTab === "constitution" && <ConstitutionView />}
```

---

## Step 5 — Add `ConstitutionView` component

Add this complete component **before** `export default function DashboardPage()`:

```tsx
// ─── Constitution View ───────────────────────────────────────────────────────

type ConstitutionStat = "PHYS DEF" | "Spell DEF" | "PHYS ATK";

const CONSTITUTION_STAT_COLORS: Record<ConstitutionStat, { bg: string; border: string; text: string; accent: string }> = {
  "PHYS DEF": {
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
    text: "text-blue-300",
    accent: "accent-blue-500",
  },
  "Spell DEF": {
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.25)",
    text: "text-purple-300",
    accent: "accent-purple-500",
  },
  "PHYS ATK": {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    text: "text-red-300",
    accent: "accent-red-500",
  },
};

// Maps ingredient names (with or without rarity prefix) to item images
function constitutionItemImage(name: string): string | null {
  const stripped = name.replace(/^\[(UC|R|E|L)\]\s*/, "").toLowerCase();
  const map: Record<string, string> = {
    "herb leaf": "/items/herb_leaf.webp",
    "reishi": "/items/reishi.webp",
    "herb root": "/items/herb_root.webp",
    "century fruit": "/items/century_fruit.webp",
    "snow panax": "/items/snow_panax.webp",
    "eternal snow panax": "/items/eternal_snow_panax.webp",
    "copper": "/items/copper.webp",
  };
  return map[stripped] ?? null;
}

function ConstitutionView() {
  const stats = Object.keys(ConstitutionData) as ConstitutionStat[];
  const [activeStat, setActiveStat] = useState<ConstitutionStat>(stats[0]);
  const [fromLevel, setFromLevel] = useState(0);
  const [toLevel, setToLevel] = useState(20);

  const levels = ConstitutionData[activeStat];
  const maxLevel = levels.length; // levels are 1-indexed in data

  // Clamp levels on stat switch
  const clampedFrom = Math.min(fromLevel, maxLevel - 1);
  const clampedTo = Math.max(Math.min(toLevel, maxLevel), clampedFrom + 1);

  // Calculate cumulative costs from clampedFrom to clampedTo
  const costs: Record<string, number> = {};
  let finalStatValue = 0;
  for (let i = clampedFrom; i < clampedTo; i++) {
    const entry = levels[i] as Record<string, number>;
    for (const [key, val] of Object.entries(entry)) {
      if (key === "Level") continue;
      if (key === activeStat) {
        finalStatValue = val; // will end up as the value at target level
        continue;
      }
      costs[key] = (costs[key] ?? 0) + val;
    }
  }

  // Get the stat value AT the target level
  const targetEntry = levels[clampedTo - 1] as Record<string, number> | undefined;
  if (targetEntry) finalStatValue = targetEntry[activeStat] as number ?? 0;

  const colors = CONSTITUTION_STAT_COLORS[activeStat];

  return (
    <div className="pt-3">
      {/* Stat selector — 3 cards */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {stats.map((stat) => {
          const c = CONSTITUTION_STAT_COLORS[stat];
          const isActive = activeStat === stat;
          return (
            <button
              key={stat}
              type="button"
              onClick={() => setActiveStat(stat)}
              className="rounded-xl p-2.5 text-center transition-all"
              style={{
                background: isActive ? c.bg : "rgba(255,255,255,0.02)",
                border: isActive ? `1px solid ${c.border}` : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className={`text-[11px] font-semibold ${isActive ? c.text : "text-zinc-500"}`}>
                {stat}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-600">
                {ConstitutionData[stat].length} levels
              </p>
            </button>
          );
        })}
      </div>

      {/* Level range selector */}
      <div
        className="mb-4 rounded-xl p-3"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Level Range
          </span>
          <span className={`font-mono text-sm font-bold ${colors.text}`}>
            {clampedFrom} → {clampedTo}
          </span>
        </div>

        <div className="mb-2 flex items-center gap-3">
          <span className="text-[10px] w-8 text-zinc-500">From</span>
          <input
            type="range"
            min={0}
            max={maxLevel - 1}
            value={clampedFrom}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFromLevel(v);
              if (v >= clampedTo) setToLevel(Math.min(v + 1, maxLevel));
            }}
            className={`h-1.5 flex-1 appearance-none rounded-full bg-zinc-700 ${colors.accent}`}
          />
          <span className="font-mono text-xs text-zinc-300 w-6 text-right">{clampedFrom}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] w-8 text-zinc-500">To</span>
          <input
            type="range"
            min={1}
            max={maxLevel}
            value={clampedTo}
            onChange={(e) => {
              const v = Number(e.target.value);
              setToLevel(v);
              if (v <= clampedFrom) setFromLevel(Math.max(v - 1, 0));
            }}
            className={`h-1.5 flex-1 appearance-none rounded-full bg-zinc-700 ${colors.accent}`}
          />
          <span className="font-mono text-xs text-zinc-300 w-6 text-right">{clampedTo}</span>
        </div>

        {/* Quick level presets */}
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            { label: "1→10", from: 0, to: 10 },
            { label: "1→30", from: 0, to: 30 },
            { label: "1→50", from: 0, to: 50 },
            { label: "50→100", from: 50, to: 100 },
            { label: "1→MAX", from: 0, to: maxLevel },
          ]
            .filter((p) => p.to <= maxLevel)
            .map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setFromLevel(preset.from);
                  setToLevel(preset.to);
                }}
                className={[
                  "rounded px-2 py-0.5 text-[10px] font-semibold transition-all",
                  clampedFrom === preset.from && clampedTo === preset.to
                    ? `border ${colors.border !== undefined ? `border-current` : "border-zinc-600"} bg-zinc-800 ${colors.text}`
                    : "border border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
                style={
                  clampedFrom === preset.from && clampedTo === preset.to
                    ? { borderColor: colors.border }
                    : {}
                }
              >
                {preset.label}
              </button>
            ))}
        </div>
      </div>

      {/* Result: stat value at target */}
      <div
        className="mb-3 rounded-xl p-3 text-center"
        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
      >
        <p className="text-[10px] uppercase tracking-widest text-zinc-500">{activeStat} at Level {clampedTo}</p>
        <p className={`font-mono text-2xl font-bold ${colors.text}`}>
          {finalStatValue.toLocaleString()}
        </p>
      </div>

      {/* Material costs */}
      <div
        className="rounded-xl p-3"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Total Materials ({clampedTo - clampedFrom} levels)
        </p>
        {Object.keys(costs).length === 0 ? (
          <p className="text-[11px] text-zinc-600">No cost for this range.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {Object.entries(costs)
              .sort(([a], [b]) => {
                // Copper last, others alphabetical
                if (a === "Copper") return 1;
                if (b === "Copper") return -1;
                return a.localeCompare(b);
              })
              .map(([item, count]) => {
                const imgSrc = constitutionItemImage(item);
                return (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {imgSrc && (
                        <Image
                          src={imgSrc}
                          alt={item}
                          width={20}
                          height={20}
                          className="rounded shrink-0"
                          unoptimized
                        />
                      )}
                      <span className="truncate text-[11px] text-zinc-300">{item}</span>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-semibold text-zinc-100">
                      {count.toLocaleString()}
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

Must return **zero errors**.

```bash
git add src/app/page.tsx
git commit -m "feat: add Constitution tab with level range cost calculator"
git push
```

---

## НЕ трогать

- `src/lib/gameData.ts`
- `src/app/api/`
- `src/data/mir4tools/ConstituionData.ts` (read-only)
- Any other files not listed above
