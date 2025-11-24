/**
 * 수리 요청 폼 페이지
 * 하드웨어 고장 수리 요청을 작성하는 폼을 제공
 */

import { RepairFormView } from "@/components/form/TicketFormView";
import { loadRepairSelectOptions } from "@/utils/notion/repair";

/**
 * 수리 요청 폼 페이지 컴포넌트
 * Notion에서 선택 옵션을 불러와 폼에 전달
 */
export default async function RepairFormPage() {
  try {
    // Notion에서 선택 옵션 로드
    const options = await loadRepairSelectOptions();
    return <RepairFormView initialOptions={options} />;
  } catch (error) {
    // 옵션 로드 실패 시 에러 메시지 표시
    console.error("Failed to load repair form options", error);
    const message =
      error instanceof Error ? error.message : "선택지를 불러오지 못했습니다.";
    return <RepairFormView initialError={message} />;
  }
}
