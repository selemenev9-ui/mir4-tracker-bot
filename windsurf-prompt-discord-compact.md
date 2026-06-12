# Windsurf Agent Prompt: Discord-Compact Layout Pass

## Goal

The app runs inside a Discord Activity panel (~880px wide, ~600px tall). Everything is too large and padded for this constrained viewport. Tighten spacing, compact the header into a single row, improve low-contrast labels, and remove visual noise. **Only `src/app/page.tsx` and `src/app/layout.tsx` change.**

---

## 1 — `src/app/layout.tsx` — remove orb blobs & tighten body

Find:
```tsx
      <body className="min-h-full flex flex-col">
        <div className="bg-orb bg-orb-purple" aria-hidden="true" />
        <div className="bg-orb bg-orb-cyan" aria-hidden="true" />
        <div className="bg-orb bg-orb-red" aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-full">{children}</div>
      </body>
```

Replace with:
```tsx
      <body className="min-h-full flex flex-col overflow-hidden">
        <div className="bg-orb bg-orb-purple" aria-hidden="true" />
        <div className="bg-orb bg-orb-cyan" aria-hidden="true" />
        <div className="bg-orb bg-orb-red" aria-hidden="true" />
        <div className="relative z-10 flex flex-col min-h-full">{children}</div>
      </body>
```

---

## 2 — `src/app/page.tsx` — compact the main shell

Find:
```tsx
    <div className="min-h-screen text-zinc-100 antialiased">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 pb-12 pt-6 sm:px-8">
```

Replace with:
```tsx
    <div className="text-zinc-100 antialiased">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-3 px-3 pb-4 pt-3 sm:px-5">
```

---

## 3 — Compact the header into a single row, remove subtitle

Find the entire `<header ...>` block:
```tsx
        <header
          className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <h1
              className="text-xl font-bold tracking-tight sm:text-2xl"
              style={{
                background:
                  "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ⚔️ MIR4 Boss Tracker
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Real-time spawn tracker · Secret Peak · Magic Square · Mirage ·
              World Bosses
            </p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <ServerClock />
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span
                  className="text-xs"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    padding: "3px 10px",
                    color: "#94a3b8",
                  }}
                >
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

Replace with:
```tsx
        <header
          className="flex items-center justify-between gap-3 pb-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h1
            className="text-base font-bold tracking-tight shrink-0"
            style={{
              background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ⚔️ MIR4 Boss Tracker
          </h1>
          <div className="flex items-center gap-2 min-w-0">
            <ServerClock />
            {currentUser ? (
              <>
                <span
                  className="text-xs truncate max-w-[120px]"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "20px",
                    padding: "2px 8px",
                    color: "#94a3b8",
                  }}
                >
                  {currentUser.username}
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
                  className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
                >
                  change
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowNamePrompt(true)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2 shrink-0"
              >
                {sdkError ? "Login (web mode)" : "Login"}
              </button>
            )}
          </div>
        </header>
```

---

## 4 — Compact the tab navigation

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
        <nav className="flex gap-0.5 border-b border-zinc-800/80">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "-mb-px border-b-2 px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap",
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

---

## 5 — Remove the footer

Find and delete the entire footer block:
```tsx
        <footer className="mt-6 flex items-center justify-between border-t border-zinc-900 pt-4 text-[11px] text-zinc-600">
          <span>MIR4 Boss Tracker</span>
          <span>Next.js · Supabase · Discord SDK</span>
        </footer>
```

Replace with nothing (delete it entirely).

---

## 6 — Fix low-contrast "NEXT SPAWN" labels in WorldBossesView

The `text-zinc-600` on the "NEXT SPAWN" label is near-invisible on the dark background.

In the `WorldBossesView` function, find all occurrences of:
```tsx
text-zinc-600
```
that are used for "NEXT SPAWN" or similar caption labels (small uppercase labels above countdown timers), and replace with:
```tsx
text-zinc-500
```

Specifically replace:
```tsx
<span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-600">
```
with:
```tsx
<span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">
```

---

## 7 — Compact WorldBossesView internal spacing

In `WorldBossesView`, find:
```tsx
    <div className="flex flex-col gap-6">
```
(the outermost wrapper of WorldBossesView)

Replace with:
```tsx
    <div className="flex flex-col gap-4">
```

Find the DAILY/WEEKLY section headers like:
```tsx
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
```

Replace with:
```tsx
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
```

Find the boss card grid:
```tsx
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
```
Replace with:
```tsx
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
```

Find the boss card wrapper class string (the `glass-card rounded-2xl p-4` ones):
```tsx
            className="glass-card rounded-2xl p-4"
```
Replace with:
```tsx
            className="glass-card rounded-xl p-3"
```

---

## 8 — Compact MagicSquareView internal spacing

In `MagicSquareView`, find:
```tsx
    <div className="flex flex-col gap-4">
```
Replace with:
```tsx
    <div className="flex flex-col gap-3">
```

Find the chamber cards grid:
```tsx
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
```
Replace with:
```tsx
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
```

---

## 9 — Compact SecretPeakView floor buttons

In `SecretPeakView`, find the floor selector button padding:
```tsx
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
```
Replace with:
```tsx
            className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
```

---

## 10 — Verify

```bash
npx tsc --noEmit
```

Must return **zero errors**. Then:

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "fix: compact layout for Discord Activity panel — tighter spacing, single-row header, remove footer"
git push
```

---

## НЕ трогать

- `src/lib/gameData.ts`
- `src/app/api/`
- Any other files not listed above
