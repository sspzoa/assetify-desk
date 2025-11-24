import { type NextRequest, NextResponse } from "next/server";

import { fetchRepairTicketDetail } from "@/utils/notion/repair";

type RouteContext = {
  params: Promise<{ ticketId: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  const { ticketId } = await context.params;

  if (!ticketId) {
    return NextResponse.json(
      { error: "ticketId가 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const detail = await fetchRepairTicketDetail(ticketId);
    return NextResponse.json(detail);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "수리 요청 정보를 불러오지 못했습니다.";
    const status = /찾을 수 없는|존재하지/.test(message) ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
