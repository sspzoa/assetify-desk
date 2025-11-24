// 자산 레코드 타입 정의
export type AssetRecord = {
  id: string; // 자산 고유 ID
  name: string | null; // 자산명
  assetNumber: string | null; // 자산 번호
  corporation: string | null; // 법인
  department: string | null; // 부서
  status: string | null; // 상태
};

// 자산 검색 응답 타입
export type AssetSearchResponse = {
  assets: AssetRecord[]; // 검색된 자산 목록
};
