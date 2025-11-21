import type { AskTicketDetail } from "@/types/askTicket";

export const ASK_TICKETS_DATABASE_ID = process.env.ASK_TICKETS_DATABASE_ID;

export const notionHeaders = {
  accept: "application/json",
  "content-type": "application/json",
  "Notion-Version": "2022-06-28",
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
};

const NOTION_BASE_URL = "https://api.notion.com/v1";

type NotionSelectOption = {
  name?: string | null;
};

type NotionSelectProperty =
  | {
      select?: { options?: NotionSelectOption[] };
      multi_select?: { options?: NotionSelectOption[] };
      status?: { options?: NotionSelectOption[] };
    }
  | undefined;

export type AskSelectOptions = {
  corporations: string[];
  inquiryTypes: string[];
  urgencies: string[];
};

const propertyNameMap = {
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

const extractOptions = (property?: NotionSelectProperty) => {
  if (!property) return [];
  const candidates =
    property.select?.options ??
    property.multi_select?.options ??
    property.status?.options ??
    [];

  return candidates
    .map((option) => option?.name)
    .filter((name): name is string => Boolean(name));
};

export async function fetchAskDatabase() {
  if (!ASK_TICKETS_DATABASE_ID) {
    throw new Error("ASK_TICKETS_DATABASE_ID is not configured");
  }

  const response = await fetch(
    `${NOTION_BASE_URL}/databases/${ASK_TICKETS_DATABASE_ID}`,
    {
      method: "GET",
      cache: "no-store",
      headers: notionHeaders,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "Failed to fetch Notion database";
    throw new Error(message);
  }

  return data as {
    properties?: Record<string, NotionSelectProperty>;
  };
}

export async function loadAskSelectOptions(): Promise<AskSelectOptions> {
  const database = await fetchAskDatabase();
  const properties = database.properties ?? {};
  return {
    corporations: extractOptions(properties[propertyNameMap.corporation]),
    inquiryTypes: extractOptions(properties[propertyNameMap.inquiryType]),
    urgencies: extractOptions(properties[propertyNameMap.urgency]),
  };
}

export const ensureOptionValue = (
  value: string,
  options: string[],
  label: string,
) => {
  if (!value) {
    throw new Error(`${label} 값이 필요합니다.`);
  }
  if (!options.includes(value)) {
    throw new Error(`${label} 값이 올바르지 않습니다.`);
  }
  return value;
};

export const buildSelectProperty = (value?: string) =>
  value
    ? {
        select: { name: value },
      }
    : undefined;

export const buildRichTextProperty = (value?: string) =>
  value
    ? {
        rich_text: [
          {
            text: {
              content: value,
            },
          },
        ],
      }
    : undefined;

export const buildTitleProperty = (value: string) => ({
  title: [
    {
      text: {
        content: value,
      },
    },
  ],
});

export const sanitizeText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const ASK_FIELD_NAMES = propertyNameMap;

type NotionTextSpan = {
  plain_text?: string;
};

type NotionPropertyValue = {
  type: string;
  title?: NotionTextSpan[];
  rich_text?: NotionTextSpan[];
  select?: { name?: string | null } | null;
  status?: { name?: string | null } | null;
  people?: Array<{ name?: string | null }> | null;
  files?: Array<{ name?: string | null }> | null;
};

const getPlainText = (property?: NotionPropertyValue) => {
  if (!property) return undefined;
  if (property.type === "title" && property.title) {
    return property.title
      .map((item) => item.plain_text ?? "")
      .join("")
      .trim();
  }
  if (property.rich_text) {
    return property.rich_text
      .map((item) => item.plain_text ?? "")
      .join("")
      .trim();
  }
  return undefined;
};

const getSelectName = (property?: NotionPropertyValue) =>
  property?.select?.name ?? property?.status?.name ?? undefined;

const getPeopleNames = (property?: NotionPropertyValue) =>
  property?.people?.map((person) => person.name).filter(Boolean) as
    | string[]
    | undefined;

const getFileNames = (property?: NotionPropertyValue) =>
  property?.files?.map((file) => file.name).filter(Boolean) as
    | string[]
    | undefined;

export async function fetchAskTicketDetail(
  ticketId: string,
): Promise<AskTicketDetail> {
  const response = await fetch(`${NOTION_BASE_URL}/pages/${ticketId}`, {
    method: "GET",
    cache: "no-store",
    headers: notionHeaders,
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "문의 정보를 불러오지 못했습니다.";
    throw new Error(message);
  }

  const properties = data.properties as
    | Record<string, NotionPropertyValue>
    | undefined;

  const getProp = (field: keyof typeof ASK_FIELD_NAMES) =>
    properties?.[ASK_FIELD_NAMES[field]];

  return {
    id: data.id,
    url: data.url ?? null,
    createdTime: data.created_time,
    lastEditedTime: data.last_edited_time,
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
