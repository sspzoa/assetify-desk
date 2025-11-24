"use client";

import { useQuery } from "@tanstack/react-query";

import type { AskTicketDetail, RepairTicketDetail } from "@/types/ticket";

const fetchAskDetail = async (ticketId: string): Promise<AskTicketDetail> => {
  const response = await fetch(`/api/ticket/ask/${ticketId}`, {
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.error ?? "문의 정보를 불러오지 못했습니다.");
  return data;
};

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

export function useAskTicketDetail(
  ticketId: string,
  initialData?: AskTicketDetail,
) {
  return useQuery<AskTicketDetail>({
    queryKey: ["ask-ticket-detail", ticketId],
    queryFn: () => fetchAskDetail(ticketId),
    initialData,
    enabled: Boolean(ticketId),
    staleTime: 1000 * 30,
  });
}

export function useRepairTicketDetail(
  ticketId: string,
  initialData?: RepairTicketDetail,
) {
  return useQuery<RepairTicketDetail>({
    queryKey: ["repair-ticket-detail", ticketId],
    queryFn: () => fetchRepairDetail(ticketId),
    initialData,
    enabled: Boolean(ticketId),
    staleTime: 1000 * 30,
  });
}
