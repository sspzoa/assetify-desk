"use client";

import { useAtom } from "jotai";

import { copyStatusAtom } from "@/store/form";

// 링크 복사 컴포넌트 Props 타입
type CopyLinkProps = {
  label?: string; // 안내 문구
  buttonText?: string; // 버튼 텍스트
  successText?: string; // 복사 성공 텍스트
};

// 링크 복사 컴포넌트
export default function CopyLink({
  label = "이 링크를 통해 진행 상황을 확인할 수 있어요",
  buttonText = "링크 복사하기",
  successText = "복사되었습니다!",
}: CopyLinkProps = {}) {
  const [status, setStatus] = useAtom(copyStatusAtom);

  // 클립보드에 현재 URL 복사
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
      // 2초 후 상태 초기화
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy link", error);
    }
  };

  return (
    <p className="text-content-standard-secondary text-label">
      {label}{" "}
      <button
        type="button"
        onClick={handleCopy}
        className="inline text-core-accent underline underline-offset-4 duration-100 hover:opacity-75 active:scale-95 active:opacity-50"
      >
        {status === "copied" ? successText : buttonText}
      </button>
    </p>
  );
}
