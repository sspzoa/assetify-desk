import { NextResponse } from "next/server";

import {
  ASK_FIELD_NAMES,
  ASK_TICKETS_DATABASE_ID,
  buildRichTextProperty,
  buildSelectProperty,
  buildTitleProperty,
  clampText,
  ensureOptionValue,
  fetchAskDatabase,
  isNonEmpty,
  loadAskSelectOptions,
  NOTION_PAGES_ENDPOINT,
  notionHeaders,
  sanitizeText,
} from "@/utils/notion/ask";

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
        { error: "필수 항목을 모두 입력해 주세요." },
        { status: 400 },
      );
    }

    const options = await loadAskSelectOptions();
    const corporation = ensureOptionValue(
      payload.corporation,
      options.corporations,
      "법인",
    );
    const inquiryType = ensureOptionValue(
      payload.inquiryType,
      options.inquiryTypes,
      "문의 유형",
    );
    const urgency = ensureOptionValue(
      payload.urgency,
      options.urgencies,
      "긴급도",
    );

    const properties: Record<string, unknown> = {
      [ASK_FIELD_NAMES.title]: buildTitleProperty(
        clampText(payload.detail) || `${payload.requester}님의 문의`,
      ),
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

    const response = await fetch(NOTION_PAGES_ENDPOINT, {
      method: "POST",
      headers: notionHeaders,
      cache: "no-store",
      body: JSON.stringify({
        parent: { database_id: ASK_TICKETS_DATABASE_ID },
        properties: filteredProperties,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : "Notion API 요청에 실패했습니다.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    return NextResponse.json({ id: data.id, success: true });
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
