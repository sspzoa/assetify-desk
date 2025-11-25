import { NextResponse } from "next/server";

import { notionHeaders } from "@/utils/notion/helpers";

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

/**
 * GET /api/debug/license-schemas
 * 모든 라이센스 데이터베이스의 스키마를 조회하여 반환
 */
export async function GET() {
  const schemas: Record<
    string,
    { properties: Record<string, unknown> } | { error: string }
  > = {};

  const schemaPromises = Object.entries(LICENSE_DATABASE_IDS).map(
    async ([licenseName, dbId]) => {
      if (!dbId) {
        return {
          name: licenseName,
          schema: { error: "데이터베이스 ID가 설정되지 않음" },
        };
      }

      try {
        const response = await fetch(
          `https://api.notion.com/v1/databases/${dbId}`,
          {
            method: "GET",
            headers: notionHeaders,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          return {
            name: licenseName,
            schema: { error: errorData.message || "조회 실패" },
          };
        }

        const data = await response.json();
        return {
          name: licenseName,
          schema: {
            properties: Object.entries(data.properties || {}).reduce(
              (
                acc,
                [key, value]: [
                  string,
                  { type: string; id: string; [key: string]: unknown },
                ],
              ) => {
                acc[key] = {
                  type: value.type,
                  id: value.id,
                };
                return acc;
              },
              {} as Record<string, { type: string; id: string }>,
            ),
          },
        };
      } catch (error) {
        return {
          name: licenseName,
          schema: {
            error:
              error instanceof Error ? error.message : "알 수 없는 오류 발생",
          },
        };
      }
    },
  );

  const results = await Promise.all(schemaPromises);

  results.forEach((result) => {
    schemas[result.name] = result.schema;
  });

  return NextResponse.json({ schemas });
}
