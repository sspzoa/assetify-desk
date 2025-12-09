import { useMutation } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  DueDiligenceFormAssetIdAtom,
  DueDiligenceFoundPageIdAtom,
  DueDiligenceManual법인명Atom,
  DueDiligenceManual부서Atom,
  DueDiligenceManual사용자Atom,
  DueDiligenceStepAtom,
} from "@/app/(pages)/due-diligence/(atoms)/useDueDiligenceFormStore";

interface UseDueDiligenceFormReturn {
  isConfirming: boolean;
  isSubmittingManual: boolean;
  confirmError: any;
  manualError: any;
  confirmAsset: () => Promise<void>;
  submitManual: () => Promise<void>;
  resetFlow: () => void;
}

export const useDueDiligenceForm = (): UseDueDiligenceFormReturn => {
  const router = useRouter();

  const assetId = useAtomValue(DueDiligenceFormAssetIdAtom);

  const pageId = useAtomValue(DueDiligenceFoundPageIdAtom);

  const 법인명 = useAtomValue(DueDiligenceManual법인명Atom);
  const 부서 = useAtomValue(DueDiligenceManual부서Atom);
  const 사용자 = useAtomValue(DueDiligenceManual사용자Atom);

  const setStep = useSetAtom(DueDiligenceStepAtom);
  const set자산번호 = useSetAtom(DueDiligenceFormAssetIdAtom);
  const set법인명 = useSetAtom(DueDiligenceManual법인명Atom);
  const set부서 = useSetAtom(DueDiligenceManual부서Atom);
  const set사용자 = useSetAtom(DueDiligenceManual사용자Atom);

  const resetFlow = () => {
    set자산번호("");
    set법인명("");
    set부서("");
    set사용자("");
    setStep("input");
  };

  const confirmMutation = useMutation({
    mutationFn: async () => {
      if (!assetId) throw new Error("자산 번호가 없습니다.");

      const formData = new FormData();
      formData.append("assetId", assetId);

      const response = await fetch(`/api/due-diligence/confirm/${pageId}`, {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    },
    onSuccess: () => {
      alert("자산 실사가 완료되었습니다.");
      resetFlow();
      router.push("/");
    },
  });

  const manualMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("자산번호", assetId);
      formData.append("법인명", 법인명);
      formData.append("부서", 부서);
      formData.append("사용자", 사용자);

      const response = await fetch("/api/due-diligence", {
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
      alert("정보가 성공적으로 제출되었습니다.");
      resetFlow();
      router.push("/");
    },
  });

  const confirmAsset = async (): Promise<void> => {
    await confirmMutation.mutateAsync();
  };

  const submitManual = async (): Promise<void> => {
    await manualMutation.mutateAsync();
  };

  return {
    isConfirming: confirmMutation.isPending,
    isSubmittingManual: manualMutation.isPending,
    confirmError: confirmMutation.error,
    manualError: manualMutation.error,
    confirmAsset,
    submitManual,
    resetFlow,
  };
};
