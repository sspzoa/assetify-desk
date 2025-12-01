import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "@/app/(pages)/license/(hooks)/useSession";

interface SessionTimerProps {
  sessionId: string;
}

export default function SessionTimer({ sessionId }: SessionTimerProps) {
  const { data: sessionInfo, isLoading, error } = useSession(sessionId);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!sessionInfo) return;

    const updateTimeLeft = () => {
      const now = Date.now();
      const remaining = sessionInfo.expiresAt - now;
      setTimeLeft(remaining > 0 ? remaining : 0);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [sessionInfo]);

  if (isLoading) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center gap-spacing-200 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300">
        <Clock className="h-4 w-4 text-core-status-negative" />
        <span className="text-core-status-negative text-label">세션이 만료되었습니다.</span>
      </div>
    );
  }

  if (timeLeft === 0) {
    return (
      <div className="flex items-center gap-spacing-200 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300">
        <Clock className="h-4 w-4 text-core-status-negative" />
        <span className="text-core-status-negative text-label">세션이 만료되었습니다.</span>
      </div>
    );
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const isExpiringSoon = timeLeft < 5 * 60 * 1000;

  return (
    <div
      className={`flex items-center gap-spacing-300 rounded-radius-400 border border-line-outline px-spacing-400 py-spacing-300 ${
        isExpiringSoon ? "bg-components-fill-standard-secondary" : "bg-components-fill-standard-secondary"
      }`}>
      <Clock
        className={`h-4 w-4 ${isExpiringSoon ? "text-core-status-negative" : "text-content-standard-secondary"}`}
      />
      <span
        className={`text-label ${
          isExpiringSoon ? "font-semibold text-core-status-negative" : "text-content-standard-secondary"
        }`}>
        세션 만료까지 {hours > 0 && `${hours}시간 `}
        {minutes}분 {seconds}초 남음
      </span>
    </div>
  );
}
