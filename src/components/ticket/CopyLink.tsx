"use client";

import { useAtom } from "jotai";

import { copyStatusAtom } from "@/store/form";

type CopyLinkProps = {
  label?: string;
  buttonText?: string;
  successText?: string;
};

export default function CopyLink({
  label = "이 링크를 통해 진행 상황을 확인할 수 있어요",
  buttonText = "링크 복사하기",
  successText = "복사되었습니다!",
}: CopyLinkProps = {}) {
  const [status, setStatus] = useAtom(copyStatusAtom);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("copied");
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
