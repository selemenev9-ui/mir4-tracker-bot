# Windsurf Agent Prompt — Add Wednesday Valley Capture notification

## One file only: `src/lib/gameData.ts`

In `WEEKLY_WORLD_BOSSES` array, add the following entry **after the Nerkan (Tuesday) entry
and before the Wraiths (Thursday) entry**:

```typescript
  {
    id: "valley_capture",
    name: "⚔️ Hidden Valley Capture",
    zone: "Bicheon Valley 4F / Snake Valley 4F / Redmoon Valley 4F",
    dayOfWeek: 3, // Wednesday
    spawnHourUTC8: 22,
    notifyMinutesBefore: 10,
    description: "22:00–23:00 — All Clan members can participate. Valley Bosses also active at 22:00.",
  },
```

So the array order should be:
- Monday (1): krukan
- Tuesday (2): nerkan
- **Wednesday (3): valley_capture  ← NEW**
- Thursday (4): wraiths
- Thursday (4): turkan
- Friday (5): utukan

---

## After the change

```bash
npm run lint && npx tsc --noEmit
```

If clean — commit and push.
