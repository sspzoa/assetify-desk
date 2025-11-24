"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PrimitiveAtom } from "jotai";
import { useAtom } from "jotai";

import { CANCELABLE_STATUS } from "@/constants";
import {
  askCancelStatusAtom,
  type CancelStatus,
  repairCancelStatusAtom,
} from "@/store/form";
import type {
  AskTicketDetail,
  RepairTicketDetail,
  TicketType,
} from "@/types/ticket";
import { formatValue } from "@/utils/formatValue";

import CopyLink from "./CopyLink";

// 상세 정보 행 Props 타입
type DetailRowProps = {
  label: string;
  value?: string | string[] | null;
};

// 상세 정보 행 컴포넌트
const DetailRow = ({ label, value }: DetailRowProps) => (
  <div className="flex flex-col gap-spacing-50 py-spacing-300">
    <span className="text-content-standard-tertiary text-label">{label}</span>
    <span className="text-body text-content-standard-primary">
      {formatValue(value)}
    </span>
  </div>
);

// 상태 카드 Props 타입
type StatusCardProps = {
  label: string;
  value?: string | null;
};

// 상태 카드 컴포넌트
const StatusCard = ({ label, value }: StatusCardProps) => (
  <div className="flex min-w-[220px] flex-1 flex-col gap-spacing-100 rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-400">
    <span className="text-content-standard-tertiary text-label">{label}</span>
    <span className="font-semibold text-content-standard-primary text-heading">
      {formatValue(value)}
    </span>
  </div>
);

// 티켓 설정 타입
type TicketConfig<T> = {
  type: TicketType;
  title: string;
  queryKey: string;
  cancelEndpoint: string;
  cancelAtom: PrimitiveAtom<CancelStatus>;
  cancelErrorMessage: string;
  cancelButtonText: string;
  isCancelable: (detail: T) => boolean;
  statusCards: (detail: T) => StatusCardProps[];
  detailRows: (detail: T, submittedAt: string) => DetailRowProps[];
};

// 문의 티켓 설정
const askConfig: TicketConfig<AskTicketDetail> = {
  type: "ask",
  title: "Ask Detail",
  queryKey: "ask-ticket-detail",
  cancelEndpoint: "/api/ticket/ask",
  cancelAtom: askCancelStatusAtom,
  cancelErrorMessage: "문의 취소에 실패했습니다. 다시 시도해주세요.",
  cancelButtonText: "문의 취소하기",
  // 취소 가능 여부 판단
  isCancelable: (detail) => {
    const hasAssignee =
      typeof detail.assignee === "string" && detail.assignee.trim().length > 0;
    return (
      !detail.archived &&
      !hasAssignee &&
      (!detail.status || detail.status === CANCELABLE_STATUS)
    );
  },
  // 상태 카드 데이터
  statusCards: (detail) => [
    { label: "상태", value: detail.status },
    { label: "담당자", value: detail.assignee },
  ],
  // 상세 정보 행 데이터
  detailRows: (detail, submittedAt) => [
    { label: "법인", value: detail.corporation },
    { label: "부서", value: detail.department },
    { label: "문의자", value: detail.requester },
    { label: "자산 번호", value: detail.assetNumber },
    { label: "문의 유형", value: detail.inquiryType },
    { label: "문의 내용", value: detail.detail },
    { label: "첨부파일", value: detail.attachments },
    { label: "긴급도", value: detail.urgency },
    { label: "제출 날짜", value: submittedAt },
  ],
};

// 수리 티켓 설정
const repairConfig: TicketConfig<RepairTicketDetail> = {
  type: "repair",
  title: "Repair Detail",
  queryKey: "repair-ticket-detail",
  cancelEndpoint: "/api/ticket/repair",
  cancelAtom: repairCancelStatusAtom,
  cancelErrorMessage: "수리 요청 취소에 실패했습니다. 다시 시도해주세요.",
  cancelButtonText: "수리 요청 취소하기",
  // 취소 가능 여부 판단
  isCancelable: (detail) => {
    const hasAssignee =
      typeof detail.assignee === "string" && detail.assignee.trim().length > 0;
    const isCancelableStatus =
      (!detail.status || detail.status === CANCELABLE_STATUS) &&
      (!detail.progressStatus || detail.progressStatus === CANCELABLE_STATUS);
    return !detail.archived && !hasAssignee && isCancelableStatus;
  },
  // 상태 카드 데이터
  statusCards: (detail) => [
    { label: "상태", value: detail.status },
    { label: "진행 상황", value: detail.progressStatus },
  ],
  // 상세 정보 행 데이터
  detailRows: (detail, submittedAt) => [
    { label: "법인", value: detail.corporation },
    { label: "부서", value: detail.department },
    { label: "문의자", value: detail.requester },
    { label: "담당 팀", value: detail.team },
    { label: "실제 근무 위치", value: detail.location },
    { label: "자산 번호", value: detail.assetNumber },
    { label: "고장 내역", value: detail.issueTypes },
    { label: "고장 증상", value: detail.detail },
    { label: "첨부파일", value: detail.attachments },
    { label: "긴급도", value: detail.urgency },
    { label: "제출 날짜", value: submittedAt },
  ],
};

// 티켓 상세 뷰 Props 타입
type TicketDetailViewProps<T> = {
  ticketId: string;
  detail: T;
  type: TicketType;
  isError?: boolean;
  extraStatusCards?: StatusCardProps[];
};

// 티켓 상세 뷰 컴포넌트
export default function TicketDetailView<
  T extends AskTicketDetail | RepairTicketDetail,
>({
  ticketId,
  detail,
  type,
  isError,
  extraStatusCards,
}: TicketDetailViewProps<T>) {
  const config = type === "ask" ? askConfig : repairConfig;
  const queryClient = useQueryClient();

  // 제출 날짜 포맷팅
  const submittedAt = new Date(detail.createdTime).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const isArchived = Boolean(detail.archived);
  const canCancel = (config.isCancelable as (d: T) => boolean)(detail);

  const [cancelStatus, setCancelStatus] = useAtom(config.cancelAtom);

  // 취소 뮤테이션
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${config.cancelEndpoint}/${ticketId}/cancel`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error ?? "취소 요청에 실패했습니다.");
      return data;
    },
    onSuccess: () => {
      // 캐시 업데이트
      queryClient.setQueryData<T>([config.queryKey, ticketId], (prev) =>
        prev ? { ...prev, archived: true } : prev,
      );
      setCancelStatus({ state: "idle" });
    },
    onError: (error: unknown) => {
      setCancelStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : config.cancelErrorMessage,
      });
    },
    onMutate: () => setCancelStatus({ state: "pending" }),
  });

  // 에러 상태 표시
  if (isError) {
    return (
      <div className="text-body text-core-status-negative">
        정보를 불러오지 못했습니다. 다시 시도해주세요.
      </div>
    );
  }

  const statusCards = (config.statusCards as (d: T) => StatusCardProps[])(
    detail,
  );
  const detailRows = (
    config.detailRows as (d: T, s: string) => DetailRowProps[]
  )(detail, submittedAt);

  return (
    <div className="flex w-full flex-col items-center gap-spacing-600 px-spacing-700 py-spacing-900">
      <span className="font-semibold text-display">
        {config.title}
        <span className="text-core-accent">.</span>
      </span>

      {/* 링크 복사 컴포넌트 */}
      <CopyLink />

      <div className="flex w-full flex-col items-center gap-spacing-500">
        {/* 기본 상태 카드들 */}
        <div className="flex w-full max-w-[768px] flex-wrap gap-spacing-500">
          {statusCards.map((card) => (
            <StatusCard key={card.label} {...card} />
          ))}
        </div>

        {/* 추가 상태 카드들 (수리 티켓용) */}
        {extraStatusCards && extraStatusCards.length > 0 && (
          <div className="flex w-full max-w-[768px] flex-wrap gap-spacing-500">
            {extraStatusCards.map((card) => (
              <StatusCard key={card.label} {...card} />
            ))}
          </div>
        )}

        {/* 상세 정보 섹션 */}
        <div className="flex w-full max-w-[768px] flex-col gap-spacing-300 rounded-radius-700 border border-line-outline bg-components-fill-standard-primary p-spacing-500">
          <div className="flex flex-col divide-y divide-line-divider">
            {detailRows.map((row) => (
              <DetailRow key={row.label} {...row} />
            ))}
          </div>
        </div>

        {/* 취소 버튼 영역 */}
        {(canCancel || isArchived) && (
          <>
            <button
              type="button"
              onClick={() => canCancel && cancelMutation.mutate()}
              disabled={!canCancel || cancelMutation.isPending}
              className="w-full max-w-[768px] cursor-pointer rounded-radius-700 bg-core-status-negative/10 px-spacing-400 py-spacing-300 font-semibold text-body text-core-status-negative transition hover:opacity-75 active:scale-95 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isArchived
                ? "취소됨"
                : cancelMutation.isPending
                  ? "취소 진행 중..."
                  : config.cancelButtonText}
            </button>

            {/* 취소 에러 메시지 */}
            {cancelStatus.state === "error" && cancelStatus.message && (
              <span className="text-core-status-negative text-label">
                {cancelStatus.message}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 문의 티켓 상세 뷰 컴포넌트
export function AskTicketDetailView({
  ticketId,
  detail,
  isError,
}: {
  ticketId: string;
  detail: AskTicketDetail;
  isError?: boolean;
}) {
  return (
    <TicketDetailView
      ticketId={ticketId}
      detail={detail}
      type="ask"
      isError={isError}
    />
  );
}

// 수리 티켓 상세 뷰 컴포넌트
export function RepairTicketDetailView({
  ticketId,
  detail,
  isError,
}: {
  ticketId: string;
  detail: RepairTicketDetail;
  isError?: boolean;
}) {
  // 수리 일정 포맷팅
  const scheduledAt = detail.schedule
    ? new Date(detail.schedule).toLocaleString("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : undefined;

  // 추가 상태 카드 (수리 전용)
  const extraStatusCards = [
    { label: "과실 여부", value: detail.liability },
    { label: "단가", value: detail.price ? `${detail.price}원` : undefined },
    { label: "담당자", value: detail.assignee },
    { label: "조치내용", value: detail.actionNotes },
    { label: "수리 일정", value: scheduledAt ?? detail.schedule },
  ];

  return (
    <TicketDetailView
      ticketId={ticketId}
      detail={detail}
      type="repair"
      isError={isError}
      extraStatusCards={extraStatusCards}
    />
  );
}
