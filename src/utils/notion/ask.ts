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

export const ASK_TICKETS_DATABASE_ID = process.env.ASK_TICKETS_DATABASE_ID;

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

export type AskSelectOptions = {
  corporations: string[];
  inquiryTypes: string[];
  urgencies: string[];
};

export async function fetchAskDatabase() {
  if (!ASK_TICKETS_DATABASE_ID) {
    throw new Error("ASK_TICKETS_DATABASE_ID is not configured");
  }
  return fetchNotionDatabase(ASK_TICKETS_DATABASE_ID);
}

export async function loadAskSelectOptions(): Promise<AskSelectOptions> {
  const database = await fetchAskDatabase();
  const properties = database.properties ?? {};
  return {
    corporations: extractOptions(properties[FIELD_NAMES.corporation]),
    inquiryTypes: extractOptions(properties[FIELD_NAMES.inquiryType]),
    urgencies: extractOptions(properties[FIELD_NAMES.urgency]),
  };
}

export async function fetchAskTicketDetail(
  ticketId: string,
): Promise<AskTicketDetail> {
  const data = await fetchNotionPage(ticketId);
  const properties = data.properties as
    | Record<string, NotionPropertyValue>
    | undefined;

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

export async function deleteAskTicket(ticketId: string) {
  await archiveNotionPage(ticketId, "문의 삭제에 실패했습니다.");
}
