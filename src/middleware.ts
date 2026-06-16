import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/discord-only") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasFrameId = searchParams.has("frame_id");
  const hasSessionCookie = request.cookies.has("_ds");

  if (hasFrameId || hasSessionCookie) {
    const response = NextResponse.next();
    if (hasFrameId) {
      response.cookies.set("_ds", "1", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 60 * 60 * 24,
      });
    }
    return response;
  }

  return NextResponse.redirect(new URL("/discord-only", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)",
  ],
};
