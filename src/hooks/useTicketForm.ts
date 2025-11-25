"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { PrimitiveAtom } from "jotai";
import { useAtom, useSetAtom } from "jotai";

import {
  findLicenseFormResultAtom,
  findLicenseFormStateAtom,
  initialFindLicenseFormState,
  initialInquiryFormState,
  initialRepairFormState,
  inquiryFormResultAtom,
  inquiryFormStateAtom,
  repairFormResultAtom,
  repairFormStateAtom,
} from "@/store/form";
import type {
  FindLicenseFormOptions,
  FindLicenseFormState,
  FormResult,
  InquiryFormOptions,
  InquiryFormState,
  RepairFormOptions,
  RepairFormState,
} from "@/types/ticket";
import type { ParsedLicenseResult } from "@/utils/notion/license-parser";

// 문의 폼 옵션 조회 API 호출
const fetchInquiryOptions = async (): Promise<InquiryFormOptions> => {
  const response = await fetch("/api/ticket/inquiry/options", {
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.error ?? "선택지를 불러오지 못했습니다.");
  return {
    corporations: data.corporations ?? [],
    inquiryTypes: data.inquiryTypes ?? [],
    urgencies: data.urgencies ?? [],
  };
};

// 문의 티켓 제출 API 호출
const submitInquiryTicket = async (payload: InquiryFormState) => {
  const response = await fetch("/api/ticket/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? "문의 등록에 실패했습니다.");
  return data as { id: string };
};

// 문의 폼 옵션 조회 훅
export function useInquiryFormOptions(initialData?: InquiryFormOptions) {
  return useQuery<InquiryFormOptions, Error>({
    queryKey: ["inquiry-form-options"],
    queryFn: fetchInquiryOptions,
    initialData,
  });
}

// 문의 폼 상태 관리 훅
export function useInquiryFormState() {
  return useFormState(inquiryFormStateAtom, initialInquiryFormState);
}

// 문의 폼 결과 관리 훅
export function useInquiryFormResult() {
  const [result, setResult] = useAtom(inquiryFormResultAtom);
  return { result, clearResult: () => setResult(null) };
}

// 문의 폼 제출 훅
export function useSubmitInquiryForm(params?: {
  onSuccess?: (data: { id: string }) => void;
}) {
  return useSubmitForm({
    mutationFn: submitInquiryTicket,
    stateAtom: inquiryFormStateAtom,
    resultAtom: inquiryFormResultAtom,
    initialState: initialInquiryFormState,
    errorMessage: "문의 등록에 실패했습니다.",
    onSuccess: params?.onSuccess,
  });
}

// 수리 폼 옵션 조회 API 호출
const fetchRepairOptions = async (): Promise<RepairFormOptions> => {
  const response = await fetch("/api/ticket/repair/options", {
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.error ?? "선택지를 불러오지 못했습니다.");
  return {
    corporations: data.corporations ?? [],
    urgencies: data.urgencies ?? [],
    issueTypes: data.issueTypes ?? [],
  };
};

// 수리 티켓 제출 API 호출
const submitRepairTicket = async (payload: RepairFormState) => {
  const response = await fetch("/api/ticket/repair", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.error ?? "수리 요청 등록에 실패했습니다.");
  return data as { id: string };
};

// 수리 폼 옵션 조회 훅
export function useRepairFormOptions(initialData?: RepairFormOptions) {
  return useQuery<RepairFormOptions, Error>({
    queryKey: ["repair-form-options"],
    queryFn: fetchRepairOptions,
    initialData,
  });
}

// 수리 폼 상태 관리 훅
export function useRepairFormState() {
  return useFormState(repairFormStateAtom, initialRepairFormState);
}

// 수리 폼 결과 관리 훅
export function useRepairFormResult() {
  const [result, setResult] = useAtom(repairFormResultAtom);
  return { result, clearResult: () => setResult(null) };
}

// 수리 폼 제출 훅
export function useSubmitRepairForm(params?: {
  onSuccess?: (data: { id: string }) => void;
}) {
  return useSubmitForm({
    mutationFn: submitRepairTicket,
    stateAtom: repairFormStateAtom,
    resultAtom: repairFormResultAtom,
    initialState: initialRepairFormState,
    errorMessage: "수리 요청 등록에 실패했습니다.",
    onSuccess: params?.onSuccess,
  });
}

// 폼 상태 관리 공통 훅
function useFormState<T extends Record<string, unknown>>(
  atom: PrimitiveAtom<T>,
  initialState: T,
) {
  const [formState, setFormState] = useAtom(atom);

  // 특정 필드 값 업데이트
  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // 폼 상태 초기화
  const reset = () => setFormState(initialState);

  return { formState, updateField, reset };
}

// 라이센스 찾기 폼 옵션 조회 API 호출
const fetchFindLicenseOptions = async (): Promise<FindLicenseFormOptions> => {
  const response = await fetch("/api/ticket/find-license/options", {
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.error ?? "선택지를 불러오지 못했습니다.");
  return {
    corporations: data.corporations ?? [],
  };
};

// 라이센스 찾기 제출 API 호출
const submitFindLicenseRequest = async (payload: FindLicenseFormState) => {
  const response = await fetch("/api/ticket/find-license", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data?.error ?? "라이센스 찾기 요청에 실패했습니다.");
  return data as {
    success: boolean;
    searchResults: Array<{
      licenseName: string;
      results: ParsedLicenseResult[];
    }>;
    totalFound: number;
  };
};

// 라이센스 찾기 폼 옵션 조회 훅
export function useFindLicenseFormOptions(
  initialData?: FindLicenseFormOptions,
) {
  return useQuery<FindLicenseFormOptions, Error>({
    queryKey: ["find-license-form-options"],
    queryFn: fetchFindLicenseOptions,
    initialData,
  });
}

// 라이센스 찾기 폼 상태 관리 훅
export function useFindLicenseFormState() {
  return useFormState(findLicenseFormStateAtom, initialFindLicenseFormState);
}

// 라이센스 찾기 폼 결과 관리 훅
export function useFindLicenseFormResult() {
  const [result, setResult] = useAtom(findLicenseFormResultAtom);
  return { result, clearResult: () => setResult(null) };
}

// 라이센스 찾기 폼 제출 훅
export function useSubmitFindLicenseForm(params?: {
  onSuccess?: (data: {
    success: boolean;
    searchResults: Array<{
      licenseName: string;
      results: ParsedLicenseResult[];
    }>;
    totalFound: number;
  }) => void;
}) {
  const setFormState = useSetAtom(findLicenseFormStateAtom);
  const setResult = useSetAtom(findLicenseFormResultAtom);

  return useMutation({
    mutationFn: submitFindLicenseRequest,
    onMutate: () => setResult(null),
    onSuccess: (data) => {
      // 검색 결과를 result atom에 저장
      setResult({ id: "success" });
      setFormState(initialFindLicenseFormState);
      params?.onSuccess?.(data);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "라이센스 찾기 요청에 실패했습니다.";
      setResult({ error: message });
    },
  });
}

// 폼 제출 공통 훅
function useSubmitForm<T>({
  mutationFn,
  stateAtom,
  resultAtom,
  initialState,
  errorMessage,
  onSuccess,
}: {
  mutationFn: (payload: T) => Promise<{ id: string }>;
  stateAtom: PrimitiveAtom<T>;
  resultAtom: PrimitiveAtom<FormResult>;
  initialState: T;
  errorMessage: string;
  onSuccess?: (data: { id: string }) => void;
}) {
  const setFormState = useSetAtom(stateAtom);
  const setResult = useSetAtom(resultAtom);

  return useMutation({
    mutationFn,
    onMutate: () => setResult(null), // 제출 시작 시 결과 초기화
    onSuccess: (data) => {
      setResult({ id: data.id }); // 성공 결과 저장
      setFormState(initialState); // 폼 상태 초기화
      onSuccess?.(data);
    },
    onError: (error: unknown) => {
      // 에러 메시지 저장
      const message = error instanceof Error ? error.message : errorMessage;
      setResult({ error: message });
    },
  });
}
