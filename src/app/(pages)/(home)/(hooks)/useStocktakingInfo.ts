import { useQuery } from "@tanstack/react-query";

interface StocktakingInfoResponse {
  실사제목: string;
  시작날짜: string | null;
  끝날짜: string | null;
}

export const useStocktakingInfo = () => {
  return useQuery<StocktakingInfoResponse>({
    queryKey: ["stocktakingInfo"],
    queryFn: async () => {
      const response = await fetch("/api/stocktaking/info");
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
