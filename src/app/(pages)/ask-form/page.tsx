"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  FileUploadInput,
  FormField,
  RadioSelect,
  RichTextInput,
  SelectInput,
  TextInput,
} from "@/components/ask-form/form-fields";
import {
  useAskFormOptions,
  useAskFormResult,
  useAskFormState,
  useSubmitAskForm,
} from "@/hooks/useAskForm";
import { initialAskFormOptions } from "@/store/askForm";

const inquiryTypeDescriptions: Record<string, string> = {
  "PC/OA": "일반 하드웨어/ 소프트웨어 관련 문의",
  "인프라/보안시스템": "베어독/보안프로그램 관련 문의",
};

export default function AskForm() {
  const router = useRouter();
  const [fileInputKey, setFileInputKey] = useState(0);
  const { formState, updateField } = useAskFormState();
  const { result } = useAskFormResult();
  const optionsQuery = useAskFormOptions();
  const submitMutation = useSubmitAskForm({
    onSuccess: (data) => {
      setFileInputKey((prev) => prev + 1);
      router.push(`/ticket/ask/${data.id}`);
    },
  });

  const options = optionsQuery.data ?? initialAskFormOptions;
  const optionsError = optionsQuery.isError ? optionsQuery.error.message : null;
  const isOptionsReady = optionsQuery.status === "success";

  const corporationOptions = [
    { label: "선택해주세요", value: "", disabled: true },
    ...options.corporations.map((name) => ({ label: name, value: name })),
  ];

  const inquiryOptions = options.inquiryTypes.map((name) => ({
    label: name,
    value: name,
    description: inquiryTypeDescriptions[name],
  }));

  const urgencyOptions = options.urgencies.map((name) => ({
    label: name,
    value: name,
  }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isOptionsReady || submitMutation.isPending) return;
    submitMutation.mutate(formState);
  };

  const isSubmitDisabled = submitMutation.isPending || !isOptionsReady;

  return (
    <div className="flex flex-col items-center justify-start gap-spacing-700 px-spacing-700 py-spacing-900">
      <span className="font-semibold text-display">
        Ask Form<span className="text-core-accent">.</span>
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
        <FormField
          title="법인"
          description="현재 소속되어계신 법인을 입력해주세요."
          required
        >
          <SelectInput
            id="corporation"
            name="corporation"
            value={formState.corporation}
            onChange={(event) => updateField("corporation", event.target.value)}
            options={corporationOptions}
            required
            disabled={!isOptionsReady}
          />
        </FormField>

        <FormField
          title="부서"
          description="현재 소속되어계신 부서를 입력해주세요."
        >
          <TextInput
            id="department"
            name="department"
            placeholder="ex. 경영지원팀"
            value={formState.department}
            onChange={(event) => updateField("department", event.target.value)}
          />
        </FormField>

        <FormField
          title="문의자 성함"
          description="응대를 도와드릴 담당자 성함을 입력해주세요."
          required
        >
          <TextInput
            id="requester"
            name="requester"
            placeholder="ex. 김자산"
            value={formState.requester}
            onChange={(event) => updateField("requester", event.target.value)}
            required
          />
        </FormField>

        <FormField
          title="자산번호"
          description="사용중인 기기에 붙어있는 자산번호를 적어주세요."
        >
          <TextInput
            id="assetNumber"
            name="assetNumber"
            placeholder="ex. 2309-N0001"
            value={formState.assetNumber}
            onChange={(event) => updateField("assetNumber", event.target.value)}
          />
        </FormField>

        <FormField
          title="문의 유형"
          required
          description="필요하신 지원 유형을 골라주세요."
        >
          {inquiryOptions.length > 0 ? (
            <RadioSelect
              name="request-type"
              value={formState.inquiryType}
              onChange={(nextValue) => updateField("inquiryType", nextValue)}
              required
              options={inquiryOptions}
              disabled={!isOptionsReady}
            />
          ) : (
            <span className="text-content-standard-tertiary text-label">
              정보를 불러오고 있어요.
            </span>
          )}
        </FormField>

        <FormField
          title="문의 내용"
          description="필요한 도움이나 요청 사항을 구체적으로 입력해주세요."
          required
        >
          <RichTextInput
            id="detail"
            name="detail"
            placeholder="상세히 적어주실수록 더욱 빠른 처리가 가능합니다."
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
            id="reference-file"
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

        <FormField title="급하신가요?" required>
          {urgencyOptions.length > 0 ? (
            <RadioSelect
              name="urgency"
              value={formState.urgency}
              onChange={(nextValue) => updateField("urgency", nextValue)}
              required
              options={urgencyOptions}
              disabled={!isOptionsReady}
            />
          ) : (
            <span className="text-content-standard-tertiary text-label">
              정보를 불러오고 있어요.
            </span>
          )}
        </FormField>

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full max-w-[768px] rounded-radius-700 bg-core-accent px-spacing-500 py-spacing-300 font-semibold text-heading text-solid-white transition duration-100 hover:opacity-75 active:scale-95 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitMutation.isPending ? "제출 중..." : "제출하기"}
        </button>

        {result?.id ? (
          <span
            className="text-core-status-positive text-label"
            aria-live="polite"
          >
            요청이 등록되었습니다. ID: {result.id}
          </span>
        ) : null}
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
