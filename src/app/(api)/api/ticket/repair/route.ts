/**
 * 수리 요청 티켓 API
 * 수리 요청 목록 조회 및 새 수리 요청 등록 엔드포인트
 */

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

// 수리 요청 티켓 페이로드 타입
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

/**
 * 요청 본문을 파싱하여 페이로드 객체로 변환
 * @param request - HTTP 요청 객체
 * @returns 파싱된 페이로드
 */
const parsePayload = async (request: Request): Promise<RepairTicketPayload> => {
  const body = await request.json().catch(() => {
    throw new Error("유효한 JSON 요청이 필요합니다.");
  });

  // 첨부파일 배열 처리
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

/**
 * GET /api/ticket/repair
 * 수리 요청 데이터베이스 정보 조회
 * @returns 데이터베이스 정보
 */
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

/**
 * POST /api/ticket/repair
 * 새 수리 요청 티켓 생성
 * @param request - 수리 요청 내용이 포함된 요청
 * @returns 생성된 티켓 ID 및 성공 여부
 */
export async function POST(request: Request) {
  // 환경 변수 확인
  if (!REPAIR_TICKETS_DATABASE_ID) {
    return NextResponse.json(
      { error: "REPAIR_TICKETS_DATABASE_ID is not configured." },
      { status: 500 },
    );
  }

  try {
    const payload = await parsePayload(request);

    // 필수 필드 및 동의 검증
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

    // 선택 옵션 로드 및 검증
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
    // 고장 내역은 선택 사항
    const issueType = payload.issueType
      ? ensureOptionValue(payload.issueType, options.issueTypes, "고장 내역")
      : undefined;

    // Notion 페이지 속성 구성
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

    // 빈 값 제거
    const filteredProperties = Object.fromEntries(
      Object.entries(properties).filter(([, value]) => Boolean(value)),
    );

    // Notion API로 페이지 생성
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

    // Notion API 에러 처리
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
    // 클라이언트 에러 판별
    const isClientError =
      error instanceof Error &&
      /값이|필수|JSON|동의|입력해주세요/.test(error.message);
    return NextResponse.json(
      { error: message },
      { status: isClientError ? 400 : 500 },
    );
  }
}
