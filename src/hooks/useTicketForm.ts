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

export function useAskFormOptions(initialData?: AskFormOptions) {
  return useQuery<AskFormOptions, Error>({
    queryKey: ["ask-form-options"],
    queryFn: fetchAskOptions,
    initialData,
  });
}

export function useAskFormState() {
  return useFormState(askFormStateAtom, initialAskFormState);
}

export function useAskFormResult() {
  const [result, setResult] = useAtom(askFormResultAtom);
  return { result, clearResult: () => setResult(null) };
}

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

export function useRepairFormOptions(initialData?: RepairFormOptions) {
  return useQuery<RepairFormOptions, Error>({
    queryKey: ["repair-form-options"],
    queryFn: fetchRepairOptions,
    initialData,
  });
}

export function useRepairFormState() {
  return useFormState(repairFormStateAtom, initialRepairFormState);
}

export function useRepairFormResult() {
  const [result, setResult] = useAtom(repairFormResultAtom);
  return { result, clearResult: () => setResult(null) };
}

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

function useFormState<T extends Record<string, unknown>>(
  atom: PrimitiveAtom<T>,
  initialState: T,
) {
  const [formState, setFormState] = useAtom(atom);

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => setFormState(initialState);

  return { formState, updateField, reset };
}

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
    onMutate: () => setResult(null),
    onSuccess: (data) => {
      setResult({ id: data.id });
      setFormState(initialState);
      onSuccess?.(data);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : errorMessage;
      setResult({ error: message });
    },
  });
}
