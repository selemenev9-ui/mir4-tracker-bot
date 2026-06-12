# Windsurf Agent Prompt: Conquest Tower Tab

## Overview

Add a new **"🏰 Conquest"** tab to `src/app/page.tsx` that lets users browse all 7 Conquest Tower buildings, view upgrade steps with costs, effects, and requirements.

**Files to touch:** `src/app/page.tsx`, `src/data/mir4tools/ConquestTowerData.ts`  
**Do NOT touch:** any other files.

---

## Step 0 — Verify page.tsx integrity

Before doing anything, run:
```bash
wc -l src/app/page.tsx
```

The file must have **≥ 1400 lines** and contain `export default function DashboardPage`. If it has fewer lines or is missing that export, restore it:
```bash
git checkout HEAD -- src/app/page.tsx
```

---

## Step 1 — Fix `ConquestTowerData.ts`: add missing type

Open `src/data/mir4tools/ConquestTowerData.ts`. The file references `ConquestTowers` type but never defines it, causing TypeScript errors.

**At the very top of the file (line 0, before the `const ConquestTowersData` declaration), insert:**

```ts
type ConquestTowers =
  | 'Tower of Conquest'
  | 'Millennial Tree'
  | 'Training Sanctum'
  | 'Tower of Quintessence'
  | 'Tower of Victory'
  | 'Holy Shrine'
  | 'Sanctuary of Hydra'
```

---

## Step 2 — Add `"conquest"` to the Tab type in `page.tsx`

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
  | "conquest";
```

---

## Step 3 — Add import at the top of `page.tsx`

Find the existing imports block (near the top, after `"use client";`). After all existing imports, add:

```tsx
import ConquestTowersData from "@/data/mir4tools/ConquestTowerData";
```

---

## Step 4 — Add the tab to the tabs array in `DashboardPage`

Find:
```tsx
  const tabs: { id: Tab; label: string }[] = [
    { id: "world_bosses", label: "World Bosses" },
    { id: "secret_peak", label: "Secret Peak" },
    { id: "magic_square", label: "Magic Square" },
    { id: "mirage", label: "Mirage" },
    { id: "calculator", label: "⛏ Calculator" },
  ];
```

Replace with:
```tsx
  const tabs: { id: Tab; label: string }[] = [
    { id: "world_bosses", label: "World Bosses" },
    { id: "secret_peak", label: "Secret Peak" },
    { id: "magic_square", label: "Magic Square" },
    { id: "mirage", label: "Mirage" },
    { id: "calculator", label: "⛏ Calculator" },
    { id: "conquest", label: "🏰 Conquest" },
  ];
```

---

## Step 5 — Make the nav scrollable (needed for extra tabs)

Find:
```tsx
        <nav className="flex gap-0.5 border-b border-zinc-800/80">
```

Replace with:
```tsx
        <nav className="flex gap-0.5 overflow-x-auto border-b border-zinc-800/80 scrollbar-none">
```

---

## Step 6 — Add rendering in the `<section>` block

Find:
```tsx
          {activeTab === "calculator" && <MiningCalculatorView />}
```

Replace with:
```tsx
          {activeTab === "calculator" && <MiningCalculatorView />}
          {activeTab === "conquest" && <ConquestTowerView />}
```

---

## Step 7 — Add the `ConquestTowerView` component

Add this complete component anywhere **before** the `export default function DashboardPage()` declaration (e.g., right before it):

```tsx
// ─── Conquest Tower View ─────────────────────────────────────────────────────

const CONQUEST_TOWER_IMAGES: Record<string, string> = {
  "Tower of Conquest": "/conquests/previews/tower_of_conquest.png",
  "Millennial Tree": "/conquests/previews/millennial_tree.png",
  "Training Sanctum": "/conquests/previews/training_sanctum.png",
  "Tower of Quintessence": "/conquests/previews/tower_of_quintessence.png",
  "Tower of Victory": "/conquests/previews/tower_of_victory.png",
  "Holy Shrine": "/conquests/previews/holy_shrine.png",
  "Sanctuary of Hydra": "/conquests/previews/sanctuary_of_hydra.png",
};

function formatUpgradeTime(seconds: number): string {
  if (seconds === 0) return "—";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function ConquestTowerView() {
  const [selected, setSelected] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const towerNames = Object.keys(ConquestTowersData) as Array<
    keyof typeof ConquestTowersData
  >;

  if (!selected) {
    return (
      <div className="pt-3">
        <p className="mb-3 text-[11px] text-zinc-500">
          Select a building to view upgrade steps, costs, and effects.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {towerNames.map((name) => {
            const data = ConquestTowersData[name];
            const imgSrc =
              CONQUEST_TOWER_IMAGES[name] ?? "/conquests/main.png";
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setSelected(name);
                  setStep(1);
                }}
                className="flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 text-left transition-all hover:border-zinc-600 hover:bg-zinc-800/60"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                  <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-2">
                  <p className="text-[11px] font-semibold leading-tight text-zinc-100">
                    {name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">
                    {data.Steps.length} levels
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const towerData = ConquestTowersData[selected as keyof typeof ConquestTowersData];
  const maxStep = towerData.Steps.length;
  const stepData = towerData.Steps.find((s) => s.Step === step);

  return (
    <div className="pt-3">
      {/* Back */}
      <button
        type="button"
        onClick={() => setSelected(null)}
        className="mb-3 flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
      >
        ← All Buildings
      </button>

      {/* Tower header */}
      <div className="mb-3 flex items-center gap-3">
        <div
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Image
            src={CONQUEST_TOWER_IMAGES[selected] ?? "/conquests/main.png"}
            alt={selected}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div>
          <h2 className="text-sm font-bold text-zinc-100">{selected}</h2>
          <p className="text-[10px] text-zinc-500">{maxStep} upgrade levels</p>
        </div>
      </div>

      {/* Step slider */}
      <div
        className="mb-3 rounded-xl p-3"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Level
          </span>
          <span className="font-mono text-sm font-bold text-zinc-100">
            {step} / {maxStep}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={maxStep}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          className="h-1.5 w-full appearance-none rounded-full bg-zinc-700 accent-amber-500"
        />
        {/* Quick jump buttons */}
        <div className="mt-2 flex flex-wrap gap-1">
          {Array.from(
            new Set(
              [1, 5, 10, 15, 20, maxStep].filter((v) => v <= maxStep)
            )
          ).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={[
                "rounded px-2 py-0.5 text-[10px] font-semibold transition-all",
                step === s
                  ? "border border-amber-500/40 bg-amber-500/20 text-amber-300"
                  : "border border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {stepData && (
        <>
          {/* Stats row */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div
              className="rounded-xl p-2.5 text-center"
              style={{
                background: "rgba(251,191,36,0.08)",
                border: "1px solid rgba(251,191,36,0.2)",
              }}
            >
              <p className="mb-0.5 text-[10px] uppercase tracking-wide text-amber-400/70">
                Power
              </p>
              <p className="font-mono text-base font-bold text-amber-300">
                {stepData.Power.toLocaleString()}
              </p>
            </div>
            <div
              className="rounded-xl p-2.5 text-center"
              style={{
                background: "rgba(148,163,184,0.06)",
                border: "1px solid rgba(148,163,184,0.15)",
              }}
            >
              <p className="mb-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                Build Time
              </p>
              <p className="font-mono text-base font-bold text-zinc-200">
                {formatUpgradeTime(stepData.UpgradeTime)}
              </p>
            </div>
          </div>

          {/* Costs */}
          {Object.keys(stepData.Cost).length > 0 && (
            <div
              className="mb-3 rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Upgrade Cost
              </p>
              <div className="flex flex-wrap gap-4">
                {stepData.Cost.Copper !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/items/copper.webp"
                      alt="Copper"
                      width={20}
                      height={20}
                      className="rounded"
                      unoptimized
                    />
                    <span className="font-mono text-sm font-semibold text-yellow-300">
                      {stepData.Cost.Copper.toLocaleString()}
                    </span>
                  </div>
                )}
                {stepData.Cost.Darksteel !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/items/darksteel.webp"
                      alt="Darksteel"
                      width={20}
                      height={20}
                      className="rounded"
                      unoptimized
                    />
                    <span className="font-mono text-sm font-semibold text-sky-300">
                      {stepData.Cost.Darksteel.toLocaleString()}
                    </span>
                  </div>
                )}
                {stepData.Cost.Energy !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/items/energy.webp"
                      alt="Energy"
                      width={20}
                      height={20}
                      className="rounded"
                      unoptimized
                    />
                    <span className="font-mono text-sm font-semibold text-emerald-300">
                      {stepData.Cost.Energy.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Building requirements */}
          {Object.keys(stepData.Building).length > 0 && (
            <div
              className="mb-3 rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Building Requirements
              </p>
              <div className="flex flex-col gap-1.5">
                {Object.entries(stepData.Building).map(([bName, bLevel]) => (
                  <div
                    key={bName}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[11px] text-zinc-300">{bName}</span>
                    <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                      Lv. {bLevel as number}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievement requirements */}
          {Object.keys(stepData.Achievement).length > 0 && (
            <div
              className="mb-3 rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Achievement Requirements
              </p>
              <div className="flex flex-col gap-1">
                {Object.values(stepData.Achievement).map((ach, i) => (
                  <p key={i} className="text-[11px] text-zinc-400">
                    • {ach as string}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Effects */}
          <div
            className="rounded-xl p-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Effects at Level {step}
            </p>
            <div className="flex flex-col gap-1.5">
              {Object.entries(stepData.Effects).map(([key, val]) => (
                <div key={key} className="flex items-start justify-between gap-3">
                  <span className="text-[11px] text-zinc-400">{key}</span>
                  <span className="shrink-0 font-mono text-[11px] font-semibold text-zinc-200">
                    {val as string | number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Step 8 — Verify

```bash
npx tsc --noEmit
```

Must return **zero errors**.

Then commit:
```bash
git add src/app/page.tsx src/data/mir4tools/ConquestTowerData.ts
git commit -m "feat: add Conquest Tower tab with step viewer, costs, effects"
git push
```

---

## НЕ трогать

- `src/lib/gameData.ts`
- `src/app/api/`
- Any other files not listed above
