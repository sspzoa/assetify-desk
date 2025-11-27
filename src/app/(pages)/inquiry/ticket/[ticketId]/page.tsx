"use client";

import { useAtom } from "jotai";
import { use } from "react";
import {
  TicketCreatedTimeAtom,
  Ticket긴급도Atom,
  Ticket담당자Atom,
  Ticket문의내용Atom,
  Ticket문의유형Atom,
  Ticket문의자Atom,
  Ticket법인Atom,
  Ticket부서Atom,
  Ticket상태Atom,
  Ticket자산번호Atom,
} from "@/app/(pages)/inquiry/(atoms)/useInquiryTicketStore";
import { useInquiryTicket } from "@/app/(pages)/inquiry/(hooks)/useInquiryTicket";
import CopyLinkButton from "@/app/(pages)/inquiry/ticket/[ticketId]/(components)/copyLinkButton";
import {
  TicketDetailCard,
  TicketDetailInfo,
  TicketDetailStatus,
} from "@/app/(pages)/inquiry/ticket/[ticketId]/(components)/ticketDetailCards";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { FormFieldList } from "@/shared/components/form/form-fields";

export default function InquiryTicket({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = use(params);
  const { isLoading, error } = useInquiryTicket(ticketId);

  const [법인] = useAtom(Ticket법인Atom);
  const [부서] = useAtom(Ticket부서Atom);
  const [문의자] = useAtom(Ticket문의자Atom);
  const [자산번호] = useAtom(Ticket자산번호Atom);
  const [문의유형] = useAtom(Ticket문의유형Atom);
  const [문의내용] = useAtom(Ticket문의내용Atom);
  const [긴급도] = useAtom(Ticket긴급도Atom);
  const [상태] = useAtom(Ticket상태Atom);
  const [담당자] = useAtom(Ticket담당자Atom);
  const [createdTime] = useAtom(TicketCreatedTimeAtom);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <Container>
      <Header title="Inquiry" highlighted="Ticket" />
      <span className="flex flex-row flex-wrap items-center justify-center gap-x-spacing-200 text-center text-content-standard-secondary text-label">
        앞으로 이 링크로 문의 내용과 진행 상황을 확인할 수 있어요.
        <CopyLinkButton />
      </span>
      <FormFieldList>
        <div className="grid w-full gap-spacing-400 md:grid-cols-2">
          <TicketDetailStatus label="상태" value={상태} />
          <TicketDetailStatus label="담당자" value={담당자} />
        </div>
        <TicketDetailCard className="flex flex-col gap-spacing-100 divide-y divide-line-divider">
          <TicketDetailInfo label="법인" value={법인} />
          <TicketDetailInfo label="부서" value={부서} />
          <TicketDetailInfo label="문의자" value={문의자} />
          <TicketDetailInfo label="자산번호" value={자산번호} />
          <TicketDetailInfo label="문의유형" value={문의유형} />
          <TicketDetailInfo label="문의내용" value={문의내용} />
          <TicketDetailInfo label="긴급도" value={긴급도} />
          <TicketDetailInfo label="생성일시" value={createdTime} />
        </TicketDetailCard>
      </FormFieldList>
    </Container>
  );
}
