import { useQuery } from "@tanstack/react-query";

import {
  ASSET_NUMBER_SEARCH_MIN_LENGTH,
  ASSET_SEARCH_MIN_LENGTH,
} from "@/constants";
import type { AssetSearchResponse } from "@/types/asset";

// 자산 검색 쿼리 키
const ASSET_SEARCH_QUERY_KEY = "asset-search";

// 자산 검색 모드 타입 (이름 또는 자산번호로 검색)
type AssetSearchMode =
  | { type: "name"; value: string }
  | { type: "assetNumber"; value: string };

// 검색 모드에 따라 자산 검색 API 호출
const fetchAssetsByMode = async (
  mode: AssetSearchMode,
): Promise<AssetSearchResponse> => {
  const params = new URLSearchParams();
  if (mode.type === "name") {
    params.set("name", mode.value);
  } else {
    params.set("assetNumber", mode.value);
  }

  const response = await fetch(`/api/assets?${params.toString()}`, {
    cache: "no-store",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? "자산 정보를 불러오지 못했습니다.");
  }

  return data as AssetSearchResponse;
};

// 자산 검색 훅 파라미터 타입
type UseAssetSearchParams = {
  requesterName: string; // 요청자 이름
  assetNumber: string; // 자산 번호
};

// 자산 검색 훅
export function useAssetSearch({
  requesterName,
  assetNumber,
}: UseAssetSearchParams) {
  const normalizedName = requesterName.trim();
  const normalizedAssetNumber = assetNumber.trim();

  // 검색 모드 결정 (자산번호 우선, 그 다음 이름)
  const searchMode: AssetSearchMode | null =
    normalizedAssetNumber.length >= ASSET_NUMBER_SEARCH_MIN_LENGTH
      ? { type: "assetNumber", value: normalizedAssetNumber }
      : normalizedName.length >= ASSET_SEARCH_MIN_LENGTH
        ? { type: "name", value: normalizedName }
        : null;

  const queryResult = useQuery<AssetSearchResponse, Error>({
    queryKey: searchMode
      ? [ASSET_SEARCH_QUERY_KEY, searchMode.type, searchMode.value]
      : [ASSET_SEARCH_QUERY_KEY, "idle"],
    queryFn: () => {
      // 검색 모드가 없으면 빈 결과 반환
      if (!searchMode) {
        return Promise.resolve({ assets: [] });
      }
      return fetchAssetsByMode(searchMode);
    },
    enabled: Boolean(searchMode), // 검색 조건이 있을 때만 실행
    staleTime: 1000 * 60, // 1분간 캐시 유지
  });

  return { ...queryResult, searchMode };
}
