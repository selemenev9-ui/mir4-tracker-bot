import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

async function proxyToSupabase(req: NextRequest, params: { path: string[] }) {
  if (!SUPABASE_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL is not set" },
      { status: 500 },
    );
  }

  const path = params.path.join("/");
  const url = new URL(req.url);
  const search = url.search;
  const targetUrl = `${SUPABASE_URL.replace(/\/$/, "")}/${path}${search}`;

  const forwardHeaders = new Headers();
  for (const [key, value] of req.headers.entries()) {
    if (key.toLowerCase() === "host") continue;
    forwardHeaders.set(key, value);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const upstreamResponse = await fetch(targetUrl, {
    method: req.method,
    headers: forwardHeaders,
    body,
  });

  const resHeaders = new Headers();
  for (const [key, value] of upstreamResponse.headers.entries()) {
    if (key.toLowerCase() === "content-encoding") continue;
    resHeaders.set(key, value);
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: resHeaders,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyToSupabase(req, params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyToSupabase(req, params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyToSupabase(req, params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxyToSupabase(req, params);
}
