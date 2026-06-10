import { verifyKey } from "discord-interactions";

const discordPublicKey = process.env.DISCORD_PUBLIC_KEY;

if (!discordPublicKey) {
  throw new Error("DISCORD_PUBLIC_KEY is not set. Please configure it in your environment.");
}

export async function verifyDiscordRequest(
  rawBody: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  try {
    return await verifyKey(rawBody, signature, timestamp, discordPublicKey!);
  } catch {
    return false;
  }
}
