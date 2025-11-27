import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  긴급도Atom,
  문의내용Atom,
  문의유형Atom,
  문의자Atom,
  법인Atom,
  부서Atom,
  자산번호Atom,
} from "@/app/(pages)/inquiry/(atoms)/useInquiryFormStore";

interface UseInquiryFormReturn {
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
}

export const useInquiryForm = (): UseInquiryFormReturn => {
  const router = useRouter();

  const [법인] = useAtom(법인Atom);
  const [부서] = useAtom(부서Atom);
  const [문의자] = useAtom(문의자Atom);
  const [자산번호] = useAtom(자산번호Atom);
  const [문의유형] = useAtom(문의유형Atom);
  const [문의내용] = useAtom(문의내용Atom);
  const [긴급도] = useAtom(긴급도Atom);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("법인", 법인);
      formData.append("부서", 부서);
      formData.append("문의자", 문의자);
      formData.append("자산번호", 자산번호);
      formData.append("문의유형", 문의유형);
      formData.append("문의내용", 문의내용);
      formData.append("긴급도", 긴급도);

      const response = await fetch("/api/inquiry", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("문의 등록에 실패했습니다");
      }

      return response.json();
    },
    onSuccess: (data) => {
      router.push(`/inquiry/ticket/${data.id}`);
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
