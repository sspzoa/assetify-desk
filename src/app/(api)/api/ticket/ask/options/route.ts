import { NextResponse } from "next/server";

import { loadAskSelectOptions } from "../notion-helpers";

export async function GET() {
  try {
    const options = await loadAskSelectOptions();
    return NextResponse.json(options);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "선택지를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
