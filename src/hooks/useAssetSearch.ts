import { useQuery } from "@tanstack/react-query";

import { ASSET_SEARCH_MIN_LENGTH } from "@/constants/assets";
import type { AssetSearchResponse } from "@/types/asset";

const ASSET_SEARCH_QUERY_KEY = "asset-search";

const fetchAssetsByName = async (
  name: string,
): Promise<AssetSearchResponse> => {
  const response = await fetch(
    `/api/assets?${new URLSearchParams({ name }).toString()}`,
    { cache: "no-store" },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? "자산 정보를 불러오지 못했습니다.");
  }

  return data as AssetSearchResponse;
};

export function useAssetSearch(name: string) {
  const normalizedName = name.trim();
  return useQuery<AssetSearchResponse, Error>({
    queryKey: [ASSET_SEARCH_QUERY_KEY, normalizedName],
    queryFn: () => fetchAssetsByName(normalizedName),
    enabled: normalizedName.length >= ASSET_SEARCH_MIN_LENGTH,
    staleTime: 1000 * 60,
  });
}
