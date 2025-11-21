"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  FileUploadInput,
  FormField,
  RadioSelect,
  RichTextInput,
  SelectInput,
  TextInput,
} from "@/components/form/form-fields";
import {
  useRepairFormOptions,
  useRepairFormResult,
  useRepairFormState,
  useSubmitRepairForm,
} from "@/hooks/useRepairForm";
import {
  initialRepairFormOptions,
  type RepairFormOptions,
} from "@/store/repairForm";

type RepairFormViewProps = {
  initialOptions?: RepairFormOptions;
  initialError?: string | null;
};

export default function RepairFormView({
  initialOptions,
  initialError,
}: RepairFormViewProps) {
  const router = useRouter();
  const [fileInputKey, setFileInputKey] = useState(0);
  const { formState, updateField } = useRepairFormState();
  const { result } = useRepairFormResult();
  const optionsQuery = useRepairFormOptions(initialOptions);
  const submitMutation = useSubmitRepairForm({
    onSuccess: (data) => {
      setFileInputKey((prev) => prev + 1);
      router.push(`/ticket/repair/${data.id}`);
    },
  });

  const hasOptions = Boolean(optionsQuery.data);
  const options = optionsQuery.data ?? initialRepairFormOptions;
  const optionsError = hasOptions
    ? null
    : optionsQuery.isError
      ? optionsQuery.error.message
      : (initialError ?? null);
  const isOptionsReady = hasOptions;

  const corporationOptions = useMemo(
    () => [
      { label: "선택해주세요", value: "", disabled: true },
      ...options.corporations.map((name) => ({ label: name, value: name })),
    ],
    [options.corporations],
  );

  const issueOptions = useMemo(
    () => [
      { label: "선택해주세요", value: "", disabled: true },
      ...options.issueTypes.map((name) => ({ label: name, value: name })),
    ],
    [options.issueTypes],
  );

  const urgencyOptions = useMemo(
    () =>
      options.urgencies.map((name) => ({
        label: name,
        value: name,
      })),
    [options.urgencies],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isOptionsReady || submitMutation.isPending || !formState.consent) {
      return;
    }
    submitMutation.mutate(formState);
  };

  const isSubmitDisabled =
    submitMutation.isPending || !isOptionsReady || !formState.consent;

  return (
    <div className="flex flex-col items-center justify-start gap-spacing-700 px-spacing-700 py-spacing-900">
      <span className="font-semibold text-display">
        Repair Form<span className="text-core-accent">.</span>
      </span>

      {optionsError ? (
        <span className="text-core-status-warning text-label">
          {optionsError} 다시 시도해주세요.
        </span>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-spacing-500"
      >
        <FormField title="법인" required>
          <SelectInput
            id="repair-corporation"
            name="repair-corporation"
            value={formState.corporation}
            onChange={(event) => updateField("corporation", event.target.value)}
            options={corporationOptions}
            required
            disabled={!isOptionsReady}
          />
        </FormField>

        <FormField title="부서">
          <TextInput
            id="repair-department"
            name="repair-department"
            placeholder="ex. 경영지원팀"
            value={formState.department}
            onChange={(event) => updateField("department", event.target.value)}
          />
        </FormField>

        <FormField title="문의자 성함" required>
          <TextInput
            id="repair-requester"
            name="repair-requester"
            placeholder="ex. 김자산"
            value={formState.requester}
            onChange={(event) => updateField("requester", event.target.value)}
            required
          />
        </FormField>

        <FormField
          title="실제 근무 위치"
          description="ex. 용인연구소 → 경기 용인시 처인구 포곡읍 두계로 72
      향남공장 → 경기 화성시 향남읍 제약공단4길 35-14
      본사/신관/S빌딩은 신관 3층 자산관리파트에서 직접 수리요청 받고있습니다.
      본사/신관/S빌딩 근무하시는 분들은 “본사”로 기입해주시기바랍니다."
        >
          <TextInput
            id="repair-location"
            name="repair-location"
            placeholder="ex. 경기 용인시 처인구 포곡읍 두계로 72"
            value={formState.location}
            onChange={(event) => updateField("location", event.target.value)}
          />
        </FormField>

        <FormField
          title="자산번호"
          description="사용중인 기기에 붙어있는 자산번호를 적어주세요."
        >
          <TextInput
            id="repair-asset-number"
            name="repair-asset-number"
            placeholder="ex. 2309-N0001"
            value={formState.assetNumber}
            onChange={(event) => updateField("assetNumber", event.target.value)}
          />
        </FormField>

        <FormField
          title="고장 내역"
          description="해당되는 고장 유형을 선택해주세요."
        >
          <SelectInput
            id="repair-issue-type"
            name="repair-issue-type"
            value={formState.issueType}
            onChange={(event) => updateField("issueType", event.target.value)}
            options={issueOptions}
            disabled={!isOptionsReady}
          />
        </FormField>

        <FormField
          title="고장 증상"
          description="현재 고장 증상을 구체적으로 입력해주세요."
          required
        >
          <RichTextInput
            id="repair-detail"
            name="repair-detail"
            placeholder="고장 원인과 현재 증상을 상세히 적어주셔야 원활한 수리가 가능합니다."
            value={formState.detail}
            onChange={(event) => updateField("detail", event.target.value)}
            required
          />
        </FormField>

        <FormField
          title="참고 자료"
          description="각종 첨부 파일을 업로드 하실 수 있습니다."
        >
          <FileUploadInput
            key={fileInputKey}
            id="repair-reference-file"
            accept=".pdf,image/*"
            hint="대외비 등 민감한 자료는 업로드하지 마세요."
            multiple
            onFilesSelected={(files) =>
              updateField(
                "attachments",
                files ? Array.from(files).map((file) => file.name) : [],
              )
            }
            selectedSummary={
              formState.attachments.length > 0
                ? `선택된 파일: ${formState.attachments.join(", ")}`
                : undefined
            }
          />
        </FormField>

        <FormField title="긴급도" required>
          <RadioSelect
            name="repair-urgency"
            value={formState.urgency}
            onChange={(nextValue) => updateField("urgency", nextValue)}
            required
            options={urgencyOptions}
            disabled={!isOptionsReady}
          />
        </FormField>

        <FormField
          title="수리 진행 동의"
          description="수리 진행시 수리 비용이 청구되며
사용자 과실이 판단되지 않을경우 법인에서 100%를 지불하며,
사용자 과실이 명확 할 경우 사용자에게 수리비의 50%가 청구됩니다.(법인 50% 부담)"
          required
        >
          <label className="flex items-center gap-spacing-200 text-body text-content-standard-primary">
            <input
              type="checkbox"
              className="h-spacing-400 w-spacing-400 cursor-pointer accent-core-accent"
              checked={formState.consent}
              onChange={(event) => updateField("consent", event.target.checked)}
              required
            />
            위 내용을 확인했고 수리 진행에 동의합니다.
          </label>
        </FormField>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full max-w-[768px] rounded-radius-700 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-heading text-solid-white transition duration-100 hover:opacity-75 active:scale-95 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitMutation.isPending ? "제출 중..." : "제출하기"}
        </button>

        {result?.error ? (
          <span
            className="text-core-status-negative text-label"
            aria-live="polite"
          >
            {result.error}
          </span>
        ) : null}
      </form>
    </div>
  );
}
