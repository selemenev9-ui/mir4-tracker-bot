import { NextRequest, NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? "";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ ok: false, error: "user_id required" }, { status: 400 });
  }
  if (!BOT_TOKEN) {
    return NextResponse.json({ ok: false, error: "BOT_TOKEN not set" }, { status: 500 });
  }

  // 1. Open DM channel
  const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: userId }),
  });

  if (!dmRes.ok) {
    const err = await dmRes.text();
    return NextResponse.json({ ok: false, step: "open_dm", error: err, status: dmRes.status });
  }

  const dmData = (await dmRes.json()) as { id?: string };
  const channelId = dmData.id;
  if (!channelId) {
    return NextResponse.json({ ok: false, error: "no channel id" });
  }

  // 2. Send test message
  const msgRes = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: "🔔 Тест уведомления MIR4 Boss Tracker — если видишь это, личные DM работают!",
    }),
  });

  if (!msgRes.ok) {
    const err = await msgRes.text();
    return NextResponse.json({ ok: false, step: "send_msg", error: err, status: msgRes.status });
  }

  return NextResponse.json({ ok: true, channelId });
}
