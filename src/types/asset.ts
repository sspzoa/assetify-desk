export type AssetRecord = {
  id: string;
  name: string | null;
  assetNumber: string | null;
  corporation: string | null;
  department: string | null;
  status: string | null;
};

export type AssetSearchResponse = {
  assets: AssetRecord[];
};
