"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import MenuButton from "@/app/(pages)/(home)/(components)/menuButton";
import Container from "@/shared/components/common/container";
import Header from "@/shared/components/common/header";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateLicenseLink = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/session", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("세션 생성에 실패했습니다.");
      }

      const data = await response.json();
      const url = `${window.location.origin}/license/${data.sessionId}`;

      await navigator.clipboard.writeText(url);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("링크 생성 실패:", error);
      alert("링크 생성에 실패했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Container className="items-center md:h-dvh md:justify-center">
      <Header title="Assetify" highlighted="Desk" />
      <div className="grid w-full max-w-3xl grid-cols-1 gap-spacing-400 md:grid-cols-2">
        <MenuButton href="/inquiry" title="문의하기" description="자산 관련 문의 사항을 해결할 수 있어요." />
        <MenuButton
          href="/repair"
          title="수리 요청하기"
          description="하드웨어 고장이 난 경우 수리를 요청할 수 있어요."
        />
        <button
          type="button"
          onClick={handleGenerateLicenseLink}
          disabled={isGenerating}
          className="flex w-full cursor-pointer flex-col items-start justify-center gap-spacing-50 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary px-spacing-500 py-spacing-400 duration-100 hover:opacity-75 active:scale-95 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50">
          <div className="flex w-full items-center justify-between">
            <span className="font-semibold text-heading">라이센스 찾기</span>
            {isCopied ? (
              <Check className="h-5 w-5 text-core-status-positive" />
            ) : (
              <Copy className="h-5 w-5 text-content-standard-secondary" />
            )}
          </div>
          <span className="text-content-standard-secondary text-label">
            {isGenerating
              ? "링크 생성 중..."
              : isCopied
                ? "링크가 복사되었습니다! (1시간 유효)"
                : "기존에 지급받은 라이센스를 다시 확인할 수 있어요."}
          </span>
        </button>
      </div>
    </Container>
  );
}
