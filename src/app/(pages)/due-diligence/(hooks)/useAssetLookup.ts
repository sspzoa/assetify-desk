import { useMutation } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import {
  DueDiligenceFoundPageIdAtom,
  DueDiligenceFound법인명Atom,
  DueDiligenceFound부서Atom,
  DueDiligenceFound사용자Atom,
  DueDiligenceFound실사확인Atom,
  DueDiligenceFound제조사Atom,
  DueDiligenceStepAtom,
} from "@/app/(pages)/due-diligence/(atoms)/useDueDiligenceFormStore";

interface AssetLookupResponse {
  pageId: string;
  properties: {
    법인명: string;
    부서: string;
    사용자: string;
    제조사: string;
    실사확인: boolean;
  };
}

interface UseAssetLookupReturn {
  isLookingUp: boolean;
  error: any;
  lookupAsset: (assetId: string) => Promise<void>;
}

export const useAssetLookup = (): UseAssetLookupReturn => {
  const setPageId = useSetAtom(DueDiligenceFoundPageIdAtom);
  const set법인명 = useSetAtom(DueDiligenceFound법인명Atom);
  const set부서 = useSetAtom(DueDiligenceFound부서Atom);
  const set사용자 = useSetAtom(DueDiligenceFound사용자Atom);
  const set제조사 = useSetAtom(DueDiligenceFound제조사Atom);
  const set실사확인 = useSetAtom(DueDiligenceFound실사확인Atom);
  const setStep = useSetAtom(DueDiligenceStepAtom);

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: async (assetId: string) => {
      const formData = new FormData();
      formData.append("자산번호", assetId);

      const response = await fetch("/api/due-diligence/lookup", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data as AssetLookupResponse;
    },
    onSuccess: (data) => {
      setPageId(data.pageId);
      set법인명(data.properties.법인명);
      set부서(data.properties.부서);
      set사용자(data.properties.사용자);
      set제조사(data.properties.제조사);
      set실사확인(data.properties.실사확인);
      setStep("confirm");
    },
  });

  const lookupAsset = async (자산번호: string): Promise<void> => {
    await mutateAsync(자산번호);
  };

  return {
    isLookingUp: isPending,
    error,
    lookupAsset,
  };
};
