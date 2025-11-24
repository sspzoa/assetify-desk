import { NextResponse } from "next/server";

import {
  buildCheckboxProperty,
  buildMultiSelectProperty,
  buildRichTextProperty,
  buildSelectProperty,
  buildTitleProperty,
  clampText,
  ensureOptionValue,
  isNonEmpty,
  NOTION_PAGES_ENDPOINT,
  notionHeaders,
  sanitizeText,
} from "@/utils/notion/helpers";
import {
  fetchRepairDatabase,
  loadRepairSelectOptions,
  REPAIR_FIELD_NAMES,
  REPAIR_TICKETS_DATABASE_ID,
} from "@/utils/notion/repair";

type RepairTicketPayload = {
  corporation: string;
  department?: string;
  assetNumber?: string;
  issueType?: string;
  detail: string;
  urgency: string;
  requester: string;
  location?: string;
  attachments: string[];
  consent: boolean;
};

const parsePayload = async (request: Request): Promise<RepairTicketPayload> => {
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
    assetNumber: sanitizeText(body?.assetNumber) || undefined,
    issueType: sanitizeText(body?.issueType) || undefined,
    detail: sanitizeText(body?.detail),
    urgency: sanitizeText(body?.urgency),
    requester: sanitizeText(body?.requester),
    location: sanitizeText(body?.location) || undefined,
    attachments,
    consent: Boolean(body?.consent),
  };
};

export async function GET() {
  try {
    const data = await fetchRepairDatabase();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load repair ticket database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!REPAIR_TICKETS_DATABASE_ID) {
    return NextResponse.json(
      { error: "REPAIR_TICKETS_DATABASE_ID is not configured." },
      { status: 500 },
    );
  }

  try {
    const payload = await parsePayload(request);

    if (
      !isNonEmpty(payload.corporation) ||
      !isNonEmpty(payload.detail) ||
      !isNonEmpty(payload.urgency) ||
      !isNonEmpty(payload.requester) ||
      !payload.consent
    ) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력하고 동의가 필요합니다." },
        { status: 400 },
      );
    }

    const options = await loadRepairSelectOptions();
    const corporation = ensureOptionValue(
      payload.corporation,
      options.corporations,
      "법인",
    );
    const urgency = ensureOptionValue(
      payload.urgency,
      options.urgencies,
      "긴급도",
    );
    const issueType = payload.issueType
      ? ensureOptionValue(payload.issueType, options.issueTypes, "고장 내역")
      : undefined;

    const properties: Record<string, unknown> = {
      [REPAIR_FIELD_NAMES.title]: buildTitleProperty(
        clampText(payload.detail) || `${payload.requester}님의 수리 요청`,
      ),
      [REPAIR_FIELD_NAMES.corporation]: buildSelectProperty(corporation),
      [REPAIR_FIELD_NAMES.urgency]: buildSelectProperty(urgency),
      [REPAIR_FIELD_NAMES.issueType]: buildMultiSelectProperty(
        issueType ? [issueType] : undefined,
      ),
      [REPAIR_FIELD_NAMES.assetNumber]: buildRichTextProperty(
        payload.assetNumber,
      ),
      [REPAIR_FIELD_NAMES.department]: buildRichTextProperty(
        payload.department,
      ),
      [REPAIR_FIELD_NAMES.requester]: buildRichTextProperty(payload.requester),
      [REPAIR_FIELD_NAMES.location]: buildRichTextProperty(payload.location),
      [REPAIR_FIELD_NAMES.consent]: buildCheckboxProperty(payload.consent),
    };

    const filteredProperties = Object.fromEntries(
      Object.entries(properties).filter(([, value]) => Boolean(value)),
    );

    const response = await fetch(NOTION_PAGES_ENDPOINT, {
      method: "POST",
      headers: notionHeaders,
      cache: "no-store",
      body: JSON.stringify({
        parent: { database_id: REPAIR_TICKETS_DATABASE_ID },
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
        : "수리 요청 등록 중 오류가 발생했습니다.";
    const isClientError =
      error instanceof Error &&
      /값이|필수|JSON|동의|입력해주세요/.test(error.message);
    return NextResponse.json(
      { error: message },
      { status: isClientError ? 400 : 500 },
    );
  }
}
