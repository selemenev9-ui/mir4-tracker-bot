import { NextRequest, NextResponse } from "next/server";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { verifyDiscordRequest } from "@/lib/discord";

type MinimalInteraction = {
  type: InteractionType;
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

  let interaction: MinimalInteraction;
  try {
    interaction = JSON.parse(bodyText) as MinimalInteraction;
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    // TODO: Handle application command interactions.
    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Command handling is not implemented yet.",
      },
    });
  }

  return new NextResponse("Unhandled interaction type", { status: 400 });
}
