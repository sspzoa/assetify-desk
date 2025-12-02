import { useMutation } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { LicenseForm법인명Atom, LicenseForm사용자명Atom } from "@/app/(pages)/license/(atoms)/useLicenseFormStore";
import { type LicenseResult, LicenseResultsAtom } from "@/app/(pages)/license/(atoms)/useLicenseStore";

interface UseLicenseFormReturn {
  isSubmitting: boolean;
  error: Error | null;
  handleSubmit: () => Promise<void>;
}

export const useLicenseForm = (sessionId: string): UseLicenseFormReturn => {
  const 법인명 = useAtomValue(LicenseForm법인명Atom);
  const 사용자명 = useAtomValue(LicenseForm사용자명Atom);
  const setResults = useSetAtom(LicenseResultsAtom);

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId,
        },
        body: JSON.stringify({
          법인명,
          사용자명,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      return data as LicenseResult[];
    },
    onSuccess: (data) => {
      setResults(data);
    },
    onError: () => {
      setResults([]);
    },
  });

  const handleSubmit = async (): Promise<void> => {
    await mutateAsync();
  };

  return {
    isSubmitting: isPending,
    error,
    handleSubmit,
  };
};
