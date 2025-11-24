"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider as JotaiProvider } from "jotai";
import { type PropsWithChildren, useState } from "react";

// 앱 전역 프로바이더 컴포넌트
export function Providers({ children }: PropsWithChildren) {
  // React Query 클라이언트 초기화
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
            retry: 1, // 실패 시 1회 재시도
          },
          mutations: {
            retry: 1, // 실패 시 1회 재시도
          },
        },
      }),
  );

  return (
    // Jotai 상태 관리 프로바이더
    <JotaiProvider>
      {/* React Query 프로바이더 */}
      <QueryClientProvider client={queryClient}>
        {children}
        {/* 개발 도구 (개발 환경에서만 표시) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </JotaiProvider>
  );
}
