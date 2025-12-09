"use client";

import { useAtom, useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDueDiligenceInfo } from "@/app/(pages)/(home)/(hooks)/useDueDiligenceInfo";
import {
  DueDiligenceFormAssetIdAtom,
  DueDiligenceFound법인명Atom,
  DueDiligenceFound부서Atom,
  DueDiligenceFound사용자Atom,
  DueDiligenceFound실사확인Atom,
  DueDiligenceFound제조사Atom,
  DueDiligenceManual법인명Atom,
  DueDiligenceManual부서Atom,
  DueDiligenceManual사용자Atom,
  DueDiligenceStepAtom,
} from "@/app/(pages)/due-diligence/(atoms)/useDueDiligenceFormStore";
import { DueDiligenceOptions법인명Atom } from "@/app/(pages)/due-diligence/(atoms)/useDueDiligenceOptionsStore";
import { useAssetLookup } from "@/app/(pages)/due-diligence/(hooks)/useAssetLookup";
import { useDueDiligenceForm } from "@/app/(pages)/due-diligence/(hooks)/useDueDiligenceForm";
import { useDueDiligenceOptions } from "@/app/(pages)/due-diligence/(hooks)/useDueDiligenceOptions";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { FormField, FormFieldList, SelectOption, TextInput } from "@/shared/components/form/form-fields";
import SubmitButton from "@/shared/components/form/submit-button";
import { TicketDetailCard, TicketDetailInfo } from "@/shared/components/form/ticketDetailCards";

export default function DueDiligence() {
  const router = useRouter();
  const { isLoading: isLoadingInfo, error: infoError } = useDueDiligenceInfo();
  const { isLoading: isLoadingOptions, error: optionsError } = useDueDiligenceOptions();
  const { isLookingUp, error: lookupError, lookupAsset } = useAssetLookup();
  const { isConfirming, isSubmittingManual, confirmError, manualError, confirmAsset, submitManual, resetFlow } =
    useDueDiligenceForm();

  const [step, setStep] = useAtom(DueDiligenceStepAtom);
  const [자산번호, set자산번호] = useAtom(DueDiligenceFormAssetIdAtom);

  const found법인명 = useAtomValue(DueDiligenceFound법인명Atom);
  const found부서 = useAtomValue(DueDiligenceFound부서Atom);
  const found사용자 = useAtomValue(DueDiligenceFound사용자Atom);
  const found제조사 = useAtomValue(DueDiligenceFound제조사Atom);
  const found실사확인 = useAtomValue(DueDiligenceFound실사확인Atom);

  const 법인명Options = useAtomValue(DueDiligenceOptions법인명Atom);
  const [manual법인명, setManual법인명] = useAtom(DueDiligenceManual법인명Atom);
  const [manual부서, setManual부서] = useAtom(DueDiligenceManual부서Atom);
  const [manual사용자, setManual사용자] = useAtom(DueDiligenceManual사용자Atom);

  useEffect(() => {
    if (!isLoadingInfo && infoError) {
      alert(infoError.message);
      router.push("/");
    }
  }, [isLoadingInfo, infoError, router]);

  if (isLoadingInfo || isLoadingOptions) {
    return <LoadingComponent />;
  }

  if (optionsError) {
    return <ErrorComponent errorMessage={optionsError.message} />;
  }

  if (infoError) {
    return null;
  }

  const handleLookup = async () => {
    if (!자산번호.trim()) {
      alert("자산번호를 입력해주세요.");
      return;
    }
    await lookupAsset(자산번호);
  };

  const handleConfirm = async () => {
    await confirmAsset();
  };

  const handleIncorrect = () => {
    setStep("manual");
  };

  const handleManualSubmit = async () => {
    await submitManual();
  };

  const handleReset = () => {
    resetFlow();
  };

  if (step === "input") {
    return (
      <Container>
        <Header title="DD" highlighted="Form" />
        <FormFieldList onSubmit={handleLookup}>
          <FormField title="자산 번호" required>
            <TextInput placeholder="ex. 2309-N0001" value={자산번호} onChange={set자산번호} required />
          </FormField>
          <SubmitButton text="찾아보기" isLoading={isLookingUp} />
        </FormFieldList>
        {lookupError && (
          <>
            <p className="mt-spacing-400 text-body text-core-status-negative">{lookupError.message}</p>

            <span
              onClick={handleIncorrect}
              className="cursor-pointer text-body text-content-standard-tertiary underline duration-100 hover:opacity-75 active:scale-95 active:opacity-50">
              수동으로 입력하기
            </span>
          </>
        )}
      </Container>
    );
  }

  if (step === "confirm") {
    return (
      <Container>
        <Header title="DD" highlighted="Confirm" />
        <FormFieldList>
          <TicketDetailCard className="flex flex-col gap-spacing-100 divide-y divide-line-divider">
            <TicketDetailInfo label="자산 번호" value={자산번호} />
            <TicketDetailInfo label="법인명" value={found법인명} />
            <TicketDetailInfo label="부서" value={found부서} />
            <TicketDetailInfo label="사용자" value={found사용자} />
            <TicketDetailInfo label="제조사" value={found제조사} />
          </TicketDetailCard>
        </FormFieldList>
        {found실사확인 ? (
          <p className="text-body text-core-status-negative">
            이미 실사 확인이 완료된 자산입니다. 오류라고 생각된다면 IdsTrust 자산관리파트로 문의주세요.
          </p>
        ) : (
          <FormFieldList>
            <p className="text-center text-body text-content-standard-secondary">위 정보가 정확한가요?</p>
            <div className="flex w-full flex-col gap-spacing-300 md:flex-row-reverse">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="flex w-full items-center justify-center rounded-radius-400 bg-core-accent px-spacing-500 py-spacing-400 duration-100 hover:opacity-75 active:scale-95 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50">
                <span className="whitespace-pre-wrap font-semibold text-content-inverted-primary text-heading">
                  네, 정확합니다
                </span>
              </button>
              <button
                type="button"
                onClick={handleIncorrect}
                className="flex w-full items-center justify-center rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-500 py-spacing-400 duration-100 hover:opacity-75 active:scale-95 active:opacity-50 disabled:cursor-not-allowed disabled:opacity-50">
                <span className="whitespace-pre-wrap font-semibold text-content-standard-primary text-heading">
                  아니요, 틀린 부분이 있습니다.
                </span>
              </button>
            </div>
          </FormFieldList>
        )}
        {confirmError && <p className="text-body text-core-status-negative">{confirmError.message}</p>}
        <span
          onClick={handleReset}
          className="cursor-pointer text-body text-content-standard-tertiary underline duration-100 hover:opacity-75 active:scale-95 active:opacity-50">
          처음부터 다시하기
        </span>
      </Container>
    );
  }

  if (step === "manual") {
    return (
      <Container>
        <Header title="DD" highlighted="Manual" />
        <div className="flex items-center gap-spacing-300 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300">
          <p className="text-content-standard-secondary text-label">자산 번호: {자산번호}</p>
        </div>
        <FormFieldList onSubmit={handleManualSubmit}>
          <FormField title="법인명" required>
            <SelectOption options={법인명Options} value={manual법인명} onChange={setManual법인명} required />
          </FormField>
          <FormField title="부서" required>
            <TextInput
              placeholder="ex. 경영지원팀 or 자산관리파트"
              value={manual부서}
              onChange={setManual부서}
              required
            />
          </FormField>
          <FormField title="사용자 성함" required>
            <TextInput placeholder="ex. 김자산" value={manual사용자} onChange={setManual사용자} required />
          </FormField>
          <SubmitButton text="제출하기" isLoading={isSubmittingManual} />
        </FormFieldList>
        {manualError && <p className="text-body text-core-status-negative">{manualError.message}</p>}
        <span
          onClick={handleReset}
          className="cursor-pointer text-body text-content-standard-tertiary underline duration-100 hover:opacity-75 active:scale-95 active:opacity-50">
          처음부터 다시하기
        </span>
      </Container>
    );
  }

  return null;
}
