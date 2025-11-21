"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom, useSetAtom } from "jotai";

import {
  type AskFormOptions,
  type AskFormState,
  askFormResultAtom,
  askFormStateAtom,
  initialAskFormState,
} from "@/store/askForm";

const OPTIONS_QUERY_KEY = ["ask-form-options"];

const fetchAskFormOptions = async (): Promise<AskFormOptions> => {
  const response = await fetch("/api/ticket/ask/options", {
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? "선택지를 불러오지 못했습니다.");
  }
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
  if (!response.ok) {
    throw new Error(data?.error ?? "문의 등록에 실패했습니다.");
  }

  return data as { id: string };
};

export function useAskFormOptions(initialData?: AskFormOptions) {
  return useQuery<AskFormOptions, Error>({
    queryKey: OPTIONS_QUERY_KEY,
    queryFn: fetchAskFormOptions,
    initialData,
  });
}

export function useAskFormState() {
  const [formState, setFormState] = useAtom(askFormStateAtom);

  const updateField = <K extends keyof AskFormState>(
    field: K,
    value: AskFormState[K],
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const reset = () => setFormState(initialAskFormState);

  return { formState, updateField, reset };
}

export function useAskFormResult() {
  const [result, setResult] = useAtom(askFormResultAtom);
  const clearResult = () => setResult(null);

  return { result, clearResult };
}

type SubmitHookParams = {
  onSuccess?: (data: { id: string }) => void;
};

export function useSubmitAskForm(params?: SubmitHookParams) {
  const { onSuccess } = params ?? {};
  const setFormState = useSetAtom(askFormStateAtom);
  const setResult = useSetAtom(askFormResultAtom);

  return useMutation({
    mutationFn: submitAskTicket,
    onMutate: () => {
      setResult(null);
    },
    onSuccess: (data) => {
      setResult({ id: data.id });
      setFormState(initialAskFormState);
      onSuccess?.(data);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "문의 등록에 실패했습니다.";
      setResult({ error: message });
    },
  });
}
