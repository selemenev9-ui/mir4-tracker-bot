import { NextRequest, NextResponse } from "next/server";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { verifyDiscordRequest } from "@/lib/discord";

type PingInteraction = {
  type: InteractionType.PING;
};

type ApplicationCommandInteraction = {
  type: InteractionType.APPLICATION_COMMAND;
  data: {
    name: string;
  };
};

type AnyInteraction = PingInteraction | ApplicationCommandInteraction;

type Embed = {
  title: string;
  description: string;
  color: number;
};

type ButtonStyle = 1 | 2 | 3 | 4 | 5;

type ButtonComponent = {
  type: 2;
  style: ButtonStyle;
  label: string;
  custom_id: string;
};

type ActionRowComponent = {
  type: 1;
  components: ButtonComponent[];
};

type InteractionResponseData = {
  embeds?: Embed[];
  components?: ActionRowComponent[];
};

type DiscordInteractionResponse = {
  type: InteractionResponseType;
  data?: InteractionResponseData;
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

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    const commandInteraction = interaction as ApplicationCommandInteraction;

    if (commandInteraction.data.name !== "setup_tracker") {
      return new NextResponse("Unknown command", { status: 400 });
    }

    const responseBody: DiscordInteractionResponse = {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [
          {
            title: "⚔️ MIR4 Global Boss Tracker",
            description:
              "Select an action below to update respawn timers or view the current schedule.",
            color: 0x8b0000,
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 1,
                label: "Report Kill",
                custom_id: "btn_report_kill",
              },
              {
                type: 2,
                style: 2,
                label: "View Active Timers",
                custom_id: "btn_view_timers",
              },
            ],
          },
        ],
      },
    };

    return NextResponse.json(responseBody);
  }

  return new NextResponse("Unhandled interaction type", { status: 400 });
}
