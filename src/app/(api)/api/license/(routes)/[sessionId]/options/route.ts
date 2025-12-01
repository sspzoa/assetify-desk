import { NextResponse } from "next/server";
import { notionRequest } from "@/shared/lib/notion";
import { checkSession } from "@/shared/lib/validateSession";

export async function GET(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;

    const sessionError = await checkSession(sessionId);
    if (sessionError) {
      return sessionError;
    }

    const notionResponse = await notionRequest<any>(`/data_sources/${process.env.ASSETS_DATA_SOURCE_ID}`);

    const response = {
      법인명: (notionResponse.properties.법인명.select?.options || []).map((option: { name: string }) => option.name),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(error.data || { message: error.message }, {
      status: (error.status as number) || 500,
    });
  }
}
