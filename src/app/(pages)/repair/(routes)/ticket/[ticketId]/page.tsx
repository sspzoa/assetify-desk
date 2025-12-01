"use client";

import { useAtom } from "jotai";
import { use } from "react";
import {
  RepairTicketCreatedTimeAtom,
  RepairTicket고장내역Atom,
  RepairTicket고장증상Atom,
  RepairTicket과실여부Atom,
  RepairTicket긴급도Atom,
  RepairTicket단가Atom,
  RepairTicket담당자Atom,
  RepairTicket문의자Atom,
  RepairTicket법인Atom,
  RepairTicket부서Atom,
  RepairTicket상태Atom,
  RepairTicket수리일정Atom,
  RepairTicket수리진행동의서Atom,
  RepairTicket수리진행상황Atom,
  RepairTicket실제근무위치Atom,
  RepairTicket자산번호Atom,
  RepairTicket조치내용Atom,
} from "@/app/(pages)/repair/(atoms)/useRepairTicketStore";
import { useRepairTicket } from "@/app/(pages)/repair/(hooks)/useRepairTicket";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import CopyLinkButton from "@/shared/components/form/copyLinkButton";
import { FormFieldList } from "@/shared/components/form/form-fields";
import { TicketDetailCard, TicketDetailInfo, TicketDetailStatus } from "@/shared/components/form/ticketDetailCards";

export default function RepairTicket({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = use(params);
  const { isLoading, error } = useRepairTicket(ticketId);

  const [법인] = useAtom(RepairTicket법인Atom);
  const [부서] = useAtom(RepairTicket부서Atom);
  const [문의자] = useAtom(RepairTicket문의자Atom);
  const [실제근무위치] = useAtom(RepairTicket실제근무위치Atom);
  const [자산번호] = useAtom(RepairTicket자산번호Atom);
  const [고장내역] = useAtom(RepairTicket고장내역Atom);
  const [고장증상] = useAtom(RepairTicket고장증상Atom);
  const [긴급도] = useAtom(RepairTicket긴급도Atom);
  const [수리진행동의서] = useAtom(RepairTicket수리진행동의서Atom);
  const [상태] = useAtom(RepairTicket상태Atom);
  const [조치내용] = useAtom(RepairTicket조치내용Atom);
  const [담당자] = useAtom(RepairTicket담당자Atom);
  const [과실여부] = useAtom(RepairTicket과실여부Atom);
  const [수리일정] = useAtom(RepairTicket수리일정Atom);
  const [단가] = useAtom(RepairTicket단가Atom);
  const [수리진행상황] = useAtom(RepairTicket수리진행상황Atom);
  const [createdTime] = useAtom(RepairTicketCreatedTimeAtom);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <Container>
      <Header title="Repair" highlighted="Ticket" />
      <span className="flex flex-row flex-wrap items-center justify-center gap-x-spacing-200 text-center text-content-standard-secondary text-label">
        앞으로 이 링크로 수리 내용과 진행 상황을 확인할 수 있어요.
        <CopyLinkButton />
      </span>
      <FormFieldList>
        <div className="grid w-full gap-spacing-400 md:grid-cols-2">
          <TicketDetailStatus label="상태" value={상태} />
          <TicketDetailStatus label="담당자" value={담당자} />
        </div>
        <TicketDetailCard className="flex flex-col gap-spacing-100 divide-y divide-line-divider">
          <TicketDetailInfo label="수리 진행 상황" value={수리진행상황} />
          <TicketDetailInfo label="과실 여부" value={과실여부} />
          <TicketDetailInfo label="단가" value={단가} />
          <TicketDetailInfo label="조치 내용" value={조치내용} />
          <TicketDetailInfo label="수리 일정" value={수리일정} />
        </TicketDetailCard>
        <TicketDetailCard className="flex flex-col gap-spacing-100 divide-y divide-line-divider">
          <TicketDetailInfo label="법인" value={법인} />
          <TicketDetailInfo label="부서" value={부서} />
          <TicketDetailInfo label="문의자" value={문의자} />
          <TicketDetailInfo label="실제 근무 위치" value={실제근무위치} />
          <TicketDetailInfo label="자산 번호" value={자산번호} />
          <TicketDetailInfo label="고장 내역" value={고장내역} />
          <TicketDetailInfo label="고장 증상" value={고장증상} />
          <TicketDetailInfo label="긴급도" value={긴급도} />
          <TicketDetailInfo label="수리 진행 동의서" value={수리진행동의서 ? "동의함" : "동의하지 않음"} />
          <TicketDetailInfo label="생성일시" value={createdTime} />
        </TicketDetailCard>
      </FormFieldList>
    </Container>
  );
}
