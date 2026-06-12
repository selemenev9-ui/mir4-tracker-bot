# Windsurf Agent Prompt: Keep Only Lab & Valley Notifications

## Goal

Reduce Discord notifications to **Labyrinth and Valley bosses only**.  
Remove notifications for: Secret Peak, Magic Square, Mirage, Redmoon, and non-valley World Bosses (Nerkan, Turkan).

**File to touch:** `src/app/api/cron/notify/route.ts` only.

---

## Step 1 — Remove sections 3–6 entirely

In `route.ts`, delete the following 4 blocks completely (including their comments):

**Block 3 — Secret Peak Red Lords** (starts with `// ── 3. Secret Peak`):
```typescript
  // ── 3. Secret Peak — Red Lords (fixed schedule, same times on all floors) ──
  const redLordTypes = [
    ...
  ];

  for (const rl of redLordTypes) {
    ...
  }
```

**Block 4 — Magic Square** (starts with `// ── 4. Magic Square`):
```typescript
  // ── 4. Magic Square — Leaders Chamber III (every 3h from 00:00) ────────────
  const chamber3Hours = ...;

  for (const spawnHour of chamber3Hours) {
    ...
  }
```

**Block 5 — Mirage Bosses** (starts with `// ── 5. Mirage`):
```typescript
  // ── 5. Mirage Bosses (fixed spawn schedule) ─────────────────────────────────
  for (const boss of MIRAGE_BOSSES) {
    ...
  }
```

**Block 6 — Redmoon** (starts with `// ── 6. Redmoon`):
```typescript
  // ── 6. Redmoon Purgatory Bosses ─────────────────────────────────────────────
  for (const boss of REDMOON_BOSSES) {
    ...
  }
```

---

## Step 2 — Remove unused imports

At the top of the file, find:
```typescript
import {
  DAILY_WORLD_BOSSES,
  WEEKLY_WORLD_BOSSES,
  MAGIC_SQUARE_BOSSES,
  MIRAGE_BOSSES,
  REDMOON_BOSSES,
} from "@/lib/gameData";
```

Replace with:
```typescript
import {
  DAILY_WORLD_BOSSES,
  WEEKLY_WORLD_BOSSES,
} from "@/lib/gameData";
```

---

## Step 3 — Filter Weekly World Bosses to Valley only

In block 2 (`// ── 2. Weekly World Bosses`), the loop iterates over `WEEKLY_WORLD_BOSSES`.  
Add an id-based filter so only Valley/Labyrinth entries fire notifications.

Find:
```typescript
  // ── 2. Weekly World Bosses (unchanged) ─────────────────────────────────────
  for (const boss of WEEKLY_WORLD_BOSSES) {
    if (boss.dayOfWeek === dayOfWeek) {
```

Replace with:
```typescript
  // ── 2. Weekly World Bosses — Valley only ───────────────────────────────────
  const VALLEY_LAB_IDS = new Set(["krukan", "valley_capture", "wraiths", "utukan"]);
  for (const boss of WEEKLY_WORLD_BOSSES) {
    if (!VALLEY_LAB_IDS.has(boss.id)) continue;
    if (boss.dayOfWeek === dayOfWeek) {
```

> This keeps: Krukan (Bicheon Valley 4F), Valley Capture, Wraiths (All Valley 4F), Utukan (Snake Valley 4F).  
> This removes: Nerkan and Turkan (generic World Boss Zone).

---

## Step 4 — Verify TypeScript

```bash
npx tsc --noEmit
```

Errors in `src/data/mir4tools/**` are pre-existing and unrelated — ignore them.  
There must be **zero new errors** in `src/app/api/cron/notify/route.ts`.

---

## Step 5 — Commit

```bash
git add src/app/api/cron/notify/route.ts
git commit -m "fix: notify only Lab and Valley bosses, remove Secret Peak / Magic Square / Mirage / Redmoon / generic World Boss alerts"
git push
```

---

## Result

After deploy, the bot will only ping `@here` for:

| Boss | Schedule |
|------|----------|
| Labyrinth Bosses | Daily 10:00, 20:00 UTC+8 |
| Hidden Valley Bosses | Daily 12:00, 22:00 UTC+8 |
| Demon Spider Krukan | Monday 22:00 UTC+8 |
| ⚔️ Hidden Valley Capture | Wednesday 22:00 UTC+8 |
| Attack of the Living Wraiths | Thursday 22:00 UTC+8 |
| Crimson Emperor Utukan | Friday 22:00 UTC+8 |

## НЕ трогать

- `src/lib/gameData.ts` — данные не меняем, только route.ts
- Block 1 (Daily World Bosses) — уже содержит только Lab и Valley, оставить как есть
- Any other files
