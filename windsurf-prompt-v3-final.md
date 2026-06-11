# Windsurf Agent Prompt — v3 Final

## Three changes in this prompt. No other files to touch.

---

## Change 1: `src/app/api/interactions/route.ts` — English + LAUNCH_ACTIVITY

Replace the entire file with the following:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { InteractionType } from "discord-interactions";
import { verifyDiscordRequest } from "@/lib/discord";

// Discord Interaction Response Types (Discord API v10)
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  LAUNCH_ACTIVITY: 12, // Launch the embedded Activity — no voice channel required
} as const;

type AnyInteraction = {
  type: number;
  data?: {
    name?: string;
    custom_id?: string;
  };
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    return new NextResponse("Missing signature headers", { status: 401 });
  }

  const bodyText = await request.text();
  const isValid = await verifyDiscordRequest(bodyText, signature, timestamp);

  if (!isValid) {
    return new NextResponse("Invalid request signature", { status: 401 });
  }

  let interaction: AnyInteraction;
  try {
    interaction = JSON.parse(bodyText) as AnyInteraction;
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  // PING
  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  // Slash command — show embed with launch button
  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandName = interaction.data?.name;

    if (commandName === "setup_tracker" || commandName === "tracker") {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "⚔️ MIR4 Boss Tracker",
              description:
                "Real-time interactive boss map — right inside Discord.\n\n" +
                "**Features:**\n" +
                "• 🗺️ Map with boss pins by floor (Secret Peak, Magic Square, Mirage)\n" +
                "• ⏱️ Countdown timers to next respawn\n" +
                "• ☠️ \"Killed\" button — starts a timer visible to the whole guild\n" +
                "• 🌍 @here notifications for World Bosses (Labyrinth / Valley)",
              color: 0xdc2626,
              footer: {
                text: "Click the button below to open the tracker inside Discord",
              },
            },
          ],
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
        },
      });
    }

    return new NextResponse("Unknown command", { status: 400 });
  }

  // Button click — launch the Activity (no voice channel needed)
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    if (interaction.data?.custom_id === "btn_launch_map") {
      return NextResponse.json({
        type: InteractionResponseType.LAUNCH_ACTIVITY,
      });
    }
  }

  return new NextResponse("Unhandled interaction type", { status: 400 });
}
```

---

## Change 2: `src/app/page.tsx` — Change all UI text to English

Find and replace the following strings in `src/app/page.tsx`:

| Find (exact) | Replace with |
|---|---|
| `"Кто ты?"` | `"Who are you?"` |
| `"Введи своё Discord-имя чтобы репортить убийства боссов.\n        Сохранится автоматически."` | `"Enter your Discord username to report boss kills.\n        Saved automatically."` |
| `"Твой ник в Discord"` | `"Your Discord username"` |
| `"Войти"` (кнопка внутри модалки) | `"Confirm"` |
| `"изменить"` | `"change"` |
| `"Войти (веб-режим)"` | `"Login (web mode)"` |
| `"Войти"` (кнопка в header) | `"Login"` |
| `"Web mode — Discord not connected"` | keep as-is (already English) |
| `"Kill reported — timer started."` | keep as-is (already English) |
| `"Failed to report kill."` | keep as-is (already English) |

Also change in the footer:
- Find: `"Next.js · Supabase · Discord SDK"` → keep as-is (already English)

Also update these strings in the header status block if present:
- `"Connecting to Discord..."` → keep as-is
- `"Web mode — Discord auth pending"` → keep as-is

---

## Change 3: `src/lib/gameData.ts` — Fix Mirage boss spawn times (AM/PM)

The current Mirage boss spawn times are listed in 12-hour style (1:00 through 12:30).
Each listed time represents BOTH an AM and PM spawn. For example:
- `"2:00"` means the boss spawns at both **02:00** and **14:00** UTC+8
- `"12:00"` means both **00:00** (midnight) and **12:00** (noon) UTC+8
- `"12:30"` means both **00:30** and **12:30** UTC+8

**Add a helper function** near the top of the exports section (before `MIRAGE_BOSSES`):

```typescript
/**
 * Expands 12-hour-style Mirage spawn times to include both AM and PM equivalents.
 * "2:00" → ["2:00", "14:00"]
 * "12:00" → ["0:00", "12:00"]
 * "11:30" → ["11:30", "23:30"]
 */
function expandMirageTimes(times: string[]): string[] {
  const result: string[] = [];
  for (const t of times) {
    const [hStr, mStr] = t.split(":");
    const h = parseInt(hStr, 10);
    const m = mStr ?? "00";
    if (h === 12) {
      // 12:xx AM = 0:xx, 12:xx PM = 12:xx
      result.push(`0:${m}`, `12:${m}`);
    } else {
      // h:xx AM = h:xx, h:xx PM = (h+12):xx
      result.push(`${h}:${m}`, `${h + 12}:${m}`);
    }
  }
  // Sort chronologically and remove duplicates
  return [...new Set(result)].sort((a, b) => {
    const [ah, am2] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    return ah * 60 + (am2 ?? 0) - (bh * 60 + (bm ?? 0));
  });
}
```

**Then wrap every `spawnTimes` array in `MIRAGE_BOSSES` with `expandMirageTimes(...)`.**

For example, change:
```typescript
spawnTimes: ["2:00", "4:00", "6:00", "8:00", "10:00", "12:00"],
```
to:
```typescript
spawnTimes: expandMirageTimes(["2:00", "4:00", "6:00", "8:00", "10:00", "12:00"]),
```

Apply this wrapping to **every single boss** in the `MIRAGE_BOSSES` array.

---

## After all changes

Run:
```bash
npm run lint && npx tsc --noEmit
```

If clean — commit and push.
