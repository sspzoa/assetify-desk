import { useQuery } from "@tanstack/react-query";

interface DueDiligenceInfoResponse {
  실사제목: string;
  시작날짜: string | null;
  끝날짜: string | null;
}

export const useDueDiligenceInfo = () => {
  return useQuery<DueDiligenceInfoResponse>({
    queryKey: ["dueDiligenceInfo"],
    queryFn: async () => {
      const response = await fetch("/api/due-diligence/info");
      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
