import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { DueDiligenceOptions법인명Atom } from "@/app/(pages)/due-diligence/(atoms)/useDueDiligenceOptionsStore";

interface DueDiligenceOptionsResponse {
  법인명: string[];
}

export const useDueDiligenceOptions = () => {
  const set법인명 = useSetAtom(DueDiligenceOptions법인명Atom);

  return useQuery<DueDiligenceOptionsResponse>({
    queryKey: ["dueDiligenceOptions"],
    queryFn: async () => {
      const response = await fetch("/api/due-diligence/options");
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
