import { NextResponse } from "next/server";
import { notionRequest } from "@/shared/lib/notion";

export async function GET() {
  try {
    const notionResponse = await notionRequest<any>(
      `/data_sources/${process.env.STOCKTAKING_INFO_DATA_SOURCE_ID}/query`,
      {
        method: "POST",
        body: {
          page_size: 1,
        },
      },
    );

    if (notionResponse.results.length === 0) {
      return NextResponse.json(
        { message: "진행 중인 실사가 없습니다. IdsTrust 자산관리파트로 문의주세요." },
        { status: 404 },
      );
    }

    const page = notionResponse.results[0];

    const 시작날짜 = page.properties.날짜?.date?.start ?? null;
    const 끝날짜 = page.properties.날짜?.date?.end ?? null;

    if (!시작날짜 || !끝날짜) {
      return NextResponse.json(
        { message: "진행 중인 실사가 없습니다. IdsTrust 자산관리파트로 문의주세요." },
        { status: 404 },
      );
    }

    const today = new Date().toISOString().split("T")[0];
    if (today < 시작날짜 || today > 끝날짜) {
      return NextResponse.json(
        { message: "진행 중인 실사가 없습니다. IdsTrust 자산관리파트로 문의주세요." },
        { status: 404 },
      );
    }

    const response = {
      실사제목: page.properties.실사제목?.title?.[0]?.text?.content ?? "-",
      시작날짜,
      끝날짜,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(error.data || { message: error.message }, {
      status: (error.status as number) || 500,
    });
  }
}
