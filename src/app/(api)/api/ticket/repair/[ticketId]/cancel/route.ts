/**
 * 수리 요청 취소 API
 * 특정 수리 요청을 취소(삭제)하는 엔드포인트
 */

import { NextResponse } from "next/server";

import {
  deleteRepairTicket,
  fetchRepairTicketDetail,
} from "@/utils/notion/repair";

// 라우트 컨텍스트 타입 정의
type RouteContext = {
  params: Promise<{ ticketId: string }>;
};

/**
 * POST /api/ticket/repair/[ticketId]/cancel
 * 수리 요청 취소 처리
 * @param context - ticketId를 포함한 라우트 컨텍스트
 * @returns 취소 성공 여부
 */
export async function POST(_: Request, context: RouteContext) {
  const { ticketId } = await context.params;

  // ticketId 파라미터 검증
  if (!ticketId) {
    return NextResponse.json(
      { error: "ticketId가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    // 티켓 상세 정보 조회
    const detail = await fetchRepairTicketDetail(ticketId);

    // 이미 취소된 요청인지 확인
    if (detail.archived) {
      return NextResponse.json(
        { error: "이미 취소된 요청입니다." },
        { status: 400 },
      );
    }

    // 담당자가 지정된 경우 취소 불가
    if (detail.assignee && detail.assignee.trim().length > 0) {
      return NextResponse.json(
        { error: "담당자가 지정된 요청은 취소할 수 없습니다." },
        { status: 400 },
      );
    }

    // 이미 진행 중인 경우 취소 불가
    if (
      (detail.status && detail.status !== "시작 전") ||
      (detail.progressStatus && detail.progressStatus !== "시작 전")
    ) {
      return NextResponse.json(
        { error: "이미 진행 중인 요청은 취소할 수 없습니다." },
        { status: 400 },
      );
    }

    // 티켓 삭제 처리
    await deleteRepairTicket(ticketId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "수리 요청 취소 처리에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
