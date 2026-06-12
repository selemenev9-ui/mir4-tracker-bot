# Windsurf Agent Prompt: Add Mining/Gathering Boost Calculator tab

## Task

Add a new **"Calculator"** tab to `src/app/page.tsx`. Only this one file changes.

---

## Step 1 — Add "calculator" to the Tab type

Find line:
```ts
type Tab = "secret_peak" | "mirage" | "world_bosses" | "magic_square";
```

Replace with:
```ts
type Tab = "secret_peak" | "mirage" | "world_bosses" | "magic_square" | "calculator";
```

---

## Step 2 — Add the MiningCalculatorView component

Insert this entire function **before** the `// ─── Main Page ─────` comment (before `export default function DashboardPage()`):

```tsx
// ─── Mining / Gathering Calculator View ────────────────────────────────────

function BoostSection({
  title,
  emoji,
  note,
  id,
}: {
  title: string;
  emoji: string;
  note: string;
  id: string;
}) {
  const [boost, setBoost] = useState(0);

  const secPerHit = 10 / (1 + boost / 100);
  const speedup = (10 / secPerHit).toFixed(2);
  const hitsPerMin = (60 / secPerHit).toFixed(1);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <h3 className="mb-4 text-sm font-semibold text-zinc-300">
        {emoji} {title}
      </h3>

      {/* Boost input */}
      <div className="mb-5 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={1000}
          step={0.1}
          value={Math.min(boost, 1000)}
          onChange={(e) => setBoost(parseFloat(e.target.value))}
          className="h-1.5 flex-1 appearance-none rounded-full bg-zinc-700 accent-red-500"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            step={0.1}
            value={boost}
            onChange={(e) => setBoost(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-20 rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-right text-sm text-zinc-100 outline-none focus:border-red-500/60"
          />
          <span className="text-sm text-zinc-500">%</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          { label: "Сек / удар", value: secPerHit.toFixed(2), unit: "сек" },
          { label: "Ускорение", value: `${speedup}×`, unit: "быстрее" },
          { label: "Ударов / мин", value: hitsPerMin, unit: "уд/мин" },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="mb-1 text-[11px] text-zinc-500">{label}</p>
            <p className="text-lg font-semibold text-zinc-100">{value}</p>
            <p className="text-[11px] text-zinc-600">{unit}</p>
          </div>
        ))}
      </div>

      {/* Mining-only: node table + DS/hour */}
      {id === "mining" && (
        <MiningNodeTable secPerHit={secPerHit} />
      )}

      <p className="mt-3 text-[11px] text-zinc-600">{note}</p>
    </div>
  );
}

const MINING_NODES = [
  { color: "Зелёный", dotColor: "#22c55e", hp: 50,  dsPerHit: 60  },
  { color: "Синий",   dotColor: "#3b82f6", hp: 75,  dsPerHit: 100 },
  { color: "Красный", dotColor: "#ef4444", hp: 100, dsPerHit: 150 },
  { color: "Золотой", dotColor: "#eab308", hp: 125, dsPerHit: 300 },
];

function MiningNodeTable({ secPerHit }: { secPerHit: number }) {
  return (
    <>
      <p className="mb-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        Magic Square / Secret Peak — F1
      </p>
      <div className="mb-1 grid grid-cols-5 gap-1 text-[11px] text-zinc-600 font-semibold uppercase tracking-wide px-1">
        <span>Цвет</span>
        <span className="text-right">Хиты</span>
        <span className="text-right">DS/уд</span>
        <span className="text-right">Время</span>
        <span className="text-right">DS/нода</span>
      </div>
      {MINING_NODES.map((n) => {
        const totalSec = n.hp * secPerHit;
        const timeLabel =
          totalSec >= 60
            ? `${(totalSec / 60).toFixed(2)}m`
            : `${totalSec.toFixed(1)}s`;
        const dsPerHour = Math.round((n.hp * n.dsPerHit) / totalSec * 3600);
        return (
          <div
            key={n.color}
            className="grid grid-cols-5 gap-1 border-b border-zinc-800/60 px-1 py-1.5 text-xs"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ background: n.dotColor }}
              />
              {n.color}
            </span>
            <span className="text-right text-zinc-400">{n.hp}</span>
            <span className="text-right text-zinc-400">{n.dsPerHit}</span>
            <span className="text-right text-zinc-300">{timeLabel}</span>
            <span className="text-right text-zinc-300">
              {(n.hp * n.dsPerHit).toLocaleString()}
            </span>
          </div>
        );
      })}

      {/* DS/hour row */}
      <p className="mb-2 mt-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
        DS в час (F1, без перерывов)
      </p>
      <div className="grid grid-cols-4 gap-2">
        {MINING_NODES.map((n) => {
          const totalSec = n.hp * secPerHit;
          const dsPerHour = Math.round((n.hp * n.dsPerHit) / totalSec * 3600);
          return (
            <div
              key={n.color}
              className="rounded-lg p-2 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-[11px] font-semibold" style={{ color: n.dotColor }}>
                {n.color}
              </p>
              <p className="text-sm font-semibold text-zinc-100">
                {dsPerHour.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-600">DS/ч</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

function MiningCalculatorView() {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      <BoostSection
        id="mining"
        title="Mining Boost"
        emoji="⛏️"
        note="Формула: 10 / (1 + boost/100) сек/удар — MIR4 Wiki. +~10% DS за каждый следующий этаж."
      />
      <BoostSection
        id="gathering"
        title="Gathering Boost"
        emoji="🌿"
        note="Формула по аналогии с Mining. База — 10 сек/сбор. Проверь в игре при 0%."
      />
      <BoostSection
        id="energy"
        title="Energy Gathering Boost"
        emoji="⚡"
        note="Возможно влияет на количество энергии, а не скорость. Числа предположительные — проверяй в игре."
      />
    </div>
  );
}
```

---

## Step 3 — Add tab to the tabs array

Find:
```ts
  const tabs: { id: Tab; label: string }[] = [
    { id: "world_bosses", label: "World Bosses" },
    { id: "secret_peak", label: "Secret Peak" },
    { id: "magic_square", label: "Magic Square" },
    { id: "mirage", label: "Mirage" },
  ];
```

Replace with:
```ts
  const tabs: { id: Tab; label: string }[] = [
    { id: "world_bosses", label: "World Bosses" },
    { id: "secret_peak", label: "Secret Peak" },
    { id: "magic_square", label: "Magic Square" },
    { id: "mirage", label: "Mirage" },
    { id: "calculator", label: "⛏ Calculator" },
  ];
```

---

## Step 4 — Add tab content to the section

Find:
```tsx
          {activeTab === "world_bosses" && <WorldBossesView />}
```

Add directly after it:
```tsx
          {activeTab === "calculator" && <MiningCalculatorView />}
```

---

## Step 5 — Verify

```bash
npx tsc --noEmit
```

Must return **zero errors**. Then:

```bash
git add src/app/page.tsx
git commit -m "feat: add Mining/Gathering Boost Calculator tab"
git push
```

---

## НЕ трогать

- `src/lib/gameData.ts`
- `src/app/api/cron/notify/route.ts`
- Любые другие файлы
