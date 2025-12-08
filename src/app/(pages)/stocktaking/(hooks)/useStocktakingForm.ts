import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  StocktakingForm법인명Atom,
  StocktakingForm부서Atom,
  StocktakingForm사용자Atom,
  StocktakingForm자산번호Atom,
} from "@/app/(pages)/stocktaking/(atoms)/useStocktakingFormStore";

interface UseStocktakingFormReturn {
  isSubmitting: boolean;
  error: Error | null;
  handleSubmit: () => Promise<void>;
}

export const useStocktakingForm = (): UseStocktakingFormReturn => {
  const router = useRouter();

  const [법인명, set법인명] = useAtom(StocktakingForm법인명Atom);
  const [부서, set부서] = useAtom(StocktakingForm부서Atom);
  const [사용자, set사용자] = useAtom(StocktakingForm사용자Atom);
  const [자산번호, set자산번호] = useAtom(StocktakingForm자산번호Atom);

  const resetForm = () => {
    set법인명("");
    set부서("");
    set사용자("");
    set자산번호("");
  };

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("법인명", 법인명);
      formData.append("부서", 부서);
      formData.append("사용자", 사용자);
      formData.append("자산번호", 자산번호);

      const response = await fetch("/api/stocktaking", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    },
    onSuccess: () => {
      resetForm();
      router.push("/");
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
