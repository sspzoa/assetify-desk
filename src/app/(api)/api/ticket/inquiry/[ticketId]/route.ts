/**
 * 문의 티켓 상세 조회 API
 * 특정 문의 티켓의 상세 정보를 조회하는 엔드포인트
 */

import { type NextRequest, NextResponse } from "next/server";

import { fetchInquiryTicketDetail } from "@/utils/notion/inquiry";

// 라우트 컨텍스트 타입 정의
type RouteContext = {
  params: Promise<{ ticketId: string }>;
};

/**
 * GET /api/ticket/inquiry/[ticketId]
 * 특정 문의 티켓 상세 정보 조회
 * @param context - ticketId를 포함한 라우트 컨텍스트
 * @returns 문의 티켓 상세 정보
 */
export async function GET(_: NextRequest, context: RouteContext) {
  const { ticketId } = await context.params;

  // ticketId 파라미터 검증
  if (!ticketId) {
    return NextResponse.json(
      { error: "ticketId가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const detail = await fetchInquiryTicketDetail(ticketId);
    return NextResponse.json(detail);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "문의 정보를 불러오지 못했습니다.";
    // 404 에러 판별
    const status = /찾을 수 없는|존재하지/.test(message) ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
