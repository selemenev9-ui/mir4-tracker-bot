# Windsurf Agent Prompt: Заменить старый бот на красивый лаунчер Activity

## Задача

Полностью переписать `/api/interactions/route.ts`. Убрать старые кнопки "Report Kill" / "View Active Timers". Заменить на красивое embed-сообщение которое объясняет как открыть Activity внутри Discord.

**Ничего больше не трогать** — только этот файл.

---

## Что сделать

Заменить весь файл `src/app/api/interactions/route.ts` на следующее:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { verifyDiscordRequest } from "@/lib/discord";

type PingInteraction = {
  type: typeof InteractionType.PING;
};

type ApplicationCommandInteraction = {
  type: typeof InteractionType.APPLICATION_COMMAND;
  data: { name: string };
};

type AnyInteraction = PingInteraction | ApplicationCommandInteraction;

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

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const cmd = interaction as ApplicationCommandInteraction;

    if (cmd.data.name === "setup_tracker" || cmd.data.name === "tracker") {
      return NextResponse.json({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "⚔️ MIR4 Boss Tracker",
              description:
                "Интерактивная карта боссов в реальном времени — прямо внутри Discord.\n\n" +
                "**Как открыть:**\n" +
                "1. Зайди в любой голосовой канал\n" +
                "2. Нажми иконку 🚀 (Активности)\n" +
                "3. Выбери **MIR4 Boss Tracker**\n\n" +
                "**Что умеет:**\n" +
                "• 🗺️ Карта с пинами всех боссов по этажам\n" +
                "• ⏱️ Таймеры обратного отсчёта до респауна\n" +
                "• ☠️ Кнопка «Убил» — запускает таймер видимый всей гильдии\n" +
                "• 🌍 World Bosses (лабиринты / долины) — с уведомлениями @here\n" +
                "• Поддержка Secret Peak, Magic Square, Mirage, World Bosses",
              color: 0xdc2626,
              footer: {
                text: "Все таймеры синхронизируются в реальном времени для всех членов гильдии",
              },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 5,
                  label: "Открыть в браузере",
                  url: "https://mir4-tracker-bot.vercel.app",
                  emoji: { name: "🌐" },
                },
              ],
            },
          ],
        },
      });
    }

    return new NextResponse("Unknown command", { status: 400 });
  }

  return new NextResponse("Unhandled interaction type", { status: 400 });
}
```

---

## После замены

Запусти:
```bash
npm run lint
npx tsc --noEmit
```

Если чисто — сделай commit и push.

---

## Итог

Теперь `/setup_tracker` в Discord показывает красивое embed-сообщение с:
- Инструкцией как открыть Activity через голосовой канал
- Описанием всех функций
- Кнопкой-ссылкой на веб-версию как запасной вариант

Старые кнопки "Report Kill" / "View Active Timers" — удалены.
