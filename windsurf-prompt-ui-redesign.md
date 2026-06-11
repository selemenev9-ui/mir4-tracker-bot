# Windsurf Agent Prompt — TOP-level UI/UX Redesign + Reward Images

## Overview

Full visual overhaul of the MIR4 Boss Tracker. **Zero logic changes** — only visual/CSS.
Goal: awwwards-level dark gaming aesthetic with glassmorphism, animated background, glow timers, and reward screenshots in Mirage cards.

---

## Step 1 — Copy reward images to public/rewards/

Open terminal in the project root and run these PowerShell commands:

```powershell
New-Item -ItemType Directory -Force -Path "public\rewards"

$src = "C:\Users\Administrator\Desktop\rewards"
$dst = "public\rewards"

Copy-Item "$src\BOLTOX.png"                   "$dst\boltox.png"
Copy-Item "$src\BOODO.png"                    "$dst\boodo.png"
Copy-Item "$src\BULLFACE FIEND KING.png"      "$dst\bullface-fiend-king.png"
Copy-Item "$src\DUSK ARMADO EMPEROR.png"      "$dst\dusk-armado-emperor.png"
Copy-Item "$src\FALUK.png"                    "$dst\faluk.png"
Copy-Item "$src\JUHUI.png"                    "$dst\juhui.png"
Copy-Item "$src\KURILAICA.png"                "$dst\kurilaica.png"
Copy-Item "$src\MARA.png"                     "$dst\mara.png"
Copy-Item "$src\MATA.png"                     "$dst\mata.png"
Copy-Item "$src\MOKGANG.png"                  "$dst\mokgang.png"
Copy-Item "$src\NEFARIOX OBDURATE ZENITH.png" "$dst\nefariox.png"
Copy-Item "$src\OBSCENE YETICLOPS.png"        "$dst\obscene-yeticlops.png"
Copy-Item "$src\SURA.png"                     "$dst\sura.png"
Copy-Item "$src\TAEHYUL.png"                  "$dst\taehyul.png"
Copy-Item "$src\TIME WARPER FIEND.png"        "$dst\time-warper-fiend.png"
Copy-Item "$src\TOMBEAST GYO.png"             "$dst\tombeast-gyo.png"
Copy-Item "$src\TRANSFORMED HONG YEOM.png"    "$dst\transformed-hong-yeom.png"
Copy-Item "$src\WUIHAN.png"                   "$dst\wuihan.png"
Copy-Item "$src\YEO WIHUANG.png"              "$dst\yeo-wihuang.png"
Copy-Item "$src\YIUN.png"                     "$dst\yiun.png"
```

---

## Step 2 — `src/lib/gameData.ts`

### 2a. Add `rewardImage` field to MirageBoss interface

Find:
```typescript
export interface MirageBoss {
  id: string;
  name: string;
  layer: number;
  world: string; // e.g. "W1", "W2"
```

Replace with:
```typescript
export interface MirageBoss {
  id: string;
  name: string;
  layer: number;
  world: string; // e.g. "W1", "W2"
  rewardImage?: string; // path inside /public, e.g. "/rewards/boltox.png"
```

### 2b. Add rewardImage to each Layer 3 boss

For each boss entry below, add the `rewardImage` field. Find each `id:` line and add the field on the next line after `world:`.

| Boss id | rewardImage |
|---|---|
| `mir_l3_w1_mata` | `/rewards/mata.png` |
| `mir_l3_w1_boltox` | `/rewards/boltox.png` |
| `mir_l3_w1_bfk` | `/rewards/bullface-fiend-king.png` |
| `mir_l3_w8_yew` | `/rewards/yeo-wihuang.png` |
| `mir_l3_w7_tae` | `/rewards/taehyul.png` |
| `mir_l3_w7_yiun` | `/rewards/yiun.png` |
| `mir_l3_w4_noz` | `/rewards/nefariox.png` |
| `mir_l3_w4_kuri` | `/rewards/kurilaica.png` |
| `mir_l3_w2_juhui` | `/rewards/juhui.png` |
| `mir_l3_w5_faluk` | `/rewards/faluk.png` |
| `mir_l3_w5_twf` | `/rewards/time-warper-fiend.png` |
| `mir_l3_w3_gyo` | `/rewards/tombeast-gyo.png` |
| `mir_l3_w3_dae` | `/rewards/dusk-armado-emperor.png` |
| `mir_l3_w3_boodo` | `/rewards/boodo.png` |
| `mir_l3_w3_mara` | `/rewards/mara.png` |
| `mir_l3_w6_sura` | `/rewards/sura.png` |
| `mir_l3_w6_mok` | `/rewards/mokgang.png` |
| `mir_l3_w6_wui` | `/rewards/wuihan.png` |
| `mir_l3_w6_yeti` | `/rewards/obscene-yeticlops.png` |
| `mir_l3_w6_thy` | `/rewards/transformed-hong-yeom.png` |

---

## Step 3 — `src/app/globals.css`

Replace the entire file with:

```css
@import "tailwindcss";

:root {
  --background: #030711;
  --foreground: #e2e8f0;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans, system-ui);
  overflow-x: hidden;
}

/* ── Animated background orbs ─────────────────────────────── */

@keyframes orb1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(4%, -7%) scale(1.06); }
  50%  { transform: translate(-3%, 5%) scale(0.94); }
  75%  { transform: translate(7%, 3%) scale(1.03); }
}
@keyframes orb2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(-5%, 9%) scale(1.09); }
  66%  { transform: translate(4%, -6%) scale(0.91); }
}
@keyframes orb3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(-7%, -5%) scale(1.12); }
}

.bg-orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  will-change: transform;
}
.bg-orb-purple {
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(109,40,217,0.45) 0%, transparent 70%);
  filter: blur(90px);
  top: -250px;
  left: -150px;
  animation: orb1 20s ease-in-out infinite;
}
.bg-orb-cyan {
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%);
  filter: blur(80px);
  top: 35%;
  right: -180px;
  animation: orb2 25s ease-in-out infinite;
}
.bg-orb-red {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%);
  filter: blur(70px);
  bottom: -80px;
  left: 25%;
  animation: orb3 18s ease-in-out infinite;
}

/* ── Timer pulse animations ────────────────────────────────── */

@keyframes glow-pulse-green {
  0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.3), 0 0 60px rgba(34,197,94,0.1), inset 0 1px 0 rgba(255,255,255,0.08); }
  50%       { box-shadow: 0 0 35px rgba(34,197,94,0.5), 0 0 80px rgba(34,197,94,0.2), inset 0 1px 0 rgba(255,255,255,0.08); }
}
@keyframes glow-pulse-red {
  0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.35), inset 0 1px 0 rgba(255,255,255,0.06); }
  50%       { box-shadow: 0 0 40px rgba(239,68,68,0.6), 0 0 70px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.06); }
}
@keyframes text-flicker {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}

.card-spawned  { animation: glow-pulse-green 2s ease-in-out infinite; }
.card-critical { animation: glow-pulse-red   1s ease-in-out infinite; }
.timer-spawned { animation: text-flicker 1.8s ease-in-out infinite; }
.timer-critical{ animation: text-flicker 0.9s ease-in-out infinite; }

/* ── Glassmorphism card base ───────────────────────────────── */

.glass-card {
  background: rgba(8, 14, 36, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.09);
}
.glass-card-warning {
  border-color: rgba(245,158,11,0.3);
  box-shadow: 0 0 24px rgba(245,158,11,0.2), 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
}

/* ── Scrollbar ─────────────────────────────────────────────── */

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
```

---

## Step 4 — `src/app/layout.tsx`

Replace the body line to add animated orb divs:

Find:
```tsx
      <body className="min-h-full flex flex-col">{children}</body>
```

Replace with:
```tsx
      <body className="min-h-full flex flex-col">
        <div className="bg-orb bg-orb-purple" aria-hidden="true" />
        <div className="bg-orb bg-orb-cyan"   aria-hidden="true" />
        <div className="bg-orb bg-orb-red"    aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-full">{children}</div>
      </body>
```

---

## Step 5 — `src/app/page.tsx`

### 5a. Replace the outer wrapper and header

Find:
```tsx
  return (
    <div className="min-h-screen bg-[#050712] text-zinc-100 antialiased">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-8">
        <header className="flex flex-col gap-3 border-b border-zinc-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-50 sm:text-2xl">
              MIR4 Boss Tracker
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Real-time spawn tracker for Secret Peak, Magic Square, Mirage &amp;
              World Bosses
            </p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <ServerClock />
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">
                  <span className="font-medium text-zinc-300">
                    {currentUser.username}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("mir4_username");
                    localStorage.removeItem("mir4_user_id");
                    setCurrentUser(null);
                    setSdkReady(false);
                    setSdkError(false);
                    setShowNamePrompt(true);
                    setNameInput("");
                  }}
                  className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNamePrompt(true)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                {sdkError ? "Login (web mode)" : "Login"}
              </button>
            )}
          </div>
        </header>
```

Replace with:
```tsx
  return (
    <div className="min-h-screen text-zinc-100 antialiased">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-8">
        <header className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl"
              style={{ background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ⚔️ MIR4 Boss Tracker
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Real-time spawn tracker · Secret Peak · Magic Square · Mirage · World Bosses
            </p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <ServerClock />
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '3px 10px', color: '#94a3b8' }}>
                  👤 <span className="font-medium text-zinc-200">{currentUser.username}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("mir4_username");
                    localStorage.removeItem("mir4_user_id");
                    setCurrentUser(null);
                    setSdkReady(false);
                    setSdkError(false);
                    setShowNamePrompt(true);
                    setNameInput("");
                  }}
                  className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowNamePrompt(true)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                {sdkError ? "Login (web mode)" : "Login"}
              </button>
            )}
          </div>
        </header>
```

### 5b. Replace tab navigation

Find:
```tsx
        <nav className="flex gap-1 border-b border-zinc-800/80">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-all",
                activeTab === tab.id
                  ? "border-red-500 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-300",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </nav>
```

Replace with:
```tsx
        <nav className="flex gap-1 overflow-x-auto pb-px"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="relative -mb-px whitespace-nowrap px-5 py-2.5 text-sm font-semibold transition-all duration-200"
              style={activeTab === tab.id ? {
                color: '#f1f5f9',
                borderBottom: '2px solid #a855f7',
                textShadow: '0 0 20px rgba(168,85,247,0.8)',
              } : {
                color: '#64748b',
                borderBottom: '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
```

### 5c. Replace CountdownBadge component

Find the entire `function CountdownBadge` and replace with:

```tsx
function CountdownBadge({ nextSpawn, large = false }: { nextSpawn: Date | null; large?: boolean }) {
  const [ms, setMs] = useState<number>(
    () => (nextSpawn ? nextSpawn.getTime() - Date.now() : -1)
  );

  useEffect(() => {
    if (!nextSpawn) return;
    const tick = () => setMs(nextSpawn.getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [nextSpawn]);

  if (!nextSpawn) {
    return <span className="font-mono text-xs text-zinc-600">—</span>;
  }

  const label = formatCountdown(ms);
  const isSpawned = ms <= 0;
  const isCritical = ms > 0 && ms < 10 * 60 * 1000;
  const isWarning = ms >= 10 * 60 * 1000 && ms < 60 * 60 * 1000;

  if (isSpawned) {
    return (
      <span
        className={`timer-spawned font-semibold tracking-wider ${large ? "text-base" : "text-sm"}`}
        style={{ color: '#4ade80', textShadow: '0 0 16px rgba(74,222,128,0.7)' }}
        suppressHydrationWarning
      >
        ● SPAWNED
      </span>
    );
  }

  const color = isCritical ? '#f87171' : isWarning ? '#fbbf24' : '#94a3b8';
  const shadow = isCritical
    ? '0 0 12px rgba(248,113,113,0.6)'
    : isWarning
    ? '0 0 10px rgba(251,191,36,0.4)'
    : 'none';

  return (
    <span
      className={`font-mono font-semibold tabular-nums tracking-wider ${isCritical ? "timer-critical" : ""} ${large ? "text-xl" : "text-sm"}`}
      style={{ color, textShadow: shadow }}
      suppressHydrationWarning
    >
      {label}
    </span>
  );
}
```

### 5d. Replace ServerClock component

Find the entire `function ServerClock` and replace with:

```tsx
function ServerClock() {
  const [time, setTime] = useState(getServerTimeString());

  useEffect(() => {
    const id = setInterval(() => setTime(getServerTimeString()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '4px 12px' }}>
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"
        style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8), 0 0 12px rgba(52,211,153,0.4)' }} />
      <span
        className="font-mono text-xs text-zinc-300 tracking-widest"
        suppressHydrationWarning
      >
        {time} UTC+8
      </span>
    </div>
  );
}
```

### 5e. Replace MirageView card grid

Find this entire block inside `MirageView` (the `<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">` and everything inside it up to the closing `</div>` of the grid):

```tsx
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((boss: MirageBoss) => {
          const nextSpawn = getNextSpawnFromTimes(boss.spawnTimes);
          const classes =
            "rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-4 backdrop-blur-sm transition-all";

          return (
            <div key={boss.id} className={classes}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <div className="mb-0.5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500">
                    <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-semibold">
                      Layer {boss.layer}
                    </span>
                    <span className="rounded bg-zinc-800/80 px-1.5 py-0.5 font-semibold">
                      {boss.world}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    {boss.name}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    {boss.location}
                  </p>
                </div>
                <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                  {boss.level}
                </span>
              </div>

              <div className="mb-3 flex flex-wrap gap-1">
                {boss.spawnTimes.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                  Next spawn
                </span>
                <CountdownBadge nextSpawn={nextSpawn} />
              </div>
            </div>
          );
        })}
      </div>
```

Replace with:

```tsx
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((boss: MirageBoss) => {
          const nextSpawn = getNextSpawnFromTimes(boss.spawnTimes);
          const msLeft = nextSpawn ? nextSpawn.getTime() - Date.now() : Infinity;
          const isSpawned = msLeft <= 0;
          const isCritical = msLeft > 0 && msLeft < 10 * 60 * 1000;
          const isWarning = msLeft >= 10 * 60 * 1000 && msLeft < 60 * 60 * 1000;

          const cardExtraClass = isSpawned ? "card-spawned" : isCritical ? "card-critical" : isWarning ? "glass-card-warning" : "";

          return (
            <div
              key={boss.id}
              className={`glass-card rounded-2xl overflow-hidden ${cardExtraClass}`}
            >
              {/* Reward image strip */}
              {boss.rewardImage ? (
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={boss.rewardImage}
                    alt={`${boss.name} rewards`}
                    fill
                    className="object-cover object-top"
                    style={{ opacity: 0.55, filter: 'brightness(0.85) saturate(1.1)' }}
                    unoptimized
                  />
                  {/* Gradient fade into card */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(8,14,36,0.9) 100%)' }} />
                  {/* Tags on top of image */}
                  <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8' }}
                    >
                      Layer {boss.layer}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(168,85,247,0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(168,85,247,0.4)', color: '#d8b4fe' }}
                    >
                      {boss.world}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}
                    >
                      {boss.level}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 pt-4">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b' }}
                  >
                    Layer {boss.layer}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.35)', color: '#d8b4fe' }}
                  >
                    {boss.world}
                  </span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }}
                  >
                    {boss.level}
                  </span>
                </div>
              )}

              {/* Card body */}
              <div className="px-4 pb-4 pt-3">
                <h3 className="text-sm font-bold text-zinc-100 leading-snug mb-0.5">
                  {boss.name}
                </h3>
                <p className="text-[11px] text-zinc-500 mb-3">{boss.location}</p>

                {/* Spawn time chips */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {boss.spawnTimes.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Timer */}
                <div
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600">
                    Next Spawn
                  </span>
                  <CountdownBadge nextSpawn={nextSpawn} large />
                </div>
              </div>
            </div>
          );
        })}
      </div>
```

### 5f. Replace the Name Prompt Modal

Find:
```tsx
      {/* Name Prompt Modal */}
      {showNamePrompt && !currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700/80 bg-zinc-950 p-6 shadow-2xl">
            <h2 className="mb-1 text-base font-bold text-zinc-50">Who are you?</h2>
            <p className="mb-4 text-xs text-zinc-500">
              Enter your Discord username to report boss kills. Saved
              automatically.
```

Replace with:
```tsx
      {/* Name Prompt Modal */}
      {showNamePrompt && !currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(3,7,17,0.85)', backdropFilter: 'blur(16px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ background: 'rgba(8,14,36,0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 0 80px rgba(109,40,217,0.2), 0 32px 64px rgba(0,0,0,0.7)' }}>
            <h2 className="mb-1 text-base font-bold text-zinc-50">Who are you?</h2>
            <p className="mb-4 text-xs text-zinc-500">
              Enter your Discord username to report boss kills. Saved
              automatically.
```

### 5g. Upgrade floor selector buttons (used in SecretPeakView and MagicSquareView)

Find (in SecretPeakView floor selector):
```tsx
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
              selectedFloor === f
                ? "border-red-500/80 bg-red-500/20 text-red-300"
                : "border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
            ].join(" ")}
```

Replace with:
```tsx
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={selectedFloor === f ? {
              background: 'rgba(168,85,247,0.2)',
              border: '1px solid rgba(168,85,247,0.5)',
              color: '#d8b4fe',
              boxShadow: '0 0 14px rgba(168,85,247,0.25)',
            } : {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#475569',
            }}
```

### 5h. Upgrade the Secret Peak map container

Find:
```tsx
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950/80">
```

Replace with:
```tsx
      <div className="relative rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(8,14,36,0.6)', backdropFilter: 'blur(8px)', boxShadow: '0 0 40px rgba(0,0,0,0.6)' }}>
```

### 5i. Upgrade Secret Peak card list (the list below the map)

In `SecretPeakView`, find the card classes for `secretPeakCardClasses` function. Replace the entire function:

Find:
```tsx
function secretPeakCardClasses(boss: SecretPeakBoss, state: SecretPeakBossState) {
  const base =
    "flex items-center justify-between rounded-xl border px-4 py-3 backdrop-blur-sm";

  if (state === "cooldown") {
    return `${base} border-zinc-700/60 bg-zinc-900/80 text-zinc-300`;
  }

  switch (boss.type) {
    case "teal":
      return `${base} border-sky-500/30 bg-sky-500/5`;
    case "gold":
      return `${base} border-amber-500/30 bg-amber-500/5`;
    case "red_lower":
    case "red_upper":
      return `${base} border-red-500/30 bg-red-500/5`;
    case "chamber":
      return `${base} border-violet-500/30 bg-violet-500/5`;
    default:
      return `${base} border-zinc-700/60 bg-zinc-900/60`;
  }
}
```

Replace with:
```tsx
function secretPeakCardClasses(boss: SecretPeakBoss, state: SecretPeakBossState) {
  const base = "flex items-center justify-between rounded-xl px-4 py-3 glass-card";

  if (state === "cooldown") return base;

  switch (boss.type) {
    case "teal":      return `${base} card-warning`;
    case "gold":      return base;
    case "red_lower":
    case "red_upper": return `${base} card-critical`;
    case "chamber":   return base;
    default:          return base;
  }
}
```

---

## Step 6 — After all changes

```bash
npm run lint && npx tsc --noEmit
```

Fix any TypeScript errors (most likely just unused import warnings).

If clean — commit and push:
```bash
git add -A && git commit -m "feat: TOP UI redesign - glassmorphism, animated bg orbs, reward images in Mirage cards" && git push
```

---

## Expected result

- **Background**: 3 huge blurred color orbs (purple/cyan/red) floating and breathing behind everything
- **All cards**: deep glass with blur, subtle border, hover lift
- **Mirage cards**: reward screenshot visible at top of each card with gradient fade, frosted-glass tags overlaid
- **Timers**: large colored glowing text — grey/amber/red pulsing/green SPAWNED
- **Spawned cards**: green glow pulsing around the whole card
- **Critical cards**: red glow pulsing
- **Navigation tabs**: purple glowing underline on active tab
- **Header**: gradient text title, pill-style clock and user badge
- **No logic changes** — all timer/Supabase/Discord logic untouched
