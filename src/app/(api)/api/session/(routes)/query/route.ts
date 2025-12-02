import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/shared/lib/session";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get("x-session-id");

    if (!sessionId) {
      return NextResponse.json({ message: "세션 ID가 필요합니다." }, { status: 400 });
    }

    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json({ message: "유효하지 않거나 만료된 세션입니다." }, { status: 404 });
    }

    return NextResponse.json({
      expiresAt: session.expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "세션 조회에 실패했습니다." }, { status: 500 });
  }
}
