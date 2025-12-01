import { NextResponse } from "next/server";
import { createSession } from "@/shared/lib/session";

export async function POST() {
  try {
    const { session, token } = await createSession();

    return NextResponse.json({
      sessionId: token,
      expiresAt: session.expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "세션 생성에 실패했습니다." }, { status: 500 });
  }
}
