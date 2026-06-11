import { NextRequest, NextResponse } from "next/server";
import { InteractionType } from "discord-interactions";
import { verifyDiscordRequest } from "@/lib/discord";

// Discord Interaction Response Types (официальный список Discord API v10)
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
  MODAL: 9,
  LAUNCH_ACTIVITY: 12, // Запустить Activity приложения — не требует голосового канала
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

  // Slash command — показать embed с кнопкой запуска
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
                "Интерактивная карта боссов в реальном времени.\n\n" +
                "**Что умеет:**\n" +
                "• 🗺️ Карта с пинами всех боссов (Secret Peak, Magic Square, Mirage)\n" +
                "• ⏱️ Таймеры обратного отсчёта до респауна\n" +
                "• ☠️ Кнопка «Убил» — таймер виден всей гильдии\n" +
                "• 🌍 Уведомления @here для World Bosses (лабиринты / долины)",
              color: 0xdc2626,
              footer: {
                text: "Нажми кнопку ниже чтобы открыть трекер прямо в Discord",
              },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1, // Primary (синяя кнопка)
                  label: "🗺️ Открыть Boss Tracker",
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

  // Button click — запустить Activity
  if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    const customId = interaction.data?.custom_id;

    if (customId === "btn_launch_map") {
      // LAUNCH_ACTIVITY (type 12) — открывает Embedded App прямо в Discord
      // без необходимости заходить в голосовой канал
      return NextResponse.json({
        type: InteractionResponseType.LAUNCH_ACTIVITY,
      });
    }
  }

  return new NextResponse("Unhandled interaction type", { status: 400 });
}
