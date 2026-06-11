# Windsurf Agent Prompt: Fix truncated gameData.ts

## Problem

The previous edit truncated `src/lib/gameData.ts` — it cut off mid-line at the
`getNextFixedSpawn` function body, removing ~100 lines of utility functions.
This causes TypeScript errors across 3 files.

## Fix — two steps, only `src/lib/gameData.ts` is touched

### Step 1 — Restore the file from git

Run this in the terminal:

```
git checkout HEAD -- src/lib/gameData.ts
```

This restores the original working file exactly as it was before the bad edit.

### Step 2 — Append REDMOON_BOSSES at the very end of the file

After the `getServerTimeString` function (the last function in the file), add:

```ts

// ─── REDMOON PURGATORY ──────────────────────────────────────────────────────

export interface RedmoonBoss {
  id: string;
  name: string;
  description: string;
  spawnHoursUTC8: number[];
  notifyMinutesBefore: number;
  /** Optional: weekday filter (0=Sun … 6=Sat). If set, only fires on that day. */
  dayOfWeek?: number;
}

export const REDMOON_BOSSES: RedmoonBoss[] = [
  {
    id: "redmoon_quest",
    name: "Redmoon Purgatory Quest Bosses",
    description:
      "Quest Boss Monsters spawn on all floors (1F–7F). Active for 5 minutes only — be ready!",
    spawnHoursUTC8: [6, 12, 18, 0],
    notifyMinutesBefore: 10,
  },
  {
    id: "redmoon_helbar",
    name: "[Hellish Lord] Helbar",
    description:
      "Special boss on Redmoon Purgatory 7F. Spawns every Wednesday at 23:00 UTC+8.",
    spawnHoursUTC8: [23],
    notifyMinutesBefore: 10,
    dayOfWeek: 3, // Wednesday
  },
];
```

### Step 3 — Verify

Run `npx tsc --noEmit`. It must return **zero errors**.

If it does — commit with message: `fix: restore gameData utilities + add REDMOON_BOSSES`

---

## What NOT to touch

- `src/app/api/cron/notify/route.ts` — already correct, do not change
- `src/app/page.tsx` — do not change
- Any other file
