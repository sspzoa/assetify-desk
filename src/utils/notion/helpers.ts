import { NOTION_API_VERSION, NOTION_BASE_URL } from "@/constants";
import type {
  NotionPropertyValue,
  NotionSelectProperty,
} from "@/utils/notion/types";

export const notionHeaders = {
  accept: "application/json",
  "content-type": "application/json",
  "Notion-Version": NOTION_API_VERSION,
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
};

export const NOTION_PAGES_ENDPOINT = `${NOTION_BASE_URL}/pages`;

export const getPlainText = (property?: NotionPropertyValue) => {
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

export const getSelectName = (property?: NotionPropertyValue) =>
  property?.select?.name ?? property?.status?.name ?? undefined;

export const getMultiSelectNames = (property?: NotionPropertyValue) =>
  property?.multi_select
    ?.map((option) => option?.name)
    .filter((name): name is string => Boolean(name));

export const getPeopleNames = (property?: NotionPropertyValue) =>
  property?.people?.map((person) => person.name).filter(Boolean) as
    | string[]
    | undefined;

export const getFileNames = (property?: NotionPropertyValue) =>
  property?.files?.map((file) => file.name).filter(Boolean) as
    | string[]
    | undefined;

export const getDateValue = (property?: NotionPropertyValue) =>
  property?.date?.start ?? undefined;

export const getNumberText = (property?: NotionPropertyValue) =>
  typeof property?.number === "number"
    ? property.number.toLocaleString("ko-KR")
    : undefined;

export const extractOptions = (property?: NotionSelectProperty) => {
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

export const buildSelectProperty = (value?: string) =>
  value ? { select: { name: value } } : undefined;

export const buildRichTextProperty = (value?: string) =>
  value ? { rich_text: [{ text: { content: value } }] } : undefined;

export const buildTitleProperty = (value: string) => ({
  title: [{ text: { content: value } }],
});

export const buildMultiSelectProperty = (values?: string[]) =>
  values && values.length > 0
    ? { multi_select: values.map((value) => ({ name: value })) }
    : undefined;

export const buildCheckboxProperty = (value?: boolean) =>
  typeof value === "boolean" ? { checkbox: value } : undefined;

export const sanitizeText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const ensureOptionValue = (
  value: string,
  options: string[],
  label: string,
) => {
  if (!value) throw new Error(`${label} 값이 필요합니다.`);
  if (!options.includes(value))
    throw new Error(`${label} 값이 올바르지 않습니다.`);
  return value;
};

export const maskName = (name?: string | null) => {
  if (!name) return null;
  const trimmed = name.trim();
  if (trimmed.length < 2) return trimmed || null;
  return `${trimmed[0]}*${trimmed.slice(2)}`;
};

export const isNonEmpty = (value: string | undefined): value is string =>
  Boolean(value && value.trim().length > 0);

export const clampText = (value: string, limit = 2000) =>
  value.length > limit ? value.slice(0, limit) : value;

export async function fetchNotionDatabase(databaseId: string) {
  const response = await fetch(`${NOTION_BASE_URL}/databases/${databaseId}`, {
    method: "GET",
    cache: "no-store",
    headers: notionHeaders,
  });
  const data = await response.json();
  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "Failed to fetch Notion database";
    throw new Error(message);
  }
  return data as { properties?: Record<string, NotionSelectProperty> };
}

export async function fetchNotionPage(pageId: string) {
  const response = await fetch(`${NOTION_PAGES_ENDPOINT}/${pageId}`, {
    method: "GET",
    cache: "no-store",
    headers: notionHeaders,
  });
  const data = await response.json();
  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "페이지를 불러오지 못했습니다.";
    throw new Error(message);
  }
  return data;
}

export async function archiveNotionPage(pageId: string, errorMessage: string) {
  const response = await fetch(`${NOTION_PAGES_ENDPOINT}/${pageId}`, {
    method: "PATCH",
    headers: notionHeaders,
    body: JSON.stringify({ archived: true }),
  });
  if (!response.ok) {
    const data = await response.json();
    const message =
      typeof data?.message === "string" ? data.message : errorMessage;
    throw new Error(message);
  }
}
