import { NextResponse } from "next/server";

import {
  ASK_FIELD_NAMES,
  ASK_TICKETS_DATABASE_ID,
  buildRichTextProperty,
  buildSelectProperty,
  buildTitleProperty,
  ensureOptionValue,
  fetchAskDatabase,
  loadAskSelectOptions,
  notionHeaders,
  sanitizeText,
} from "./notion-helpers";

const NOTION_PAGES_ENDPOINT = "https://api.notion.com/v1/pages";

type AskTicketPayload = {
  corporation: string;
  department?: string;
  assetNumber: string;
  inquiryType: string;
  detail: string;
  urgency: string;
  requester: string;
  attachments: string[];
};

const isNonEmpty = (value: string | undefined): value is string =>
  Boolean(value && value.trim().length > 0);

const clampText = (value: string, limit = 2000) =>
  value.length > limit ? value.slice(0, limit) : value;

const parsePayload = async (request: Request): Promise<AskTicketPayload> => {
  const body = await request.json().catch(() => {
    throw new Error("유효한 JSON 요청이 필요합니다.");
  });

  const attachments = Array.isArray(body?.attachments)
    ? body.attachments
        .map((item: unknown) => sanitizeText(item))
        .filter((item: string) => isNonEmpty(item))
    : [];

  return {
    corporation: sanitizeText(body?.corporation),
    department: sanitizeText(body?.department) || undefined,
    assetNumber: sanitizeText(body?.assetNumber),
    inquiryType: sanitizeText(body?.inquiryType),
    detail: sanitizeText(body?.detail),
    urgency: sanitizeText(body?.urgency),
    requester: sanitizeText(body?.requester),
    attachments,
  };
};

export async function GET() {
  try {
    const data = await fetchAskDatabase();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load ASK ticket database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!ASK_TICKETS_DATABASE_ID) {
    return NextResponse.json(
      { error: "ASK_TICKETS_DATABASE_ID is not configured." },
      { status: 500 },
    );
  }

  try {
    const payload = await parsePayload(request);

    if (
      !isNonEmpty(payload.corporation) ||
      !isNonEmpty(payload.inquiryType) ||
      !isNonEmpty(payload.detail) ||
      !isNonEmpty(payload.urgency) ||
      !isNonEmpty(payload.requester)
    ) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 },
      );
    }

    const selectOptions = await loadAskSelectOptions();

    const corporation = ensureOptionValue(
      payload.corporation,
      selectOptions.corporations,
      "법인",
    );
    const inquiryType = ensureOptionValue(
      payload.inquiryType,
      selectOptions.inquiryTypes,
      "문의 유형",
    );
    const urgency = ensureOptionValue(
      payload.urgency,
      selectOptions.urgencies,
      "긴급도",
    );

    const titleSource =
      clampText(payload.detail) || `${payload.requester}님의 문의`;
    const properties: Record<string, unknown> = {
      [ASK_FIELD_NAMES.title]: buildTitleProperty(titleSource),
      [ASK_FIELD_NAMES.corporation]: buildSelectProperty(corporation),
      [ASK_FIELD_NAMES.inquiryType]: buildSelectProperty(inquiryType),
      [ASK_FIELD_NAMES.urgency]: buildSelectProperty(urgency),
      [ASK_FIELD_NAMES.assetNumber]: buildRichTextProperty(payload.assetNumber),
      [ASK_FIELD_NAMES.requester]: buildRichTextProperty(payload.requester),
      [ASK_FIELD_NAMES.department]: buildRichTextProperty(payload.department),
    };

    const filteredProperties = Object.fromEntries(
      Object.entries(properties).filter(([, value]) => Boolean(value)),
    );

    const notionResponse = await fetch(NOTION_PAGES_ENDPOINT, {
      method: "POST",
      headers: notionHeaders,
      cache: "no-store",
      body: JSON.stringify({
        parent: { database_id: ASK_TICKETS_DATABASE_ID },
        properties: filteredProperties,
      }),
    });

    const notionData = await notionResponse.json();

    if (!notionResponse.ok) {
      const message =
        typeof notionData?.message === "string"
          ? notionData.message
          : "Notion API 요청에 실패했습니다.";
      return NextResponse.json(
        { error: message },
        { status: notionResponse.status },
      );
    }

    return NextResponse.json({ id: notionData.id, success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "문의 등록 중 오류가 발생했습니다.";
    const isClientError =
      error instanceof Error &&
      /값이|필수|JSON|입력해주세요/.test(error.message);
    return NextResponse.json(
      { error: message },
      { status: isClientError ? 400 : 500 },
    );
  }
}
