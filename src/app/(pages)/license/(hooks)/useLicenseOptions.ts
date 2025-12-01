import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { LicenseOptions법인명Atom } from "@/app/(pages)/license/(atoms)/useLicenseOptionsStore";

interface LicenseOptionsResponse {
  법인명: string[];
}

export const useLicenseOptions = (sessionId: string) => {
  const set법인명 = useSetAtom(LicenseOptions법인명Atom);

  return useQuery<LicenseOptionsResponse>({
    queryKey: ["licenseOptions", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/license/${sessionId}/options`);
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
