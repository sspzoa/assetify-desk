/**
 * 헬스 체크 API
 * Notion 데이터베이스 연결 상태를 확인하는 엔드포인트
 */

import { NextResponse } from "next/server";

// Notion 데이터베이스 ID 환경 변수
const ASK_TICKETS_DATABASE_ID = process.env.ASK_TICKETS_DATABASE_ID;
const ASSETS_DATABASE_ID = process.env.ASSETS_DATABASE_ID;
const REPAIR_TICKETS_DATABASE_ID = process.env.REPAIR_TICKETS_DATABASE_ID;

// Notion API 요청 헤더
const notionHeaders = {
  accept: "application/json",
  "content-type": "application/json",
  "Notion-Version": "2022-06-28",
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
};

/**
 * GET /api/health
 * 모든 Notion 데이터베이스의 연결 상태를 확인
 * @returns 성공 시 { success: true }, 실패 시 { success: false }
 */
export async function GET() {
  try {
    // 확인할 데이터베이스 URL 목록
    const urls = [
      `https://api.notion.com/v1/databases/${ASK_TICKETS_DATABASE_ID}`,
      `https://api.notion.com/v1/databases/${ASSETS_DATABASE_ID}`,
      `https://api.notion.com/v1/databases/${REPAIR_TICKETS_DATABASE_ID}`,
    ];

    // 모든 데이터베이스에 동시 요청
    const responses = await Promise.all(
      urls.map((url) =>
        fetch(url, {
          method: "GET",
          cache: "no-cache",
          headers: notionHeaders,
        }),
      ),
    );

    // 하나라도 실패하면 에러 반환
    const hasError = responses.some((r) => !r.ok);
    if (hasError) {
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
