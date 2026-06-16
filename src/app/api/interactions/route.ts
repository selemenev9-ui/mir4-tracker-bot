import { NextRequest, NextResponse } from "next/server";
import { InteractionType } from "discord-interactions";
import { translate } from "@vitalets/google-translate-api";
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
    type?: number;
    target_id?: string;
    resolved?: {
      messages?: Record<
        string,
        {
          content: string;
          author: { username: string };
        }
      >;
    };
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

    if (commandName === "Translate") {
      const targetId = interaction.data?.target_id;
      const messages = interaction.data?.resolved?.messages;
      const originalText = targetId && messages ? messages[targetId]?.content : null;

      if (!originalText || originalText.trim() === "") {
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "❌ Could not find any text in that message.",
            flags: 64,
          },
        });
      }

      try {
        const result = await translate(originalText, { to: "en" });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detected: string = ((result as any).raw?.src as string | undefined) ?? "unknown";

        const langLabel = detected !== "unknown" && detected !== "en" ? ` [${detected.toUpperCase()} → EN]` : "";

        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `🌐 **Translation**${langLabel}\n>>> ${result.text}`,
            flags: 64,
          },
        });
      } catch (err) {
        console.error("Translation error:", err);
        return NextResponse.json({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "❌ Translation failed. Google may be rate-limiting. Try again in a moment.",
            flags: 64,
          },
        });
      }
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
