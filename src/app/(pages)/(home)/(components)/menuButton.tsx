"use client";

import { useRouter } from "next/navigation";

interface MenuButtonProps {
  title: string;
  description: string;
  href: string;
}

export default function MenuButton({ title, description, href }: MenuButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    const hasParticipated = localStorage.getItem("stocktakingParticipated");
    if (hasParticipated !== "true") {
      const shouldParticipate = confirm("원활한 서비스를 위해 재고조사가 필요합니다. 참여하시겠습니까?");
      if (shouldParticipate) {
        router.push("/stocktaking");
      } else {
        router.push(href);
      }
    } else {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full cursor-pointer flex-col items-start justify-center gap-spacing-50 rounded-radius-400 border border-line-outline bg-components-fill-standard-primary px-spacing-500 py-spacing-400 duration-100 hover:opacity-75 active:scale-95 active:opacity-50">
      <span className="font-semibold text-heading">{title}</span>
      <span className="text-content-standard-secondary text-label">{description}</span>
    </button>
  );
}
