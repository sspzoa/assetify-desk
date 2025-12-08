import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { StocktakingOptions법인명Atom } from "@/app/(pages)/stocktaking/(atoms)/useStocktakingOptionsStore";

interface StocktakingOptionsResponse {
  법인명: string[];
}

export const useStocktakingOptions = () => {
  const set법인명 = useSetAtom(StocktakingOptions법인명Atom);

  return useQuery<StocktakingOptionsResponse>({
    queryKey: ["stocktakingOptions"],
    queryFn: async () => {
      const response = await fetch("/api/stocktaking/options");
      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    },
    select: (data) => {
      set법인명(data.법인명);

      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};
