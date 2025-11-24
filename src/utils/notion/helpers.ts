import { NOTION_API_VERSION, NOTION_BASE_URL } from "@/constants";
import type {
  NotionPropertyValue,
  NotionSelectProperty,
} from "@/utils/notion/types";

// Notion API 요청 헤더
export const notionHeaders = {
  accept: "application/json",
  "content-type": "application/json",
  "Notion-Version": NOTION_API_VERSION,
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
};

// Notion 페이지 API 엔드포인트
export const NOTION_PAGES_ENDPOINT = `${NOTION_BASE_URL}/pages`;

// 속성에서 일반 텍스트 추출
export const getPlainText = (property?: NotionPropertyValue) => {
  if (!property) return undefined;
  // 제목 타입인 경우
  if (property.type === "title" && property.title) {
    return property.title
      .map((item) => item.plain_text ?? "")
      .join("")
      .trim();
  }
  // 리치 텍스트인 경우
  if (property.rich_text) {
    return property.rich_text
      .map((item) => item.plain_text ?? "")
      .join("")
      .trim();
  }
  return undefined;
};

// 속성에서 선택 값 이름 추출
export const getSelectName = (property?: NotionPropertyValue) =>
  property?.select?.name ?? property?.status?.name ?? undefined;

// 속성에서 다중 선택 값 이름들 추출
export const getMultiSelectNames = (property?: NotionPropertyValue) =>
  property?.multi_select
    ?.map((option) => option?.name)
    .filter((name): name is string => Boolean(name));

// 속성에서 사람 이름들 추출
export const getPeopleNames = (property?: NotionPropertyValue) =>
  property?.people?.map((person) => person.name).filter(Boolean) as
    | string[]
    | undefined;

// 속성에서 파일 이름들 추출
export const getFileNames = (property?: NotionPropertyValue) =>
  property?.files?.map((file) => file.name).filter(Boolean) as
    | string[]
    | undefined;

// 속성에서 날짜 값 추출
export const getDateValue = (property?: NotionPropertyValue) =>
  property?.date?.start ?? undefined;

// 속성에서 숫자를 한국어 형식 문자열로 변환
export const getNumberText = (property?: NotionPropertyValue) =>
  typeof property?.number === "number"
    ? property.number.toLocaleString("ko-KR")
    : undefined;

// 선택 속성에서 옵션 목록 추출
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

// 단일 선택 속성 객체 생성
export const buildSelectProperty = (value?: string) =>
  value ? { select: { name: value } } : undefined;

// 리치 텍스트 속성 객체 생성
export const buildRichTextProperty = (value?: string) =>
  value ? { rich_text: [{ text: { content: value } }] } : undefined;

// 제목 속성 객체 생성
export const buildTitleProperty = (value: string) => ({
  title: [{ text: { content: value } }],
});

// 다중 선택 속성 객체 생성
export const buildMultiSelectProperty = (values?: string[]) =>
  values && values.length > 0
    ? { multi_select: values.map((value) => ({ name: value })) }
    : undefined;

// 체크박스 속성 객체 생성
export const buildCheckboxProperty = (value?: boolean) =>
  typeof value === "boolean" ? { checkbox: value } : undefined;

// 텍스트 정리 (공백 제거)
export const sanitizeText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

// 옵션 값 유효성 검사
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

// 이름 마스킹 (개인정보 보호)
export const maskName = (name?: string | null) => {
  if (!name) return null;
  const trimmed = name.trim();
  if (trimmed.length < 2) return trimmed || null;
  return `${trimmed[0]}*${trimmed.slice(2)}`;
};

// 빈 문자열이 아닌지 확인
export const isNonEmpty = (value: string | undefined): value is string =>
  Boolean(value && value.trim().length > 0);

// 텍스트 길이 제한
export const clampText = (value: string, limit = 2000) =>
  value.length > limit ? value.slice(0, limit) : value;

// Notion 데이터베이스 정보 조회
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

// Notion 페이지 정보 조회
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

// Notion 페이지 보관 (삭제)
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
