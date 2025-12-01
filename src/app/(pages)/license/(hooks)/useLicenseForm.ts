import { useMutation } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { LicenseForm법인명Atom, LicenseForm사용자명Atom } from "@/app/(pages)/license/(atoms)/useLicenseFormStore";
import {
  type LicenseResult,
  LicenseResultsAtom,
  LicenseSearchErrorAtom,
} from "@/app/(pages)/license/(atoms)/useLicenseStore";

interface UseLicenseFormReturn {
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
}

export const useLicenseForm = (sessionId: string): UseLicenseFormReturn => {
  const 법인명 = useAtomValue(LicenseForm법인명Atom);
  const 사용자명 = useAtomValue(LicenseForm사용자명Atom);
  const setResults = useSetAtom(LicenseResultsAtom);
  const setError = useSetAtom(LicenseSearchErrorAtom);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/license/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          법인명,
          사용자명,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data as LicenseResult[];
    },
    onSuccess: (data) => {
      setResults(data);
      setError(null);
    },
    onError: (error: any) => {
      setResults([]);
      setError(error.message || "검색 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = async (): Promise<void> => {
    await mutateAsync();
  };

  return {
    isSubmitting: isPending,
    handleSubmit,
  };
};
