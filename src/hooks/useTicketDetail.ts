"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  InquiryTicketDetail,
  RepairTicketDetail,
} from "@/types/ticket";

// 문의 티켓 상세 정보 조회 API 호출
const fetchInquiryDetail = async (
  ticketId: string,
): Promise<InquiryTicketDetail> => {
  const response = await fetch(`/api/ticket/inquiry/${ticketId}`, {
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.error ?? "문의 정보를 불러오지 못했습니다.");
  return data;
};

// 수리 티켓 상세 정보 조회 API 호출
const fetchRepairDetail = async (
  ticketId: string,
): Promise<RepairTicketDetail> => {
  const response = await fetch(`/api/ticket/repair/${ticketId}`, {
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.error ?? "수리 요청 정보를 불러오지 못했습니다.");
  return data;
};

// 문의 티켓 상세 정보 조회 훅
export function useInquiryTicketDetail(
  ticketId: string,
  initialData?: InquiryTicketDetail,
) {
  return useQuery<InquiryTicketDetail>({
    queryKey: ["inquiry-ticket-detail", ticketId],
    queryFn: () => fetchInquiryDetail(ticketId),
    initialData,
    enabled: Boolean(ticketId), // ticketId가 있을 때만 조회
    staleTime: 1000 * 30, // 30초간 캐시 유지
  });
}

// 수리 티켓 상세 정보 조회 훅
export function useRepairTicketDetail(
  ticketId: string,
  initialData?: RepairTicketDetail,
) {
  return useQuery<RepairTicketDetail>({
    queryKey: ["repair-ticket-detail", ticketId],
    queryFn: () => fetchRepairDetail(ticketId),
    initialData,
    enabled: Boolean(ticketId), // ticketId가 있을 때만 조회
    staleTime: 1000 * 30, // 30초간 캐시 유지
  });
}
