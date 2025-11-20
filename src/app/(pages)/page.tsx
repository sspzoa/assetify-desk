"use client";

import { useQuery } from "@tanstack/react-query";
import { LucideShield } from "lucide-react";
import Link from "next/link";

const HEALTH_CHECK_QUERY_KEY = ["health-check"];

export default function Home() {
  const { isSuccess, isError, isPending } = useQuery({
    queryKey: HEALTH_CHECK_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/health", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      return response.json();
    },
    retry: 0,
  });

  const statusText = isSuccess
    ? "서버와 안전하게 연결되어 있어요."
    : isError
      ? "서버 연결에 실패했어요. 잠시 후 다시 시도해 주세요."
      : "서버 연결 상태를 확인하는 중이에요...";

  const statusColor = isError
    ? "text-core-status-negative"
    : isPending
      ? "text-content-standard-primary-primary"
      : "text-core-accent";

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-spacing-700">
      <div className="flex flex-col items-center justify-center gap-spacing-200">
        <span className="text-display font-bold">
          Assetify <span className="text-core-accent">Desk.</span>
        </span>
        <span className="text-body text-content-standard-secondary">
          간편하게 문의하고, 진행 상황을 확인해 보세요
        </span>
      </div>
      <div className="mb-spacing-1000 flex max-w-64 flex-col items-center justify-center gap-spacing-500 md:flex-row">
        <Link
          href="/ask-form"
          className="flex w-full shrink-0 flex-col items-start justify-center gap-spacing-100 rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-500 text-content-standard-primary-primary duration-100 cursor-pointer hover:opacity-75 active:scale-95 active:opacity-50"
        >
          <span className="text-heading font-semibold">문의하기</span>
          <span className="text-label">자산 관련 문의 사항이 있는 경우</span>
        </Link>
        <Link
          href="/repair-form"
          className="flex w-full shrink-0 flex-col items-start justify-center gap-spacing-100 rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-500 text-content-standard-primary-primary duration-100 cursor-pointer hover:opacity-75 active:scale-95 active:opacity-50"
        >
          <span className="text-heading font-semibold">수리 요청하기</span>
          <span className="text-label">
            하드웨어 고장으로 수리가 필요한 경우
          </span>
        </Link>
      </div>
      <div className="fixed bottom-spacing-900 flex flex-col items-center justify-center gap-spacing-300">
        <div
          className={`flex flex-row items-center justify-center gap-spacing-150 ${statusColor}`}
        >
          {isSuccess && <LucideShield size={16} />}
          <span className="text-label">{statusText}</span>
        </div>
        <span className="text-body text-content-standard-secondary">
          &copy; 2025 IdsTrust. All rights reserved.
        </span>
      </div>
    </div>
  );
}
