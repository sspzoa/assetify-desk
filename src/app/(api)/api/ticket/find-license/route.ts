import { NextResponse } from "next/server";

import {
  ensureOptionValue,
  isNonEmpty,
  loadFindLicenseSelectOptions,
  notionHeaders,
  sanitizeText,
} from "@/utils/notion/find-license";
import { LICENSE_CONFIGS } from "@/utils/notion/license-config";
import {
  type ParsedLicenseResult,
  parseLicenseResult,
} from "@/utils/notion/license-parser";
import type { NotionPropertyValue } from "@/utils/notion/types";

// 환경 변수에서 라이센스 데이터베이스 ID 가져오기
const LICENSE_DATABASE_IDS = {
  MS_OFFICE: process.env.MS_OFFICE_LICENSE_DATABASE_ID,
  MS365: process.env.MS365_LICENSE_DATABASE_ID,
  HANCOM_OFFICE: process.env.HANCOM_OFFICE_LICENSE_DATABASE_ID,
  EZ_PDF: process.env.EZ_PDF_LICENSE_DATABASE_ID,
  ADOBE_PDF: process.env.ADOBE_PDF_LICENSE_DATABASE_ID,
  ADOBE_CREATIVE_CLOUD: process.env.ADOBE_CREATIVE_CLOUD_LICENSE_DATABASE_ID,
  ADOBE_PHOTO_SHOP: process.env.ADOBE_PHOTO_SHOP_LICENSE_DATABASE_ID,
  ADOBE_ILLUSTRATOR: process.env.ADOBE_ILLUSTRATOR_LICENSE_DATABASE_ID,
  ADOBE_PREMIERE_PRO: process.env.ADOBE_PREMIERE_PRO_LICENSE_DATABASE_ID,
  AUTOCAD: process.env.AUTOCAD_LICENSE_DATABASE_ID,
  MAC_MS_OFFICE: process.env.MAC_MS_OFFICE_LICENSE_DATABASE_ID,
  MAC_HANCOM_OFFICE: process.env.MAC_HANCOM_OFFICE_LICENSE_DATABASE_ID,
  ETC: process.env.ETC_LICENSE_DATABASE_ID,
} as const;

type FindLicensePayload = {
  corporation: string;
  requester: string;
};

const parsePayload = async (request: Request): Promise<FindLicensePayload> => {
  const body = await request.json().catch(() => {
    throw new Error("유효하지 않은 JSON 요청입니다");
  });

  return {
    corporation: sanitizeText(body?.corporation),
    requester: sanitizeText(body?.requester),
  };
};

/**
 * POST /api/ticket/find-license
 * 입력받은 사용자 정보로 모든 라이센스 데이터베이스를 검색
 */
export async function POST(request: Request) {
  try {
    const payload = await parsePayload(request);

    // 필수 필드 검증
    if (!isNonEmpty(payload.corporation) || !isNonEmpty(payload.requester)) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요" },
        { status: 400 },
      );
    }

    // 옵션 로드 및 검증
    const options = await loadFindLicenseSelectOptions();
    const corporation = ensureOptionValue(
      payload.corporation,
      options.corporations,
      "법인",
    );

    // 모든 라이센스 데이터베이스를 병렬로 검색
    const searchPromises = Object.entries(LICENSE_DATABASE_IDS)
      .filter(([, dbId]) => dbId) // 설정된 데이터베이스만 검색
      .map(
        async ([licenseName, dbId]): Promise<{
          licenseName: string;
          results: ParsedLicenseResult[];
          error: string | null;
        }> => {
          const config = LICENSE_CONFIGS[licenseName];
          if (!config) {
            console.error(`${licenseName}에 대한 설정을 찾을 수 없습니다`);
            return { licenseName, results: [], error: "설정 없음" };
          }

          try {
            // 속성 타입에 따라 필터 구성
            const userFilter =
              config.userPropertyType === "title"
                ? {
                    property: config.userProperty,
                    title: {
                      contains: payload.requester,
                    },
                  }
                : {
                    property: config.userProperty,
                    rich_text: {
                      contains: payload.requester,
                    },
                  };

            const searchResponse = await fetch(
              `https://api.notion.com/v1/databases/${dbId}/query`,
              {
                method: "POST",
                headers: notionHeaders,
                cache: "no-store",
                body: JSON.stringify({
                  filter: {
                    and: [
                      userFilter,
                      {
                        property: config.corporationProperty,
                        select: {
                          equals: corporation,
                        },
                      },
                    ],
                  },
                }),
              },
            );

            if (searchResponse.ok) {
              const searchData = await searchResponse.json();
              const parsedResults = (searchData.results || []).map(
                (page: {
                  id: string;
                  properties?: Record<string, NotionPropertyValue>;
                }) => parseLicenseResult(page, config),
              );
              return {
                licenseName,
                results: parsedResults,
                error: null,
              };
            } else {
              const errorData = await searchResponse.json();
              console.error(`${licenseName} 검색 오류:`, errorData.message);
              return {
                licenseName,
                results: [],
                error: errorData.message || "검색 실패",
              };
            }
          } catch (error) {
            console.error(`${licenseName} 검색 오류:`, error);
            return {
              licenseName,
              results: [],
              error: error instanceof Error ? error.message : "알 수 없는 오류",
            };
          }
        },
      );

    const searchResults = await Promise.all(searchPromises);
    const foundLicenses = searchResults.filter(
      (result) => result.results.length > 0,
    );

    // 디버깅을 위한 에러 포함
    const errors = searchResults
      .filter((result) => result.error)
      .map((result) => ({
        licenseName: result.licenseName,
        error: result.error,
      }));

    return NextResponse.json({
      success: true,
      searchResults: foundLicenses,
      totalFound: foundLicenses.reduce(
        (acc, result) => acc + result.results.length,
        0,
      ),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "라이센스 검색 중 오류가 발생했습니다";
    const isClientError =
      error instanceof Error && /필수|입력|형식/.test(error.message);
    return NextResponse.json(
      { error: message },
      { status: isClientError ? 400 : 500 },
    );
  }
}
