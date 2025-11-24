import type { RepairTicketDetail } from "@/types/ticket";
import {
  archiveNotionPage,
  extractOptions,
  fetchNotionDatabase,
  fetchNotionPage,
  getDateValue,
  getFileNames,
  getMultiSelectNames,
  getNumberText,
  getPeopleNames,
  getPlainText,
  getSelectName,
} from "@/utils/notion/helpers";
import type {
  NotionPropertyValue,
  NotionSelectProperty,
} from "@/utils/notion/types";

export {
  buildCheckboxProperty,
  buildMultiSelectProperty,
  buildRichTextProperty,
  buildSelectProperty,
  buildTitleProperty,
  ensureOptionValue,
  NOTION_PAGES_ENDPOINT,
  notionHeaders,
  sanitizeText,
} from "@/utils/notion/helpers";

export const REPAIR_TICKETS_DATABASE_ID =
  process.env.REPAIR_TICKETS_DATABASE_ID;

const FIELD_NAMES = {
  title: "고장증상",
  corporation: "법인",
  department: "부서",
  requester: "문의자",
  assetNumber: "자산번호",
  team: "Team",
  urgency: "긴급도",
  issueType: "고장 내역",
  location: "실제 근무 위치",
  status: "상태",
  progressStatus: "수리진행상황",
  assignee: "담당자",
  attachments: "첨부파일",
  consent: "수리 진행 동의서",
  actionNotes: "조치내용",
  liability: "과실여부",
  schedule: "수리 일정",
  price: "단가",
};

export const REPAIR_FIELD_NAMES = FIELD_NAMES;

export type RepairSelectOptions = {
  corporations: string[];
  urgencies: string[];
  issueTypes: string[];
};

export async function fetchRepairDatabase() {
  if (!REPAIR_TICKETS_DATABASE_ID) {
    throw new Error("REPAIR_TICKETS_DATABASE_ID is not configured");
  }
  return fetchNotionDatabase(REPAIR_TICKETS_DATABASE_ID);
}

export async function loadRepairSelectOptions(): Promise<RepairSelectOptions> {
  const database = await fetchRepairDatabase();
  const properties = database.properties ?? {};

  const extractMultiSelectOptions = (property?: NotionSelectProperty) => {
    if (!property?.multi_select?.options) return [];
    return property.multi_select.options
      .map((option) => option?.name)
      .filter((name): name is string => Boolean(name));
  };

  return {
    corporations: extractOptions(properties[FIELD_NAMES.corporation]),
    urgencies: extractOptions(properties[FIELD_NAMES.urgency]),
    issueTypes: extractMultiSelectOptions(properties[FIELD_NAMES.issueType]),
  };
}

export async function fetchRepairTicketDetail(
  ticketId: string,
): Promise<RepairTicketDetail> {
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
    team: getSelectName(getProp("team")),
    urgency: getSelectName(getProp("urgency")),
    issueTypes: getMultiSelectNames(getProp("issueType")),
    assetNumber: getPlainText(getProp("assetNumber")),
    department: getPlainText(getProp("department")),
    requester: getPlainText(getProp("requester")),
    location: getPlainText(getProp("location")),
    status: getSelectName(getProp("status")),
    progressStatus: getSelectName(getProp("progressStatus")),
    assignee: getPeopleNames(getProp("assignee"))?.join(", "),
    attachments: getFileNames(getProp("attachments")),
    actionNotes: getPlainText(getProp("actionNotes")),
    liability: getSelectName(getProp("liability")),
    schedule: getDateValue(getProp("schedule")),
    price: getNumberText(getProp("price")),
  };
}

export async function deleteRepairTicket(ticketId: string) {
  await archiveNotionPage(ticketId, "수리 요청 삭제에 실패했습니다.");
}
