import { NextResponse } from "next/server";

import { extractOptions, notionHeaders } from "@/utils/notion/helpers";

const ASSETS_DATABASE_ID = process.env.ASSETS_DATABASE_ID;

/**
 * GET /api/assets/corporations
 * 자산 데이터베이스에서 법인 목록 조회
 */
export async function GET() {
  if (!ASSETS_DATABASE_ID) {
    return NextResponse.json(
      { error: "ASSETS_DATABASE_ID가 설정되지 않았습니다." },
      { status: 500 },
    );
  }

  try {
    // 데이터베이스 스키마를 가져와 법인 옵션 조회
    const response = await fetch(
      `https://api.notion.com/v1/databases/${ASSETS_DATABASE_ID}`,
      {
        method: "GET",
        headers: notionHeaders,
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : "데이터베이스를 불러오지 못했습니다.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const properties = data.properties ?? {};
    const corporations = extractOptions(properties.법인명);

    return NextResponse.json({ corporations });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "법인 목록을 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
