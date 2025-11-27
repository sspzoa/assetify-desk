import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  Form긴급도Atom,
  Form문의내용Atom,
  Form문의유형Atom,
  Form문의자Atom,
  Form법인Atom,
  Form부서Atom,
  Form자산번호Atom,
} from "@/app/(pages)/inquiry/(atoms)/useInquiryFormStore";

interface UseInquiryFormReturn {
  isSubmitting: boolean;
  handleSubmit: () => Promise<void>;
}

export const useInquiryForm = (): UseInquiryFormReturn => {
  const router = useRouter();

  const [법인] = useAtom(Form법인Atom);
  const [부서] = useAtom(Form부서Atom);
  const [문의자] = useAtom(Form문의자Atom);
  const [자산번호] = useAtom(Form자산번호Atom);
  const [문의유형] = useAtom(Form문의유형Atom);
  const [문의내용] = useAtom(Form문의내용Atom);
  const [긴급도] = useAtom(Form긴급도Atom);

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

      const data = await response.json();

      if (!response.ok) {
        throw data;
      }

      return data;
    },
    onSuccess: (data) => {
      router.push(`/inquiry/ticket/${data.ticketId}`);
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
