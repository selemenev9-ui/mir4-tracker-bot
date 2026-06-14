import { NextRequest, NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? "";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const guildId = req.nextUrl.searchParams.get("guildId");

  if (!userId || !guildId) {
    return NextResponse.json({ error: "Missing userId or guildId" }, { status: 400 });
  }

  if (!BOT_TOKEN) {
    console.error("[GuildMember] DISCORD_BOT_TOKEN not set");
    return NextResponse.json({ error: "Bot token not configured" }, { status: 500 });
  }

  console.log("[GuildMember] Fetching member:", userId, "guild:", guildId);

  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${userId}`, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
    },
    next: { revalidate: 0 },
  });

  console.log("[GuildMember] Discord API status:", res.status);

  if (!res.ok) {
    const errText = await res.text();
    console.error("[GuildMember] Discord API error:", res.status, errText);
    return NextResponse.json({ error: "Failed to fetch guild member", discordError: errText }, { status: res.status });
  }

  const member = await res.json();

  // Guild-specific avatar takes priority over global avatar
  const guildAvatar = member.avatar
    ? `https://cdn.discordapp.com/guilds/${guildId}/users/${userId}/avatars/${member.avatar}.png`
    : null;
  const globalAvatar = member.user?.avatar
    ? `https://cdn.discordapp.com/avatars/${userId}/${member.user.avatar}.png`
    : null;

  return NextResponse.json({
    nick: member.nick ?? null,
    globalName: member.user?.global_name ?? null,
    username: member.user?.username ?? null,
    avatarUrl: guildAvatar ?? globalAvatar ?? null,
  });
}
