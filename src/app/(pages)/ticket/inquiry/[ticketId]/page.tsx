/**
 * 문의 티켓 상세 페이지
 * 특정 문의 티켓의 상세 정보를 표시
 */

import { notFound } from "next/navigation";

import { InquiryTicketDetailView } from "@/components/ticket/TicketDetailView";
import { fetchInquiryTicketDetail } from "@/utils/notion/inquiry";

/**
 * 문의 티켓 상세 페이지 컴포넌트
 * URL 파라미터로 받은 티켓 ID로 상세 정보를 조회
 */
export default async function InquiryTicketDetailPage(props: {
  params: Promise<{ ticketId: string }>;
}) {
  // URL에서 티켓 ID 추출
  const { ticketId } = await props.params;
  if (!ticketId) {
    notFound();
  }

  try {
    // Notion에서 티켓 상세 정보 조회
    const ticket = await fetchInquiryTicketDetail(ticketId);
    return <InquiryTicketDetailView ticketId={ticketId} detail={ticket} />;
  } catch (error) {
    // 티켓 조회 실패 시 404 페이지로 이동
    console.error("Failed to load inquiry ticket", error);
    notFound();
  }
}
