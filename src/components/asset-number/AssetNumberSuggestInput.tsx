"use client";

import { TextInput } from "@/components/form/form-fields";
import { ASSET_SEARCH_MIN_LENGTH } from "@/constants/assets";
import { useAssetSearch } from "@/hooks/useAssetSearch";

type AssetNumberSuggestInputProps = {
  requesterName: string;
  value: string;
  onChange: (next: string) => void;
  inputId: string;
  inputName: string;
  placeholder?: string;
};

const helperClassName =
  "rounded-radius-500 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300 text-label text-content-standard-secondary";

const buttonClassName =
  "flex flex-col gap-spacing-50 rounded-radius-400 border px-spacing-400 py-spacing-300 text-left transition";

const cn = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");

export function AssetNumberSuggestInput({
  requesterName,
  value,
  onChange,
  inputId,
  inputName,
  placeholder,
}: AssetNumberSuggestInputProps) {
  const normalizedRequester = requesterName.trim();
  const searchQuery = useAssetSearch(normalizedRequester);
  const assets = searchQuery.data?.assets ?? [];
  const hasQuery = normalizedRequester.length >= ASSET_SEARCH_MIN_LENGTH;

  return (
    <div className="flex flex-col gap-spacing-200">
      <TextInput
        id={inputId}
        name={inputName}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      {!hasQuery ? null : searchQuery.isFetching ? (
        <div className={helperClassName}>자산 번호를 불러오는 중입니다...</div>
      ) : searchQuery.isError ? (
        <div className={cn(helperClassName, "text-core-status-negative")}>
          {searchQuery.error.message}
        </div>
      ) : assets.length === 0 ? (
        <div className={helperClassName}>자산 번호를 직접 입력해 주세요.</div>
      ) : (
        <div className="flex flex-col gap-spacing-200">
          <span className="text-content-standard-tertiary text-label">
            검색된 자산 번호를 클릭하면 자동으로 입력됩니다.
          </span>
          <div className="flex flex-col gap-spacing-200">
            {assets.map((asset) => {
              const assetNumber = asset.assetNumber ?? "";
              const isSelected = assetNumber === value;
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
                  onClick={() => onChange(assetNumber)}
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
