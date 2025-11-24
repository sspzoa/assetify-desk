import type { AskTicketDetail } from "@/types/ticket";
import {
  archiveNotionPage,
  extractOptions,
  fetchNotionDatabase,
  fetchNotionPage,
  getFileNames,
  getPeopleNames,
  getPlainText,
  getSelectName,
  NOTION_PAGES_ENDPOINT,
  notionHeaders,
} from "@/utils/notion/helpers";
import type { NotionPropertyValue } from "@/utils/notion/types";

export { notionHeaders, NOTION_PAGES_ENDPOINT };
export {
  buildRichTextProperty,
  buildSelectProperty,
  buildTitleProperty,
  clampText,
  ensureOptionValue,
  isNonEmpty,
  sanitizeText,
} from "@/utils/notion/helpers";

// 문의 티켓 데이터베이스 ID
export const ASK_TICKETS_DATABASE_ID = process.env.ASK_TICKETS_DATABASE_ID;

// 문의 티켓 필드명 매핑
const FIELD_NAMES = {
  corporation: "법인",
  inquiryType: "문의유형",
  urgency: "긴급도",
  department: "부서",
  requester: "문의자",
  assetNumber: "자산번호",
  title: "문의내용",
  notes: "Notes",
  status: "상태",
  assignee: "담당자",
  attachments: "첨부파일",
};

export const ASK_FIELD_NAMES = FIELD_NAMES;

// 문의 선택 옵션 타입
export type AskSelectOptions = {
  corporations: string[]; // 법인 목록
  inquiryTypes: string[]; // 문의 유형 목록
  urgencies: string[]; // 긴급도 목록
};

// 문의 데이터베이스 정보 조회
export async function fetchAskDatabase() {
  if (!ASK_TICKETS_DATABASE_ID) {
    throw new Error("ASK_TICKETS_DATABASE_ID is not configured");
  }
  return fetchNotionDatabase(ASK_TICKETS_DATABASE_ID);
}

// 문의 폼 선택 옵션 로드
export async function loadAskSelectOptions(): Promise<AskSelectOptions> {
  const database = await fetchAskDatabase();
  const properties = database.properties ?? {};
  return {
    corporations: extractOptions(properties[FIELD_NAMES.corporation]),
    inquiryTypes: extractOptions(properties[FIELD_NAMES.inquiryType]),
    urgencies: extractOptions(properties[FIELD_NAMES.urgency]),
  };
}

// 문의 티켓 상세 정보 조회
export async function fetchAskTicketDetail(
  ticketId: string,
): Promise<AskTicketDetail> {
  const data = await fetchNotionPage(ticketId);
  const properties = data.properties as
    | Record<string, NotionPropertyValue>
    | undefined;

  // 필드명으로 속성 가져오기
  const getProp = (field: keyof typeof FIELD_NAMES) =>
    properties?.[FIELD_NAMES[field]];

  return {
    id: data.id,
    url: data.url ?? null,
    createdTime: data.created_time,
    lastEditedTime: data.last_edited_time,
    archived: data.archived ?? false,
    detail: getPlainText(getProp("title")),
    corporation: getSelectName(getProp("corporation")),
    inquiryType: getSelectName(getProp("inquiryType")),
    urgency: getSelectName(getProp("urgency")),
    assetNumber: getPlainText(getProp("assetNumber")),
    department: getPlainText(getProp("department")),
    requester: getPlainText(getProp("requester")),
    status: getSelectName(getProp("status")),
    assignee: getPeopleNames(getProp("assignee"))?.join(", "),
    attachments: getFileNames(getProp("attachments")),
  };
}

// 문의 티켓 삭제 (보관 처리)
export async function deleteAskTicket(ticketId: string) {
  await archiveNotionPage(ticketId, "문의 삭제에 실패했습니다.");
}
