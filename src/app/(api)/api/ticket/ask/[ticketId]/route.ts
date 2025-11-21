import { NextResponse } from "next/server";

import { fetchAskTicketDetail } from "../notion-helpers";

type RouteContext = {
  params: { ticketId: string };
};

export async function GET(_: Request, context: RouteContext) {
  const ticketId = context.params.ticketId;

  if (!ticketId) {
    return NextResponse.json({ error: "ticketId가 필요합니다." }, { status: 400 });
  }

  try {
    const detail = await fetchAskTicketDetail(ticketId);
    return NextResponse.json(detail);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "문의 정보를 불러오지 못했습니다.";
    const status = /찾을 수 없는|존재하지/.test(message) ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
