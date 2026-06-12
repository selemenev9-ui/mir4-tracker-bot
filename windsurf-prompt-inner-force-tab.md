# Windsurf Agent Prompt: Inner Force Calculator Tab

## Overview

Add a new **"⚡ Inner Force"** tab to `src/app/page.tsx`. Users select a class (with class image), then a skill/manual, then a from→to level range, and see total Energy needed + pill counts.

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

## Step 1 — Add `"inner_force"` to the Tab type

Find the `type Tab = ...` block and add `| "inner_force"` at the end (before the semicolon).

---

## Step 2 — Add imports

After all existing imports at the top of the file, add:

```tsx
import WarriorInnerForce from "@/data/mir4tools/InnerForce/Warrior";
import SorcererInnerForce from "@/data/mir4tools/InnerForce/Sorcerer";
import TaoistInnerForce from "@/data/mir4tools/InnerForce/Taoist";
import LancerInnerForce from "@/data/mir4tools/InnerForce/Lancer";
import DarkistInnerForce from "@/data/mir4tools/InnerForce/Darkist";
import ArbalistInnerForce from "@/data/mir4tools/InnerForce/Arbalist";
```

---

## Step 3 — Add tab to the tabs array

In `DashboardPage`, add to the `tabs` array:
```tsx
    { id: "inner_force", label: "⚡ Inner Force" },
```

---

## Step 4 — Add rendering in the `<section>` block

After the last `{activeTab === ...}` line, add:
```tsx
          {activeTab === "inner_force" && <InnerForceView />}
```

---

## Step 5 — Add the `InnerForceView` component

Add this complete component **before** `export default function DashboardPage()`:

```tsx
// ─── Inner Force View ────────────────────────────────────────────────────────

type InnerForceClass = "Warrior" | "Sorcerer" | "Taoist" | "Lancer" | "Darkist" | "Arbalist";

const INNER_FORCE_CLASS_DATA: Record<InnerForceClass, Record<string, Record<number, Record<string, unknown>>>> = {
  Warrior: WarriorInnerForce as Record<string, Record<number, Record<string, unknown>>>,
  Sorcerer: SorcererInnerForce as Record<string, Record<number, Record<string, unknown>>>,
  Taoist: TaoistInnerForce as Record<string, Record<number, Record<string, unknown>>>,
  Lancer: LancerInnerForce as Record<string, Record<number, Record<string, unknown>>>,
  Darkist: DarkistInnerForce as Record<string, Record<number, Record<string, unknown>>>,
  Arbalist: ArbalistInnerForce as Record<string, Record<number, Record<string, unknown>>>,
};

const INNER_FORCE_CLASS_IMAGES: Record<InnerForceClass, string> = {
  Warrior: "/images/classes/warrior.webp",
  Sorcerer: "/images/classes/sorcerer.webp",
  Taoist: "/images/classes/taoist.webp",
  Lancer: "/images/classes/lancer.webp",
  Darkist: "/images/classes/darkist.webp",
  Arbalist: "/images/classes/arbalist.webp",
};

const PILL_IMAGES: Record<string, string> = {
  "Greater Yang Pill": "/items/greater_yang_pill.webp",
  "Greater Yin Pill": "/items/greater_yin_pill.webp",
  "Lesser Yang Pill": "/items/lesser_yang_pill.webp",
  "Lesser Yin Pill": "/items/lesser_yin_pill.webp",
  "Virtue Pill": "/items/virtue_pill.webp",
};

function InnerForceView() {
  const [selectedClass, setSelectedClass] = useState<InnerForceClass | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [fromLevel, setFromLevel] = useState(0);
  const [toLevel, setToLevel] = useState(20);

  // ── Class selection ────────────────────────────────────────────────────────
  if (!selectedClass) {
    return (
      <div className="pt-3">
        <p className="mb-3 text-[11px] text-zinc-500">
          Select your class to calculate Inner Force training costs.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(INNER_FORCE_CLASS_DATA) as InnerForceClass[]).map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => {
                setSelectedClass(cls);
                setSelectedSkill(null);
                setFromLevel(0);
                setToLevel(20);
              }}
              className="flex flex-col items-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 transition-all hover:border-zinc-600 hover:bg-zinc-800/60"
            >
              <div className="relative mb-2 h-16 w-12">
                <Image
                  src={INNER_FORCE_CLASS_IMAGES[cls]}
                  alt={cls}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-[11px] font-semibold text-zinc-200">{cls}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const classSkills = INNER_FORCE_CLASS_DATA[selectedClass];
  const skillNames = Object.keys(classSkills);

  // ── Skill selection ────────────────────────────────────────────────────────
  if (!selectedSkill) {
    return (
      <div className="pt-3">
        <button
          type="button"
          onClick={() => setSelectedClass(null)}
          className="mb-3 flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← Classes
        </button>
        <div className="mb-3 flex items-center gap-2">
          <div className="relative h-10 w-8">
            <Image
              src={INNER_FORCE_CLASS_IMAGES[selectedClass]}
              alt={selectedClass}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <h2 className="text-sm font-bold text-zinc-100">{selectedClass}</h2>
        </div>
        <p className="mb-2 text-[11px] text-zinc-500">Select a manual / skill:</p>
        <div className="flex flex-col gap-1.5">
          {skillNames.map((skill) => {
            const levels = classSkills[skill];
            const maxLvl = Math.max(...Object.keys(levels).map(Number));
            return (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  setSelectedSkill(skill);
                  setFromLevel(0);
                  setToLevel(Math.min(20, maxLvl));
                }}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-left transition-all hover:border-zinc-600"
              >
                <span className="text-xs font-semibold text-zinc-200">{skill}</span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                  Max {maxLvl}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Calculator ──────────────────────────────────────────────────────────────
  const skillLevels = classSkills[selectedSkill];
  const maxLevel = Math.max(...Object.keys(skillLevels).map(Number));
  const clampedFrom = Math.min(fromLevel, maxLevel - 1);
  const clampedTo = Math.max(Math.min(toLevel, maxLevel), clampedFrom + 1);

  // Calculate totals
  let totalEnergy = 0;
  const pillCounts: Record<string, number> = {};
  const statGains: Record<string, number> = {};

  for (let lvl = clampedFrom + 1; lvl <= clampedTo; lvl++) {
    const levelData = skillLevels[lvl] as Record<string, unknown>;
    if (!levelData) continue;

    totalEnergy += (levelData.EnergyPerClick as number) ?? 0;

    // Each key besides EnergyPerClick is a sub-skill with stats + pills
    for (const [subKey, subVal] of Object.entries(levelData)) {
      if (subKey === "EnergyPerClick") continue;
      const subData = subVal as Record<string, number>;
      for (const [itemKey, itemVal] of Object.entries(subData)) {
        if (typeof itemVal !== "number") continue;
        if (itemKey.includes("Pill")) {
          pillCounts[itemKey] = (pillCounts[itemKey] ?? 0) + itemVal;
        } else {
          // This is a stat gain (e.g. PHYS ATK)
          statGains[itemKey] = (statGains[itemKey] ?? 0) + itemVal;
        }
      }
    }
  }

  // Stat values AT target level (not cumulative — show the final value)
  const targetLevelData = skillLevels[clampedTo] as Record<string, unknown> | undefined;
  const finalStats: Record<string, number> = {};
  if (targetLevelData) {
    for (const [subKey, subVal] of Object.entries(targetLevelData)) {
      if (subKey === "EnergyPerClick") continue;
      const subData = subVal as Record<string, number>;
      for (const [itemKey, itemVal] of Object.entries(subData)) {
        if (!itemKey.includes("Pill") && typeof itemVal === "number") {
          finalStats[itemKey] = itemVal;
        }
      }
    }
  }

  return (
    <div className="pt-3">
      {/* Breadcrumb */}
      <div className="mb-3 flex items-center gap-1 text-[11px] text-zinc-500">
        <button
          type="button"
          onClick={() => setSelectedClass(null)}
          className="transition-colors hover:text-zinc-300"
        >
          Classes
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => setSelectedSkill(null)}
          className="transition-colors hover:text-zinc-300"
        >
          {selectedClass}
        </button>
        <span>/</span>
        <span className="text-zinc-300">{selectedSkill}</span>
      </div>

      {/* Level range */}
      <div
        className="mb-3 rounded-xl p-3"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Level Range
          </span>
          <span className="font-mono text-sm font-bold text-amber-300">
            {clampedFrom} → {clampedTo}
          </span>
        </div>
        <div className="mb-2 flex items-center gap-3">
          <span className="w-8 text-[10px] text-zinc-500">From</span>
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
            className="h-1.5 flex-1 appearance-none rounded-full bg-zinc-700 accent-amber-500"
          />
          <span className="w-6 text-right font-mono text-xs text-zinc-300">{clampedFrom}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-8 text-[10px] text-zinc-500">To</span>
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
            className="h-1.5 flex-1 appearance-none rounded-full bg-zinc-700 accent-amber-500"
          />
          <span className="w-6 text-right font-mono text-xs text-zinc-300">{clampedTo}</span>
        </div>
        {/* Presets */}
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            { label: "0→10", from: 0, to: 10 },
            { label: "0→50", from: 0, to: 50 },
            { label: "0→100", from: 0, to: 100 },
            { label: "50→100", from: 50, to: 100 },
          ]
            .filter((p) => p.to <= maxLevel)
            .map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setFromLevel(p.from); setToLevel(p.to); }}
                className={[
                  "rounded px-2 py-0.5 text-[10px] font-semibold transition-all",
                  clampedFrom === p.from && clampedTo === p.to
                    ? "border border-amber-500/40 bg-amber-500/20 text-amber-300"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300",
                ].join(" ")}
              >
                {p.label}
              </button>
            ))}
        </div>
      </div>

      {/* Energy total */}
      <div
        className="mb-3 rounded-xl p-3 text-center"
        style={{
          background: "rgba(251,191,36,0.08)",
          border: "1px solid rgba(251,191,36,0.2)",
        }}
      >
        <p className="text-[10px] uppercase tracking-widest text-amber-400/70">
          Total Energy Required
        </p>
        <p className="font-mono text-2xl font-bold text-amber-300">
          {totalEnergy.toLocaleString()}
        </p>
        <p className="text-[10px] text-zinc-500">
          across {clampedTo - clampedFrom} level{clampedTo - clampedFrom !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Pills */}
      {Object.keys(pillCounts).length > 0 && (
        <div
          className="mb-3 rounded-xl p-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Pills Required
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(pillCounts).map(([pill, count]) => (
              <div
                key={pill}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {PILL_IMAGES[pill] && (
                  <Image
                    src={PILL_IMAGES[pill]}
                    alt={pill}
                    width={20}
                    height={20}
                    className="rounded shrink-0"
                    unoptimized
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-[10px] text-zinc-400">{pill}</p>
                  <p className="font-mono text-xs font-bold text-zinc-100">
                    {count.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final stat values at target level */}
      {Object.keys(finalStats).length > 0 && (
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Stats at Level {clampedTo}
          </p>
          <div className="flex flex-col gap-1.5">
            {Object.entries(finalStats).map(([stat, val]) => (
              <div key={stat} className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">{stat}</span>
                <span className="font-mono text-xs font-semibold text-zinc-200">
                  {val.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
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
git commit -m "feat: add Inner Force calculator tab — class/skill selector, energy + pill totals"
git push
```

---

## НЕ трогать

- `src/lib/gameData.ts`
- `src/app/api/`
- `src/data/mir4tools/InnerForce/*.ts` (read-only)
- Any other files not listed above
