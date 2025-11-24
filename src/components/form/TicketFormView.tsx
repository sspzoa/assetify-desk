"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AssetNumberSuggestInput } from "@/components/asset-number/AssetNumberSuggestInput";
import {
  FileUploadInput,
  FormField,
  RadioSelect,
  RichTextInput,
  SelectInput,
  TextInput,
} from "@/components/form/form-fields";
import {
  useAskFormOptions,
  useAskFormResult,
  useAskFormState,
  useRepairFormOptions,
  useRepairFormResult,
  useRepairFormState,
  useSubmitAskForm,
  useSubmitRepairForm,
} from "@/hooks/useTicketForm";
import { initialAskFormOptions, initialRepairFormOptions } from "@/store/form";
import type { AskFormOptions, RepairFormOptions } from "@/types/ticket";

// 문의 유형별 설명
const inquiryTypeDescriptions: Record<string, string> = {
  "PC/OA": "일반 하드웨어/소프트웨어 관련 문의",
  "인프라/보안시스템": "베어독/보안프로그램 관련 문의",
};

// 선택 옵션 타입
type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
};

// 선택 옵션 목록 생성 함수
const buildSelectOptions = (
  items: string[],
  placeholder?: string,
): SelectOption[] => {
  const options = items.map((name) => ({ label: name, value: name }));
  return placeholder
    ? [{ label: placeholder, value: "", disabled: true }, ...options]
    : options;
};

// 문의 폼 뷰 Props 타입
type AskFormViewProps = {
  initialOptions?: AskFormOptions;
  initialError?: string | null;
};

// 문의 폼 뷰 컴포넌트
export function AskFormView({
  initialOptions,
  initialError,
}: AskFormViewProps) {
  const router = useRouter();
  const [fileInputKey, setFileInputKey] = useState(0); // 파일 입력 초기화용 키
  const { formState, updateField } = useAskFormState();
  const { result } = useAskFormResult();
  const optionsQuery = useAskFormOptions(initialOptions);
  const submitMutation = useSubmitAskForm({
    onSuccess: (data) => {
      setFileInputKey((prev) => prev + 1); // 파일 입력 초기화
      router.push(`/ticket/ask/${data.id}`); // 상세 페이지로 이동
    },
  });

  const options = optionsQuery.data ?? initialAskFormOptions;
  const hasOptions = Boolean(optionsQuery.data);
  const optionsError = hasOptions
    ? null
    : optionsQuery.isError
      ? optionsQuery.error.message
      : (initialError ?? null);

  // 선택 옵션들 메모이제이션
  const corporationOptions = useMemo(
    () => buildSelectOptions(options.corporations, "선택해 주세요"),
    [options.corporations],
  );
  const inquiryOptions = useMemo(
    () =>
      options.inquiryTypes.map((name) => ({
        label: name,
        value: name,
        description: inquiryTypeDescriptions[name],
      })),
    [options.inquiryTypes],
  );
  const urgencyOptions = useMemo(
    () => buildSelectOptions(options.urgencies),
    [options.urgencies],
  );

  // 폼 제출 핸들러
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasOptions || submitMutation.isPending) return;
    submitMutation.mutate(formState);
  };

  return (
    <div className="flex flex-col items-center justify-start gap-spacing-700 px-spacing-700 py-spacing-900">
      <span className="font-semibold text-display">
        Ask Form<span className="text-core-accent">.</span>
      </span>

      {/* 옵션 로드 에러 메시지 */}
      {optionsError && (
        <span className="text-core-status-negative text-label">
          {optionsError} 다시 시도해주세요.
        </span>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-spacing-500"
      >
        {/* 법인 선택 */}
        <FormField title="법인" required>
          <SelectInput
            id="corporation"
            name="corporation"
            value={formState.corporation}
            onChange={(e) => updateField("corporation", e.target.value)}
            options={corporationOptions}
            required
            disabled={!hasOptions}
          />
        </FormField>

        {/* 부서 입력 */}
        <FormField title="부서">
          <TextInput
            id="department"
            name="department"
            placeholder="ex. 경영지원팀"
            value={formState.department}
            onChange={(e) => updateField("department", e.target.value)}
          />
        </FormField>

        {/* 문의자 성함 입력 */}
        <FormField title="문의자 성함" required>
          <TextInput
            id="requester"
            name="requester"
            placeholder="ex. 김자산"
            value={formState.requester}
            onChange={(e) => updateField("requester", e.target.value)}
            required
          />
        </FormField>

        {/* 자산 번호 입력 (자동 완성 지원) */}
        <FormField
          title="자산 번호"
          description="사용중인 기기에 붙어있는 자산 번호를 적어주세요."
        >
          <AssetNumberSuggestInput
            requesterName={formState.requester}
            value={formState.assetNumber}
            onChange={(v) => updateField("assetNumber", v)}
            inputId="assetNumber"
            inputName="assetNumber"
            placeholder="ex. 2309-N0001"
          />
        </FormField>

        {/* 문의 유형 선택 */}
        <FormField
          title="문의 유형"
          required
          description="필요하신 지원 유형을 골라주세요."
        >
          <RadioSelect
            name="request-type"
            value={formState.inquiryType}
            onChange={(v) => updateField("inquiryType", v)}
            required
            options={inquiryOptions}
            disabled={!hasOptions}
          />
        </FormField>

        {/* 문의 내용 입력 */}
        <FormField
          title="문의 내용"
          description="필요한 도움이나 요청 사항을 구체적으로 입력해 주세요."
          required
        >
          <RichTextInput
            id="detail"
            name="detail"
            placeholder="상세히 적어주실수록 더욱 빠른 처리가 가능합니다."
            value={formState.detail}
            onChange={(e) => updateField("detail", e.target.value)}
            required
          />
        </FormField>

        {/* 참고 자료 업로드 */}
        <FormField
          title="참고 자료"
          description="각종 첨부 파일을 올릴 수 있습니다."
        >
          <FileUploadInput
            key={fileInputKey}
            id="reference-file"
            accept=".pdf,image/*"
            hint="대외비 등 민감한 자료는 올리지 마세요."
            multiple
            onFilesSelected={(files) =>
              updateField(
                "attachments",
                files ? Array.from(files).map((f) => f.name) : [],
              )
            }
            selectedSummary={
              formState.attachments.length > 0
                ? `선택된 파일: ${formState.attachments.join(", ")}`
                : undefined
            }
          />
        </FormField>

        {/* 긴급도 선택 */}
        <FormField title="긴급도" required>
          <RadioSelect
            name="urgency"
            value={formState.urgency}
            onChange={(v) => updateField("urgency", v)}
            required
            options={urgencyOptions}
            disabled={!hasOptions}
          />
        </FormField>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={submitMutation.isPending || !hasOptions}
          className="w-full max-w-[768px] rounded-radius-700 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-heading text-solid-white transition duration-100 hover:opacity-75 active:scale-95 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitMutation.isPending ? "제출 중..." : "제출하기"}
        </button>

        {/* 제출 에러 메시지 */}
        {result?.error && (
          <span
            className="text-core-status-negative text-label"
            aria-live="polite"
          >
            {result.error}
          </span>
        )}
      </form>
    </div>
  );
}

// 수리 폼 뷰 Props 타입
type RepairFormViewProps = {
  initialOptions?: RepairFormOptions;
  initialError?: string | null;
};

// 수리 폼 뷰 컴포넌트
export function RepairFormView({
  initialOptions,
  initialError,
}: RepairFormViewProps) {
  const router = useRouter();
  const [fileInputKey, setFileInputKey] = useState(0); // 파일 입력 초기화용 키
  const { formState, updateField } = useRepairFormState();
  const { result } = useRepairFormResult();
  const optionsQuery = useRepairFormOptions(initialOptions);
  const submitMutation = useSubmitRepairForm({
    onSuccess: (data) => {
      setFileInputKey((prev) => prev + 1); // 파일 입력 초기화
      router.push(`/ticket/repair/${data.id}`); // 상세 페이지로 이동
    },
  });

  const options = optionsQuery.data ?? initialRepairFormOptions;
  const hasOptions = Boolean(optionsQuery.data);
  const optionsError = hasOptions
    ? null
    : optionsQuery.isError
      ? optionsQuery.error.message
      : (initialError ?? null);

  // 선택 옵션들 메모이제이션
  const corporationOptions = useMemo(
    () => buildSelectOptions(options.corporations, "선택해 주세요"),
    [options.corporations],
  );
  const issueOptions = useMemo(
    () => buildSelectOptions(options.issueTypes, "선택해 주세요"),
    [options.issueTypes],
  );
  const urgencyOptions = useMemo(
    () => buildSelectOptions(options.urgencies),
    [options.urgencies],
  );

  // 폼 제출 핸들러
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasOptions || submitMutation.isPending || !formState.consent) return;
    submitMutation.mutate(formState);
  };

  return (
    <div className="flex flex-col items-center justify-start gap-spacing-700 px-spacing-700 py-spacing-900">
      <span className="font-semibold text-display">
        Repair Form<span className="text-core-accent">.</span>
      </span>

      {/* 옵션 로드 에러 메시지 */}
      {optionsError && (
        <span className="text-core-status-warning text-label">
          {optionsError} 다시 시도해주세요.
        </span>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-spacing-500"
      >
        {/* 법인 선택 */}
        <FormField title="법인" required>
          <SelectInput
            id="repair-corporation"
            name="repair-corporation"
            value={formState.corporation}
            onChange={(e) => updateField("corporation", e.target.value)}
            options={corporationOptions}
            required
            disabled={!hasOptions}
          />
        </FormField>

        {/* 부서 입력 */}
        <FormField title="부서">
          <TextInput
            id="repair-department"
            name="repair-department"
            placeholder="ex. 경영지원팀"
            value={formState.department}
            onChange={(e) => updateField("department", e.target.value)}
          />
        </FormField>

        {/* 문의자 성함 입력 */}
        <FormField title="문의자 성함" required>
          <TextInput
            id="repair-requester"
            name="repair-requester"
            placeholder="ex. 김자산"
            value={formState.requester}
            onChange={(e) => updateField("requester", e.target.value)}
            required
          />
        </FormField>

        {/* 실제 근무 위치 입력 */}
        <FormField
          title="실제 근무 위치"
          description={`ex. 용인연구소 → 경기 용인시 처인구 포곡읍 두계로 72
      향남공장 → 경기 화성시 향남읍 제약공단4길 35-14
      본사/신관/S빌딩은 신관 3층 자산관리파트에서 직접 수리 요청 받고 있습니다.
      본사/신관/S빌딩 근무하시는 분들은 "본사"로 기재해 주시기 바랍니다.`}
        >
          <TextInput
            id="repair-location"
            name="repair-location"
            placeholder="ex. 경기 용인시 처인구 포곡읍 두계로 72"
            value={formState.location}
            onChange={(e) => updateField("location", e.target.value)}
          />
        </FormField>

        {/* 자산 번호 입력 (자동 완성 지원) */}
        <FormField
          title="자산 번호"
          description="사용중인 기기에 붙어있는 자산 번호를 적어주세요."
        >
          <AssetNumberSuggestInput
            requesterName={formState.requester}
            value={formState.assetNumber}
            onChange={(v) => updateField("assetNumber", v)}
            inputId="repair-asset-number"
            inputName="repair-asset-number"
            placeholder="ex. 2309-N0001"
          />
        </FormField>

        {/* 고장 내역 선택 */}
        <FormField
          title="고장 내역"
          description="해당하는 고장 유형을 선택해 주세요."
        >
          <SelectInput
            id="repair-issue-type"
            name="repair-issue-type"
            value={formState.issueType}
            onChange={(e) => updateField("issueType", e.target.value)}
            options={issueOptions}
            disabled={!hasOptions}
          />
        </FormField>

        {/* 고장 증상 입력 */}
        <FormField
          title="고장 증상"
          description="현재 고장 증상을 구체적으로 입력해 주세요."
          required
        >
          <RichTextInput
            id="repair-detail"
            name="repair-detail"
            placeholder="고장 원인과 현재 증상을 상세히 적어주셔야 원활한 수리가 가능합니다."
            value={formState.detail}
            onChange={(e) => updateField("detail", e.target.value)}
            required
          />
        </FormField>

        {/* 참고 자료 업로드 */}
        <FormField
          title="참고 자료"
          description="각종 첨부 파일을 올릴 수 있습니다."
        >
          <FileUploadInput
            key={fileInputKey}
            id="repair-reference-file"
            accept=".pdf,image/*"
            hint="대외비 등 민감한 자료는 올리지 마세요."
            multiple
            onFilesSelected={(files) =>
              updateField(
                "attachments",
                files ? Array.from(files).map((f) => f.name) : [],
              )
            }
            selectedSummary={
              formState.attachments.length > 0
                ? `선택된 파일: ${formState.attachments.join(", ")}`
                : undefined
            }
          />
        </FormField>

        {/* 긴급도 선택 */}
        <FormField title="긴급도" required>
          <RadioSelect
            name="repair-urgency"
            value={formState.urgency}
            onChange={(v) => updateField("urgency", v)}
            required
            options={urgencyOptions}
            disabled={!hasOptions}
          />
        </FormField>

        {/* 수리 진행 동의 체크박스 */}
        <FormField
          title="수리 진행 동의"
          description={`수리 진행 시 수리 비용이 청구되며
사용자 과실이 판단되지 않으면 법인에서 100%를 지불하며,
사용자 과실이 명확할 경우 사용자에게 수리비의 50%가 청구됩니다. (법인 50% 부담)`}
          required
        >
          <label className="flex items-center gap-spacing-200 text-body text-content-standard-primary">
            <input
              type="checkbox"
              className="h-spacing-400 w-spacing-400 cursor-pointer accent-core-accent"
              checked={formState.consent}
              onChange={(e) => updateField("consent", e.target.checked)}
              required
            />
            위 내용을 확인했고 수리 진행에 동의합니다.
          </label>
        </FormField>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={
            submitMutation.isPending || !hasOptions || !formState.consent
          }
          className="w-full max-w-[768px] rounded-radius-700 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-heading text-solid-white transition duration-100 hover:opacity-75 active:scale-95 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitMutation.isPending ? "제출 중..." : "제출하기"}
        </button>

        {/* 제출 에러 메시지 */}
        {result?.error && (
          <span
            className="text-core-status-negative text-label"
            aria-live="polite"
          >
            {result.error}
          </span>
        )}
      </form>
    </div>
  );
}
