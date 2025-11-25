import {
  extractOptions,
  fetchNotionDatabase,
  notionHeaders,
} from "@/utils/notion/helpers";

export { ensureOptionValue, isNonEmpty, notionHeaders, sanitizeText } from "@/utils/notion/helpers";

// 자산 데이터베이스 ID
export const ASSETS_DATABASE_ID = process.env.ASSETS_DATABASE_ID;

// 라이센스 찾기 선택 옵션 타입
export type FindLicenseSelectOptions = {
  corporations: string[]; // 법인 목록
};

// 자산 데이터베이스 정보 조회
export async function fetchAssetsDatabase() {
  if (!ASSETS_DATABASE_ID) {
    throw new Error("ASSETS_DATABASE_ID is not configured");
  }
  return fetchNotionDatabase(ASSETS_DATABASE_ID);
}

// 라이센스 찾기 폼 선택 옵션 로드
export async function loadFindLicenseSelectOptions(): Promise<FindLicenseSelectOptions> {
  const database = await fetchAssetsDatabase();
  const properties = database.properties ?? {};
  return {
    corporations: extractOptions(properties.법인명),
  };
}
