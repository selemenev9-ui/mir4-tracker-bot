# Windsurf Agent Prompt — Fix Boss Respawn Timer Bug

## Bug

`/api/report-kill` hardcodes `next_spawn = now + 3 hours` for every boss.
The correct respawn time (e.g. 30 min for Teal Guardian) is calculated on the
client after the API call, but the next server poll overwrites it with the wrong
3-hour value from Supabase.

## Fix — two small changes only

---

### Change 1: `src/app/page.tsx`

Find the `handleReportKill` fetch call. It currently sends:

```typescript
body: JSON.stringify({
  bossName: bossId,
  location: `Floor ${floor}`,
  reporterId: currentUser.id,
}),
```

**Before** this fetch, look up the boss's respawnMinutes:

```typescript
const spBoss = SECRET_PEAK_BOSSES.find((b) => b.id === bossId);
const msBoss = MAGIC_SQUARE_BOSSES.find((b) => b.id === bossId);
const respawnMinutes = spBoss?.respawnMinutes ?? msBoss?.respawnMinutes ?? 180;
```

Then add `respawnMinutes` to the request body:

```typescript
body: JSON.stringify({
  bossName: bossId,
  location: `Floor ${floor}`,
  reporterId: currentUser.id,
  respawnMinutes,
}),
```

**Important:** the existing lookup of `spBoss`/`msBoss`/`respawnMinutes` that appears
AFTER the fetch (for optimistic UI update) must stay as-is. You are only adding a
NEW lookup before the fetch to include it in the body.

---

### Change 2: `src/app/api/report-kill/route.ts`

**Step 1** — add `respawnMinutes` to the request body type:

```typescript
type ReportKillBody = {
  bossName?: string;
  location?: string;
  reporterId?: string;
  respawnMinutes?: number;
};
```

**Step 2** — extract `respawnMinutes` after parsing the body:

```typescript
const respawnMinutes = typeof body.respawnMinutes === "number" && body.respawnMinutes > 0
  ? body.respawnMinutes
  : 180; // fallback: 3 hours
```

**Step 3** — replace the hardcoded line:

```typescript
// REMOVE this line:
const nextSpawn = new Date(now.getTime() + 3 * 60 * 60 * 1000);

// REPLACE with:
const nextSpawn = new Date(now.getTime() + respawnMinutes * 60 * 1000);
```

---

## After both changes

```bash
npm run lint && npx tsc --noEmit
```

If clean — commit and push.
