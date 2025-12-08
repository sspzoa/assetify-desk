import { NextResponse } from "next/server";
import { notionRequest } from "@/shared/lib/notion";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const 법인명 = formData.get("법인명") as string;
    const 부서 = formData.get("부서") as string;
    const 사용자 = formData.get("사용자") as string;
    const 자산번호 = formData.get("자산번호") as string;

    const body = {
      parent: {
        data_source_id: process.env.STOCKTAKING_DATA_SOURCE_ID,
      },
      properties: {
        법인명: { select: { name: 법인명 || "" } },
        부서: { rich_text: [{ text: { content: 부서 || "" } }] },
        사용자: { title: [{ text: { content: 사용자 || "" } }] },
        자산번호: { rich_text: [{ text: { content: 자산번호 || "" } }] },
      },
    };

    const notionResponse = await notionRequest<any>("/pages", {
      method: "POST",
      body,
    });

    const response = {
      recordId: notionResponse.id,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(error.data || { message: error.message }, {
      status: (error.status as number) || 500,
    });
  }
}
