/**
 * 수리 티켓 상세 페이지
 * 특정 수리 요청 티켓의 상세 정보를 표시
 */

import { notFound } from "next/navigation";

import { RepairTicketDetailView } from "@/components/ticket/TicketDetailView";
import { fetchRepairTicketDetail } from "@/utils/notion/repair";

/**
 * 수리 티켓 상세 페이지 컴포넌트
 * URL 파라미터로 받은 티켓 ID로 상세 정보를 조회
 */
export default async function RepairTicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
}) {
  // URL에서 티켓 ID 추출
  const { ticketId } = await props.params;
  if (!ticketId) {
    notFound();
  }

  try {
    // Notion에서 수리 티켓 상세 정보 조회
    const ticket = await fetchRepairTicketDetail(ticketId);
    return <RepairTicketDetailView ticketId={ticketId} detail={ticket} />;
  } catch (error) {
    // 티켓 조회 실패 시 404 페이지로 이동
    console.error("Failed to load repair ticket", error);
    notFound();
  }
}
