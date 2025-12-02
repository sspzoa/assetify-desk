import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { notionRequest } from "@/shared/lib/notion";

type RequestBody = {
  assetId: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { assetId } = body;

    const notionResponse = await notionRequest<any>(`/data_source/${process.env.ASSETS_DATA_SOURCE_ID}/query`, {
      method: "POST",
      body: {
        filter: {
          property: "자산번호",
          select: {
            equals: assetId,
          },
        },
      },
    });

    const response = { notionResponse };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(error.data || { message: error.message }, {
      status: (error.status as number) || 500,
    });
  }
}
