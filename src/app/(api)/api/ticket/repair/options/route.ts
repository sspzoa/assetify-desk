/**
 * 수리 요청 선택 옵션 API
 * 수리 요청 등록 시 필요한 선택 항목(법인, 고장 내역, 긴급도 등)을 조회하는 엔드포인트
 */

import { NextResponse } from "next/server";

import { loadRepairSelectOptions } from "@/utils/notion/repair";

/**
 * GET /api/ticket/repair/options
 * 수리 요청 등록에 필요한 선택 옵션 조회
 * @returns 법인, 고장 내역, 긴급도 등의 선택 옵션
 */
export async function GET() {
  try {
    const options = await loadRepairSelectOptions();
    return NextResponse.json(options);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "선택지를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
