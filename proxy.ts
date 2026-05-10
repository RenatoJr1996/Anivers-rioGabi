import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "./lib/session";

const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function proxy(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const currentSessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!currentSessionId) {
    response.cookies.set(SESSION_COOKIE_NAME, crypto.randomUUID(), {
      httpOnly: true,
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
