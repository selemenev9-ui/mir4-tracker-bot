import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { code } = (await req.json()) as { code?: string };

  if (!code) {
    return NextResponse.json({ error: "missing_code" }, { status: 400 });
  }

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_APP_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: "https://mir4-tracker-bot.vercel.app",
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
  };

  if (!response.ok || !data.access_token) {
    return NextResponse.json(
      { error: data.error ?? "token_exchange_failed" },
      { status: 400 },
    );
  }

  return NextResponse.json({ access_token: data.access_token });
}
