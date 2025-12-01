import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { notionRequest } from "@/shared/lib/notion";

const getRichText = (page: any, field: string): string =>
  page.properties[field]?.rich_text?.[0]?.text?.content ?? "-";

const extractFields = (fields: string[]) => (page: any) =>
  fields.reduce(
    (acc, field) => {
      acc[field] = getRichText(page, field);
      return acc;
    },
    {} as Record<string, string>,
  );

const LICENSE_CONFIGS = {
  "MS OFFICE": {
    dataSourceId: process.env.MS_OFFICE_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "시리얼넘버"]),
  },
  "MS Office 365": {
    dataSourceId: process.env.MS365_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "등록계정"]),
  },
  한컴: {
    dataSourceId: process.env.HANCOM_OFFICE_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "시리얼넘버"]),
  },
  "EZ PDF": {
    dataSourceId: process.env.EZ_PDF_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "시리얼넘버"]),
  },
  "Adobe PDF": {
    dataSourceId: process.env.ADOBE_PDF_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields([
      "소프트웨어",
      "시리얼넘버/win",
      "시리얼넘버/mac",
    ]),
  },
  "adobe-creative-cloud": {
    dataSourceId: process.env.ADOBE_CREATIVE_CLOUD_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["등록계정"]),
  },
  "Adobe Photoshop": {
    dataSourceId: process.env.ADOBE_PHOTO_SHOP_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "등록계정"]),
  },
  "Adobe Illustrator": {
    dataSourceId: process.env.ADOBE_ILLUSTRATOR_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "등록계정"]),
  },
  "Adobe Premiere Pro": {
    dataSourceId: process.env.ADOBE_PREMIERE_PRO_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "등록계정"]),
  },
  "Auto CAD": {
    dataSourceId: process.env.AUTOCAD_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "시리얼넘버", "Product Key"]),
  },
  "MAC Office": {
    dataSourceId: process.env.MAC_MS_OFFICE_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "시리얼넘버"]),
  },
  "MAC 한컴": {
    dataSourceId: process.env.MAC_HANCOM_OFFICE_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "라이선스키"]),
  },
  기타: {
    dataSourceId: process.env.ETC_LICENSE_DATA_SOURCE_ID,
    extractData: extractFields(["소프트웨어", "시리얼넘버"]),
  },
};

interface RequestBody {
  법인명: string;
  사용자명: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { 법인명, 사용자명 } = body;

    if (!법인명 || !사용자명) {
      return NextResponse.json(
        { message: "법인명과 사용자명은 필수입니다." },
        { status: 400 },
      );
    }

    const searchPromises = Object.entries(LICENSE_CONFIGS).map(
      async ([licenseType, config]) => {
        const response = await notionRequest<any>(
          `/data_sources/${config.dataSourceId}/query`,
          {
            method: "POST",
            body: {
              filter: {
                and: [
                  {
                    property: "법인명",
                    select: {
                      equals: 법인명,
                    },
                  },
                  {
                    property: "사용자명",
                    rich_text: {
                      equals: 사용자명,
                    },
                  },
                ],
              },
            },
          },
        );

        const extractedData = response.results.map((page: any) =>
          config.extractData(page),
        );

        return { licenseType, data: extractedData };
      },
    );

    const results = await Promise.all(searchPromises);

    const filteredResults = results.filter((result) => result.data.length > 0);

    return NextResponse.json(filteredResults);
  } catch (error: any) {
    return NextResponse.json(error.data || { message: error.message }, {
      status: (error.status as number) || 500,
    });
  }
}
