import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, sessionCookieOptions } from "@/shared/auth/session-token";
import { BACKEND_ACCESS_TOKEN_COOKIE } from "@/shared/auth/backend-access-token";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token) {
      return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 });
    }

    // Attempt to decode the JWT payload smoothly to populate the session
    let userId = "resolved-user-id";
    let userEmail = "resolved-user-email";
    let userName = "Member";

    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadStr = Buffer.from(parts[1], "base64").toString("utf-8");
        const payload = JSON.parse(payloadStr);

        userId = payload.user_id || payload.sub || userId;
        userEmail = payload.email || userEmail;
        userName = payload.name || payload.first_name || userName;
      }
    } catch {
      // Just fallback to default strings if decoding fails
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    const cookie = sessionCookieOptions(true);
    const sessionToken = await createSessionToken({
      sub: userId,
      email: userEmail,
      name: userName,
      role: "member",
      iat: nowInSeconds,
      exp: nowInSeconds + cookie.maxAge,
    });

    const secure = request.nextUrl.protocol === "https:";
    const nextResponse = NextResponse.json({ success: true, data: { backendAccessToken: token } }, { status: 200 });
    
    // Cookie required for the middleware router
    nextResponse.cookies.set({
      name: cookie.name,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: cookie.maxAge,
    });

    // Mirroring what the main login route offers
    nextResponse.cookies.set({
      name: BACKEND_ACCESS_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: cookie.maxAge,
    });

    return nextResponse;
  } catch (error) {
    return NextResponse.json({ success: false, error: "Session creation error" }, { status: 500 });
  }
}
