import { NextResponse } from "next/server";
import type { NextRequest } from "next/server.js";
import { notionRequest } from "@/shared/lib/notion";
import formatDateTime from "@/shared/utils/formatDateTime";

type RouteContext = {
  params: Promise<{ ticketId: string }>;
};

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { ticketId } = await context.params;

    const notionResponse = await notionRequest<any>(`/pages/${ticketId}`, {
      method: "GET",
    });

    const response = {
      법인: notionResponse.properties.법인.select?.name ?? "-",
      부서: notionResponse.properties.부서.rich_text?.[0]?.text?.content ?? "-",
      문의자: notionResponse.properties.문의자.rich_text?.[0]?.text?.content ?? "-",
      실제근무위치: notionResponse.properties["실제 근무 위치"].rich_text?.[0]?.text?.content ?? "-",
      자산번호: notionResponse.properties.자산번호.rich_text?.[0]?.text?.content ?? "-",
      고장내역: notionResponse.properties["고장 내역"].multi_select[0]?.name ?? "-",
      고장증상: notionResponse.properties.고장증상.title?.[0]?.text?.content ?? "-",
      긴급도: notionResponse.properties.긴급도.select?.name ?? "-",
      수리진행동의서: notionResponse.properties["수리 진행 동의서"].checkbox ?? false,

      상태: notionResponse.properties.상태.status?.name ?? "-",
      조치내용: notionResponse.properties.조치내용.rich_text?.[0]?.text?.content ?? "-",
      담당자: notionResponse.properties.담당자.people?.[0]?.name ?? "-",
      과실여부: notionResponse.properties.과실여부.select?.name ?? "-",
      수리일정: notionResponse.properties["수리 일정"].date?.start ?? "-",
      단가: notionResponse.properties.단가.number?.toString() ?? "-",
      수리진행상황: notionResponse.properties.수리진행상황.status?.name ?? "-",

      createdAt: formatDateTime(notionResponse.created_time) ?? "-",
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(error.data || { message: error.message }, {
      status: (error.status as number) || 500,
    });
  }
}
