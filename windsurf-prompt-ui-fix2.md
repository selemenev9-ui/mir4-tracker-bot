# Windsurf Agent Prompt — UI Fix Pass 2 (Visual Depth)

## Problems to fix (UI only, zero logic changes)

---

## Fix 1 — `src/app/globals.css`

### 1a. Make orbs brighter and more visible

Find:
```css
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
```

Replace with:
```css
.bg-orb-purple {
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(124,58,237,0.65) 0%, rgba(109,40,217,0.3) 40%, transparent 70%);
  filter: blur(70px);
  top: -300px;
  left: -200px;
  animation: orb1 20s ease-in-out infinite;
}
.bg-orb-cyan {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(14,165,233,0.2) 50%, transparent 70%);
  filter: blur(60px);
  top: 30%;
  right: -200px;
  animation: orb2 25s ease-in-out infinite;
}
.bg-orb-red {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(239,68,68,0.4) 0%, rgba(220,38,38,0.15) 50%, transparent 70%);
  filter: blur(60px);
  bottom: -100px;
  left: 20%;
  animation: orb3 18s ease-in-out infinite;
}
```

### 1b. Make glass-card lighter so the glass effect is visible

Find:
```css
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
```

Replace with:
```css
.glass-card {
  background: rgba(15, 22, 50, 0.72);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.09);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}
.glass-card:hover {
  transform: translateY(-3px);
  border-color: rgba(255,255,255,0.18);
  box-shadow: 0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.13);
}
```

---

## Fix 2 — `src/app/page.tsx`

### 2a. Reward images — make them MUCH more visible

Find this block inside the `MirageView` card (the reward image rendering):
```tsx
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
```

Replace with:
```tsx
                  <Image
                    src={boss.rewardImage}
                    alt={`${boss.name} rewards`}
                    fill
                    className="object-cover object-top"
                    style={{ opacity: 0.9, filter: 'saturate(1.15) contrast(1.05)' }}
                    unoptimized
                  />
                  {/* Gradient fade into card */}
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 35%, rgba(15,22,50,0.85) 100%)' }} />
```

### 2b. Increase reward image area height from h-32 to h-36

Find:
```tsx
              {boss.rewardImage ? (
                <div className="relative h-32 overflow-hidden">
```

Replace with:
```tsx
              {boss.rewardImage ? (
                <div className="relative h-36 overflow-hidden">
```

### 2c. Apply glass-card to World Bosses cards

Find the WorldBossesView. Look for the Daily boss card — it currently uses something like `rounded-2xl border border-zinc-800` or similar flat styling. Find ALL card `<div>` wrappers in `WorldBossesView` that have plain dark styling like:
```tsx
className="rounded-2xl border border-zinc-800
```
or
```tsx
className="rounded-xl border border-zinc-800
```
or
```tsx
className="rounded-2xl border border-zinc-700
```

For each one found inside `WorldBossesView`, change the className to use `glass-card` and remove conflicting border/background classes. Example:

If you find:
```tsx
<div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/80 p-4">
```
Change to:
```tsx
<div className="glass-card rounded-2xl p-4">
```

Apply this pattern to all flat dark cards inside WorldBossesView.

### 2d. Make the timer row inside Mirage cards stand out more

Find:
```tsx
                <div
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
```

Replace with:
```tsx
                <div
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
                >
```

### 2e. Add a subtle top gradient border to glass cards (shimmer line at top)

In the Mirage card `<div className={`glass-card rounded-2xl overflow-hidden ${cardExtraClass}`}>`,

Change to:
```tsx
              <div
                className={`glass-card rounded-2xl overflow-hidden ${cardExtraClass}`}
                style={{ position: 'relative' }}
              >
                {/* Top shimmer line */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), rgba(168,85,247,0.4), rgba(255,255,255,0.2), transparent)',
                  zIndex: 2
                }} />
```

(Add the shimmer div as the first child inside each glass card)

### 2f. Make spawn time chips slightly more visible

Find:
```tsx
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569' }}
```

Replace with:
```tsx
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#64748b' }}
```

---

## Fix 3 — After all changes

```bash
npm run lint && npx tsc --noEmit
```

If clean:
```bash
git add -A && git commit -m "fix: boost visual depth — brighter orbs, visible rewards, glass on World Bosses" && git push
```
