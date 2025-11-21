'use client';

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

import { askTicketDetailAtom } from "@/store/askTicketDetail";
import type { AskTicketDetail } from "@/types/askTicket";

const fetchTicketDetail = async (ticketId: string): Promise<AskTicketDetail> => {
  const response = await fetch(`/api/ticket/ask/${ticketId}`, {
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? "문의 정보를 불러오지 못했습니다.");
  }

  return data;
};

export function useAskTicketDetail(
  ticketId: string,
  initialData?: AskTicketDetail,
) {
  const setDetail = useSetAtom(askTicketDetailAtom);

  const query = useQuery<AskTicketDetail>({
    queryKey: ["ask-ticket-detail", ticketId],
    queryFn: () => fetchTicketDetail(ticketId),
    initialData,
    enabled: Boolean(ticketId),
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (query.data) {
      setDetail(query.data);
    }
  }, [query.data, setDetail]);

  return query;
}
