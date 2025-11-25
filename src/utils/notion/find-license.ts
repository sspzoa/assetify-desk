export {
  ensureOptionValue,
  isNonEmpty,
  notionHeaders,
  sanitizeText,
} from "@/utils/notion/helpers";

// 라이센스 찾기 선택 옵션 타입
export type FindLicenseSelectOptions = {
  corporations: string[]; // 법인 목록
};

// 라이센스 찾기 폼 선택 옵션 로드
export async function loadFindLicenseSelectOptions(): Promise<FindLicenseSelectOptions> {
  // 자산 API에서 법인 목록 가져오기
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/assets/corporations`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("법인 목록을 불러오지 못했습니다");
  }

  const data = await response.json();
  return {
    corporations: data.corporations ?? [],
  };
}
