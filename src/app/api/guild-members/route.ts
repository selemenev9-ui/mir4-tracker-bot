import { NextResponse } from "next/server";

interface DiscordMember {
  user: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
    bot?: boolean;
  };
  nick?: string | null;
  avatar?: string | null;
}

export async function GET() {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !botToken) {
    return NextResponse.json({ error: "missing_env" }, { status: 500 });
  }

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`,
    {
      headers: { Authorization: `Bot ${botToken}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "discord_api_error", status: res.status }, { status: res.status });
  }

  const members = (await res.json()) as DiscordMember[];

  const result = members
    .filter((m) => !m.user.bot)
    .map((m) => {
      const displayName = m.nick ?? m.user.global_name ?? m.user.username;
      const avatarHash = m.avatar ?? m.user.avatar;
      const avatarUrl = avatarHash
        ? `https://cdn.discordapp.com/avatars/${m.user.id}/${avatarHash}.png?size=32`
        : null;
      return { id: m.user.id, displayName, avatarUrl };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return NextResponse.json(result);
}
