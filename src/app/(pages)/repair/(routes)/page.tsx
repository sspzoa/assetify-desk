"use client";

import { useAtom } from "jotai";
import {
  RepairForm고장내역Atom,
  RepairForm고장증상Atom,
  RepairForm긴급도Atom,
  RepairForm문의자Atom,
  RepairForm법인Atom,
  RepairForm부서Atom,
  RepairForm수리진행동의서Atom,
  RepairForm실제근무위치Atom,
  RepairForm자산번호Atom,
} from "@/app/(pages)/repair/(atoms)/useRepairFormStore";
import {
  RepairOptions고장내역Atom,
  RepairOptions긴급도Atom,
  RepairOptions법인Atom,
} from "@/app/(pages)/repair/(atoms)/useRepairOptionsStore";
import { useRepairForm } from "@/app/(pages)/repair/(hooks)/useRepairForm";
import { useRepairOptions } from "@/app/(pages)/repair/(hooks)/useRepairOptions";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import {
  CheckboxOption,
  FormField,
  FormFieldList,
  RadioOption,
  RichTextInput,
  SelectOption,
  TextInput,
} from "@/shared/components/form/form-fields";
import SubmitButton from "@/shared/components/form/submit-button";

export default function Repair() {
  const { isLoading, error } = useRepairOptions();

  const [법인Options] = useAtom(RepairOptions법인Atom);
  const [고장내역Options] = useAtom(RepairOptions고장내역Atom);
  const [긴급도Options] = useAtom(RepairOptions긴급도Atom);

  const [법인, set법인] = useAtom(RepairForm법인Atom);
  const [부서, set부서] = useAtom(RepairForm부서Atom);
  const [문의자, set문의자] = useAtom(RepairForm문의자Atom);
  const [실제근무위치, set실제근무위치] = useAtom(RepairForm실제근무위치Atom);
  const [자산번호, set자산번호] = useAtom(RepairForm자산번호Atom);
  const [고장내역, set고장내역] = useAtom(RepairForm고장내역Atom);
  const [고장증상, set고장증상] = useAtom(RepairForm고장증상Atom);
  const [긴급도, set긴급도] = useAtom(RepairForm긴급도Atom);
  const [수리진행동의서, set수리진행동의서] = useAtom(RepairForm수리진행동의서Atom);

  const { isSubmitting, handleSubmit } = useRepairForm();

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <Container>
      <Header title="Repair" highlighted="Form" />
      <FormFieldList onSubmit={handleSubmit}>
        <FormField title="법인명" required>
          <SelectOption options={법인Options} value={법인} onChange={set법인} required />
        </FormField>
        <FormField title="부서">
          <TextInput placeholder="ex. 경영지원팀 or 자산관리파트" value={부서} onChange={set부서} />
        </FormField>
        <FormField title="문의자 성함" required>
          <TextInput placeholder="ex. 김자산" value={문의자} onChange={set문의자} required />
        </FormField>
        <FormField
          title="실제 근무 위치"
          description="ex. 용인연구소 → 경기 용인시 처인구 포곡읍 두계로 72
향남공장 → 경기 화성시 향남읍 제약공단4길 35-14
본사/신관/S빌딩은 신관 3층 자산관리파트에서 직접 수리 요청 받고 있습니다.
본사/신관/S빌딩 근무하시는 분들은 “본사”로 기재해 주시기 바랍니다."
          required>
          <TextInput placeholder="ex. 본사" value={실제근무위치} onChange={set실제근무위치} required />
        </FormField>
        <FormField title="자산 번호" description="수리가 필요한 기기에 붙어있는 자산 번호를 적어주세요.">
          <TextInput placeholder="ex. 2309-N0001" value={자산번호} onChange={set자산번호} />
        </FormField>
        <FormField title="고장 내역" description="고장 유형을 선택해 주세요." required>
          <RadioOption options={고장내역Options} value={고장내역} onChange={set고장내역} />
        </FormField>
        <FormField title="고장 증상" description="고장 증상을 구체적으로 입력해 주세요." required>
          <RichTextInput
            placeholder="ex. 노트북 화면에 검은 줄이 생기고, 간헐적으로 화면이 깜빡입니다."
            required
            value={고장증상}
            onChange={set고장증상}
          />
        </FormField>
        <FormField title="긴급도" required>
          <RadioOption options={긴급도Options} value={긴급도} onChange={set긴급도} required />
        </FormField>
        <FormField
          title="수리 진행 동의서"
          description="수리 진행 시 수리 비용이 청구되며
사용자 과실이 판단되지 않으면 법인에서 100%를 지급하며,
사용자 과실이 명확할 경우 사용자에게 수리비의 50%가 청구됩니다. (법인 50% 부담)"
          required>
          <CheckboxOption
            label="수리 진행에 동의합니다."
            checked={수리진행동의서}
            onChange={set수리진행동의서}
            required
          />
        </FormField>
        <SubmitButton text="제출하기" isLoading={isSubmitting} />
      </FormFieldList>
    </Container>
  );
}
