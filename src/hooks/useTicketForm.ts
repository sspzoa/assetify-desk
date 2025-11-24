"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { PrimitiveAtom } from "jotai";
import { useAtom, useSetAtom } from "jotai";

import {
  askFormResultAtom,
  askFormStateAtom,
  initialAskFormState,
  initialRepairFormState,
  repairFormResultAtom,
  repairFormStateAtom,
} from "@/store/form";
import type {
  AskFormOptions,
  AskFormState,
  FormResult,
  RepairFormOptions,
  RepairFormState,
} from "@/types/ticket";

// 문의 폼 옵션 조회 API 호출
const fetchAskOptions = async (): Promise<AskFormOptions> => {
  const response = await fetch("/api/ticket/ask/options", {
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
const submitAskTicket = async (payload: AskFormState) => {
  const response = await fetch("/api/ticket/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error ?? "문의 등록에 실패했습니다.");
  return data as { id: string };
};

// 문의 폼 옵션 조회 훅
export function useAskFormOptions(initialData?: AskFormOptions) {
  return useQuery<AskFormOptions, Error>({
    queryKey: ["ask-form-options"],
    queryFn: fetchAskOptions,
    initialData,
  });
}

// 문의 폼 상태 관리 훅
export function useAskFormState() {
  return useFormState(askFormStateAtom, initialAskFormState);
}

// 문의 폼 결과 관리 훅
export function useAskFormResult() {
  const [result, setResult] = useAtom(askFormResultAtom);
  return { result, clearResult: () => setResult(null) };
}

// 문의 폼 제출 훅
export function useSubmitAskForm(params?: {
  onSuccess?: (data: { id: string }) => void;
}) {
  return useSubmitForm({
    mutationFn: submitAskTicket,
    stateAtom: askFormStateAtom,
    resultAtom: askFormResultAtom,
    initialState: initialAskFormState,
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
