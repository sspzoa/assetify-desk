import { NextResponse } from "next/server";
import { validateSession } from "./session";

export async function checkSession(sessionToken: string): Promise<NextResponse | null> {
  const isValid = await validateSession(sessionToken);

  if (!isValid) {
    return NextResponse.json({ message: "유효하지 않거나 만료된 세션입니다." }, { status: 401 });
  }

  return null;
}
