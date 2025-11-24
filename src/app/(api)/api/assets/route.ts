import { NextResponse } from "next/server";

import {
  ASSET_NUMBER_SEARCH_MIN_LENGTH,
  ASSET_SEARCH_MIN_LENGTH,
} from "@/constants";
import type { AssetRecord } from "@/types/asset";
import {
  getPlainText,
  getSelectName,
  maskName,
  notionHeaders,
} from "@/utils/notion/helpers";
import type { NotionPropertyValue } from "@/utils/notion/types";

const ASSETS_DATABASE_ID = process.env.ASSETS_DATABASE_ID;

const PROPERTY_NAMES = {
  user: "사용자",
  assetNumber: "자산번호",
  corporation: "법인명",
  department: "부서",
  usageStatus: "사용/재고/폐기/기타",
};

export async function GET(request: Request) {
  if (!ASSETS_DATABASE_ID) {
    return NextResponse.json(
      { error: "ASSETS_DATABASE_ID is not configured." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const nameQuery = searchParams.get("name")?.trim() ?? "";
  const assetNumberQuery = searchParams.get("assetNumber")?.trim() ?? "";

  const hasNameQuery = nameQuery.length >= ASSET_SEARCH_MIN_LENGTH;
  const hasAssetNumberQuery =
    assetNumberQuery.length >= ASSET_NUMBER_SEARCH_MIN_LENGTH;

  if (!hasNameQuery && !hasAssetNumberQuery) {
    return NextResponse.json({ assets: [] });
  }

  try {
    const notionResponse = await fetch(
      `https://api.notion.com/v1/databases/${ASSETS_DATABASE_ID}/query`,
      {
        method: "POST",
        cache: "no-store",
        headers: notionHeaders,
        body: JSON.stringify({
          page_size: 10,
          filter: hasAssetNumberQuery
            ? {
                property: PROPERTY_NAMES.assetNumber,
                rich_text: { contains: assetNumberQuery },
              }
            : {
                property: PROPERTY_NAMES.user,
                title: { equals: nameQuery },
              },
        }),
      },
    );

    const notionData = await notionResponse.json();

    if (!notionResponse.ok) {
      const message =
        typeof notionData?.message === "string"
          ? notionData.message
          : "자산 정보를 불러오지 못했습니다.";
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const assets: AssetRecord[] = (notionData.results ?? [])
      .map(
        (page: {
          id: string;
          properties?: Record<string, NotionPropertyValue>;
        }) => {
          const properties = page.properties ?? {};
          return {
            id: page.id,
            name: maskName(
              getPlainText(properties[PROPERTY_NAMES.user]) ?? null,
            ),
            assetNumber:
              getPlainText(properties[PROPERTY_NAMES.assetNumber]) ?? null,
            corporation:
              getSelectName(properties[PROPERTY_NAMES.corporation]) ?? null,
            department:
              getPlainText(properties[PROPERTY_NAMES.department]) ?? null,
            status:
              getSelectName(properties[PROPERTY_NAMES.usageStatus]) ?? null,
          };
        },
      )
      .filter((asset: { assetNumber: string }) => asset.assetNumber);

    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "자산 정보를 불러오지 못했습니다.",
      },
      { status: 500 },
    );
  }
}
