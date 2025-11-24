import { useQuery } from "@tanstack/react-query";

import {
  ASSET_NUMBER_SEARCH_MIN_LENGTH,
  ASSET_SEARCH_MIN_LENGTH,
} from "@/constants";
import type { AssetSearchResponse } from "@/types/asset";

const ASSET_SEARCH_QUERY_KEY = "asset-search";

type AssetSearchMode =
  | { type: "name"; value: string }
  | { type: "assetNumber"; value: string };

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

type UseAssetSearchParams = {
  requesterName: string;
  assetNumber: string;
};

export function useAssetSearch({
  requesterName,
  assetNumber,
}: UseAssetSearchParams) {
  const normalizedName = requesterName.trim();
  const normalizedAssetNumber = assetNumber.trim();

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
      if (!searchMode) {
        return Promise.resolve({ assets: [] });
      }
      return fetchAssetsByMode(searchMode);
    },
    enabled: Boolean(searchMode),
    staleTime: 1000 * 60,
  });

  return { ...queryResult, searchMode };
}
