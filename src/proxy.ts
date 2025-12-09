import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateBearerToken } from "@/shared/lib/auth";
import { validateDueDiligencePeriod } from "@/shared/lib/due-diligence";
import { validateSession } from "@/shared/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/assets")) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "토큰이 필요합니다." }, { status: 401 });
    }

    const token = authHeader.substring(7);

    const isValid = await validateBearerToken(token);

    if (!isValid) {
      return NextResponse.json({ message: "유효하지 않은 토큰입니다." }, { status: 401 });
    }
  }

  if ((pathname.startsWith("/api/license") || pathname === "/api/session/query") && pathname !== "/api/session") {
    const sessionId = request.headers.get("x-session-id");

    if (!sessionId) {
      return NextResponse.json({ message: "세션 ID가 필요합니다." }, { status: 401 });
    }

    const isValid = await validateSession(sessionId);

    if (!isValid) {
      return NextResponse.json({ message: "유효하지 않거나 만료된 세션입니다." }, { status: 401 });
    }
  }

  if (pathname.startsWith("/api/due-diligence")) {
    const validation = await validateDueDiligencePeriod();

    if (!validation.isValid) {
      return NextResponse.json({ message: validation.message }, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/assets/:path*", "/api/license/:path*", "/api/session/query", "/api/due-diligence/:path*"],
};
