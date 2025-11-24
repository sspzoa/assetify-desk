/**
 * 문의 폼 페이지
 * 자산 관련 문의 사항을 작성하는 폼을 제공
 */

import { InquiryFormView } from "@/components/form/TicketFormView";
import { loadInquirySelectOptions } from "@/utils/notion/inquiry";

/**
 * 문의 폼 페이지 컴포넌트
 * Notion에서 선택 옵션을 불러와 폼에 전달
 */
export default async function InquiryFormPage() {
  try {
    // Notion에서 선택 옵션 로드
    const options = await loadInquirySelectOptions();
    return <InquiryFormView initialOptions={options} />;
  } catch (error) {
    // 옵션 로드 실패 시 에러 메시지 표시
    console.error("Failed to load inquiry form options", error);
    const message =
      error instanceof Error ? error.message : "선택지를 불러오지 못했습니다.";
    return <InquiryFormView initialError={message} />;
  }
}
