import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import {
  TicketCreatedTimeAtom,
  Ticket긴급도Atom,
  Ticket담당자Atom,
  Ticket문의내용Atom,
  Ticket문의유형Atom,
  Ticket문의자Atom,
  Ticket법인Atom,
  Ticket부서Atom,
  Ticket상태Atom,
  Ticket자산번호Atom,
} from "@/app/(pages)/inquiry/(atoms)/useInquiryTicketStore";

interface TicketData {
  법인: string;
  부서: string;
  문의자: string;
  자산번호: string;
  문의유형: string;
  문의내용: string;
  긴급도: string;
  상태: string;
  담당자: string;
  createdAt: string;
}

interface UseInquiryTicketReturn {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useInquiryTicket = (ticketId: string): UseInquiryTicketReturn => {
  const [, set법인] = useAtom(Ticket법인Atom);
  const [, set부서] = useAtom(Ticket부서Atom);
  const [, set문의자] = useAtom(Ticket문의자Atom);
  const [, set자산번호] = useAtom(Ticket자산번호Atom);
  const [, set문의유형] = useAtom(Ticket문의유형Atom);
  const [, set문의내용] = useAtom(Ticket문의내용Atom);
  const [, set긴급도] = useAtom(Ticket긴급도Atom);
  const [, set상태] = useAtom(Ticket상태Atom);
  const [, set담당자] = useAtom(Ticket담당자Atom);
  const [, setCreatedTime] = useAtom(TicketCreatedTimeAtom);

  return useQuery<TicketData>({
    queryKey: ["inquiryTicket", ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/inquiry/ticket/${ticketId}`, {
        method: "GET",
      });

      const data: TicketData = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    },
    enabled: !!ticketId,
    select: (data) => {
      set법인(data.법인);
      set부서(data.부서);
      set문의자(data.문의자);
      set자산번호(data.자산번호);
      set문의유형(data.문의유형);
      set문의내용(data.문의내용);
      set긴급도(data.긴급도);
      set상태(data.상태);
      set담당자(data.담당자);
      setCreatedTime(data.createdAt);

      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
