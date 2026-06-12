# Windsurf Agent Prompt: Mobile-Responsive Layout

## Problem

The app was designed for Discord desktop (~880px). When opened in a mobile browser via the "Open in Browser" link, it breaks:
- Tab bar overflows horizontally (5 tabs + long labels don't fit 390px)
- Header is too cramped (title + clock + username all in one row)
- Some card paddings/grids are too large for narrow screens

## Solution

Make the shell (header + tab nav) mobile-friendly. Content sections already use mostly single-column layouts and need minimal changes.

**File to touch:** `src/app/page.tsx` only.  
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

## Step 1 — Fix the tab navigation bar

Find:
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

Replace with:
```tsx
        <nav className="flex gap-0 overflow-x-auto border-b border-zinc-800/80 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "-mb-px shrink-0 border-b-2 px-2.5 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap sm:px-3 sm:text-xs",
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

**What changed:** `overflow-x-auto` + hidden scrollbar so tabs scroll horizontally on narrow screens; `shrink-0` so tabs don't compress; slightly smaller font/padding on mobile with `sm:` breakpoint restore.

---

## Step 2 — Fix the header

Find:
```tsx
        <header
          className="flex items-center justify-between gap-3 pb-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h1
            className="shrink-0 text-base font-bold tracking-tight"
```

Replace with:
```tsx
        <header
          className="flex items-center justify-between gap-2 pb-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <h1
            className="shrink-0 text-sm font-bold tracking-tight sm:text-base"
```

Find (ServerClock wrapper div):
```tsx
          <div className="flex min-w-0 items-center gap-2">
            <ServerClock />
```

Replace with:
```tsx
          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden sm:block"><ServerClock /></span>
```

**What changed:** Slightly smaller title on mobile (`text-sm` → `sm:text-base`); clock hidden on mobile to save space (`hidden sm:block`).

---

## Step 3 — Fix the name prompt overlay for mobile

Find the name prompt modal (the `showNamePrompt` overlay). It likely has a fixed/absolute container. Find the inner card div — it will look something like:

```tsx
            <div
              className="... rounded-2xl p-6 ..."
```

Add `mx-4` to the className so it doesn't touch screen edges on mobile:

```tsx
            <div
              className="... mx-4 rounded-2xl p-6 ..."
```

*(If no `mx-` class exists on the inner card already.)*

---

## Step 4 — Fix card grid in WorldBossesView

Find any `grid-cols-2` in `WorldBossesView` or other views that produces a 2-column grid:

```tsx
        <div className="grid grid-cols-2 gap-3">
```

Change to:
```tsx
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
```

This makes cards single-column on mobile and 2-column on larger screens.

---

## Step 5 — Fix the viewport meta tag (if missing)

Open `src/app/layout.tsx`. Check if there is a `<meta name="viewport" ...>` tag inside `<head>`. If it is missing, add it via the Next.js `metadata` export:

Find:
```tsx
export const metadata: Metadata = {
  title: "MIR4 Boss Tracker",
  description:
    "Real-time boss spawn tracker for MIR4 guilds — Secret Peak, Mirage, and World Bosses.",
};
```

Replace with:
```tsx
export const metadata: Metadata = {
  title: "MIR4 Boss Tracker",
  description:
    "Real-time boss spawn tracker for MIR4 guilds — Secret Peak, Mirage, and World Bosses.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};
```

*(Next.js 14+ supports `viewport` as a metadata field.)*

---

## Step 6 — Verify

```bash
npx tsc --noEmit
```

Zero errors.

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "fix: mobile-responsive layout — scrollable tab bar, compact header, single-col cards"
git push
```

---

## НЕ трогать

- `src/app/api/`
- `src/lib/gameData.ts`
- Any data files
