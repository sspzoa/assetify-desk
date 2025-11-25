/**
 * 문의 티켓 API
 * 문의 티켓 목록 조회 및 새 문의 등록 엔드포인트
 */

import { NextResponse } from "next/server";

import {
  buildRichTextProperty,
  buildSelectProperty,
  buildTitleProperty,
  clampText,
  ensureOptionValue,
  fetchInquiryDatabase,
  INQUIRY_FIELD_NAMES,
  INQUIRY_TICKETS_DATABASE_ID,
  isNonEmpty,
  loadInquirySelectOptions,
  NOTION_PAGES_ENDPOINT,
  notionHeaders,
  sanitizeText,
} from "@/utils/notion/inquiry";

// 문의 티켓 요청 페이로드 타입
type InquiryTicketPayload = {
  corporation: string;
  department?: string;
  assetNumber: string;
  inquiryType: string;
  detail: string;
  urgency: string;
  requester: string;
  attachments: string[];
};

/**
 * 요청 본문을 파싱하여 페이로드 객체로 변환
 * @param request - HTTP 요청 객체
 * @returns 파싱된 페이로드
 */
const parsePayload = async (
  request: Request,
): Promise<InquiryTicketPayload> => {
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
    assetNumber: sanitizeText(body?.assetNumber),
    inquiryType: sanitizeText(body?.inquiryType),
    detail: sanitizeText(body?.detail),
    urgency: sanitizeText(body?.urgency),
    requester: sanitizeText(body?.requester),
    attachments,
  };
};

/**
 * GET /api/ticket/inquiry
 * 문의 티켓 데이터베이스 정보 조회
 * @returns 데이터베이스 정보
 */
export async function GET() {
  try {
    const data = await fetchInquiryDatabase();
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load inquiry ticket database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/ticket/inquiry
 * 새 문의 티켓 생성
 * @param request - 문의 내용이 포함된 요청
 * @returns 생성된 티켓 ID 및 성공 여부
 */
export async function POST(request: Request) {
  // 환경 변수 확인
  if (!INQUIRY_TICKETS_DATABASE_ID) {
    return NextResponse.json(
      { error: "INQUIRY_TICKETS_DATABASE_ID is not configured." },
      { status: 500 },
    );
  }

  try {
    const payload = await parsePayload(request);

    // 필수 필드 검증
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

    // 선택 옵션 로드 및 검증
    const options = await loadInquirySelectOptions();
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

    // Notion 페이지 속성 구성
    const properties: Record<string, unknown> = {
      [INQUIRY_FIELD_NAMES.title]: buildTitleProperty(
        clampText(payload.detail) || `${payload.requester}님의 문의`,
      ),
      [INQUIRY_FIELD_NAMES.corporation]: buildSelectProperty(corporation),
      [INQUIRY_FIELD_NAMES.inquiryType]: buildSelectProperty(inquiryType),
      [INQUIRY_FIELD_NAMES.urgency]: buildSelectProperty(urgency),
      [INQUIRY_FIELD_NAMES.assetNumber]: buildRichTextProperty(
        payload.assetNumber,
      ),
      [INQUIRY_FIELD_NAMES.requester]: buildRichTextProperty(payload.requester),
      [INQUIRY_FIELD_NAMES.department]: buildRichTextProperty(
        payload.department,
      ),
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
        parent: { database_id: INQUIRY_TICKETS_DATABASE_ID },
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
        : "문의 등록 중 오류가 발생했습니다.";
    // 클라이언트 에러 판별
    const isClientError =
      error instanceof Error &&
      /값이|필수|JSON|입력해주세요/.test(error.message);
    return NextResponse.json(
      { error: message },
      { status: isClientError ? 400 : 500 },
    );
  }
}
