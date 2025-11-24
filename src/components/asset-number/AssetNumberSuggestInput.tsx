"use client";

import { useState } from "react";

import { TextInput } from "@/components/form/form-fields";
import { useAssetSearch } from "@/hooks/useAssetSearch";

// 자산 번호 자동 완성 입력 Props 타입
type AssetNumberSuggestInputProps = {
  requesterName: string; // 요청자 이름
  value: string; // 현재 입력값
  onChange: (next: string) => void; // 값 변경 핸들러
  inputId: string;
  inputName: string;
  placeholder?: string;
};

// 도우미 텍스트 스타일
const helperClassName =
  "rounded-radius-500 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-label text-content-standard-secondary";

// 자산 버튼 스타일
const buttonClassName =
  "flex flex-col gap-spacing-50 rounded-radius-400 border px-spacing-400 py-spacing-300 text-left transition";

// 클래스명 결합 유틸리티
const cn = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

// 자산 번호 자동 완성 입력 컴포넌트
export function AssetNumberSuggestInput({
  requesterName,
  value,
  onChange,
  inputId,
  inputName,
  placeholder,
}: AssetNumberSuggestInputProps) {
  // 자산 번호로 검색 억제 여부 (제안 선택 시 중복 검색 방지)
  const [suppressAssetNumberSearch, setSuppressAssetNumberSearch] =
    useState(false);

  // 자산 검색 훅
  const searchQuery = useAssetSearch({
    requesterName,
    assetNumber: suppressAssetNumberSearch ? "" : value,
  });
  const currentSearchModeType = searchQuery.searchMode?.type;

  // 값 변경 핸들러
  const handleValueChange = (
    nextValue: string,
    source: "input" | "suggestion",
  ) => {
    // 이름으로 검색 중 제안 선택 시 자산 번호 검색 억제
    const shouldSuppress =
      source === "suggestion" && currentSearchModeType === "name";
    setSuppressAssetNumberSearch(shouldSuppress);
    onChange(nextValue);
  };

  const assets = searchQuery.data?.assets ?? [];
  const hasSearchableInput = Boolean(searchQuery.searchMode);
  // 검색 컨텍스트 라벨
  const searchContextLabel =
    searchQuery.searchMode?.type === "name"
      ? "입력하신 이름"
      : searchQuery.searchMode?.type === "assetNumber"
        ? "입력하신 자산 번호"
        : null;

  return (
    <div className="flex flex-col gap-spacing-200">
      {/* 자산 번호 입력 필드 */}
      <TextInput
        id={inputId}
        name={inputName}
        placeholder={placeholder}
        value={value}
        onChange={(event) => handleValueChange(event.target.value, "input")}
      />

      {/* 검색 결과 영역 */}
      {!hasSearchableInput ? null : searchQuery.isFetching ? (
        // 로딩 상태
        <div className={helperClassName}>자산 번호를 불러오는 중입니다...</div>
      ) : searchQuery.isError ? (
        // 에러 상태
        <div className={cn(helperClassName, "text-core-status-negative")}>
          {searchQuery.error.message}
        </div>
      ) : assets.length === 0 ? (
        // 결과 없음
        <div className={helperClassName}>
          {searchContextLabel ?? "입력값"}로 등록된 자산을 찾지 못했습니다.
        </div>
      ) : (
        // 검색 결과 목록
        <div className="flex flex-col gap-spacing-200">
          <span className="text-content-standard-tertiary text-label">
            {searchContextLabel
              ? `${searchContextLabel}으로 검색된 자산 번호입니다.`
              : "검색된 자산 번호를 클릭하면 자동으로 입력됩니다."}
          </span>
          <div className="flex flex-col gap-spacing-200">
            {assets.map((asset) => {
              const assetNumber = asset.assetNumber ?? "";
              const isSelected = assetNumber === value;
              // 보조 정보 (이름 / 부서 / 법인)
              const secondary = [
                asset.name,
                asset.department,
                asset.corporation,
              ]
                .filter(Boolean)
                .join(" / ");
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => handleValueChange(assetNumber, "suggestion")}
                  className={cn(
                    buttonClassName,
                    isSelected
                      ? "border-core-accent bg-components-fill-standard-primary text-content-standard-primary"
                      : "border-line-outline bg-components-fill-standard-secondary text-content-standard-primary hover:border-core-accent",
                  )}
                >
                  <span className="font-semibold text-body">
                    {assetNumber || "자산번호 없음"}
                  </span>
                  {secondary ? (
                    <span className="text-content-standard-tertiary text-label">
                      {secondary}
                    </span>
                  ) : null}
                  {asset.status ? (
                    <span className="text-content-standard-secondary text-label">
                      상태: {asset.status}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
