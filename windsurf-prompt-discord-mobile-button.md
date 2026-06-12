# Windsurf Agent Prompt: Add Mobile Fallback Button to Discord Embed

## Problem

Discord Activities (LAUNCH_ACTIVITY / type 12) **do not work on Discord mobile app**.
Mobile users see "This interaction failed" because their client doesn't support embedded Activities.

## Solution

Add a second **Link button** (style 5) to the embed message that opens the web app URL directly.
Link buttons never fire interaction events — they just open the URL — so no handler changes needed.

**File to touch:** `src/app/api/interactions/route.ts` only.

---

## Step 1 — Add APP_URL env variable

In `.env.local` add:
```
APP_URL="https://mir4-tracker-bot.vercel.app"
```

---

## Step 2 — Update the embed components in `interactions/route.ts`

Find this block (inside the `setup_tracker` / `tracker` command handler):

```typescript
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: "🗺️ Open Boss Tracker",
                  custom_id: "btn_launch_map",
                },
              ],
            },
          ],
```

Replace with:

```typescript
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: "🗺️ Open Boss Tracker",
                  custom_id: "btn_launch_map",
                },
                {
                  type: 2,
                  style: 5,
                  label: "🌐 Open in Browser",
                  url: process.env.APP_URL ?? "https://mir4-tracker-bot.vercel.app",
                },
              ],
            },
          ],
```

**That's the only change needed.** The link button (style 5) opens the URL directly — no interaction handler required.

---

## Step 3 — Verify TypeScript

```bash
npx tsc --noEmit
```

Zero errors.

---

## Step 4 — Deploy

```bash
git add src/app/api/interactions/route.ts .env.local
git commit -m "fix: add mobile fallback 'Open in Browser' link button to Discord embed"
git push
```

After deploy, **re-run `/setup_tracker`** in Discord to refresh the embed with the new buttons.
Mobile users will see the "🌐 Open in Browser" button and can open the tracker in their phone browser.

---

## НЕ трогать

- The `LAUNCH_ACTIVITY` handler — desktop users still launch via the Activity
- Any other files
