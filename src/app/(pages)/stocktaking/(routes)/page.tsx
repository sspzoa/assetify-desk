"use client";

import { useAtom, useAtomValue } from "jotai";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
import {
  StocktakingForm법인명Atom,
  StocktakingForm부서Atom,
  StocktakingForm사용자Atom,
  StocktakingForm자산번호Atom,
} from "@/app/(pages)/stocktaking/(atoms)/useStocktakingFormStore";
import { StocktakingOptions법인명Atom } from "@/app/(pages)/stocktaking/(atoms)/useStocktakingOptionsStore";
import { useStocktakingForm } from "@/app/(pages)/stocktaking/(hooks)/useStocktakingForm";
import { useStocktakingOptions } from "@/app/(pages)/stocktaking/(hooks)/useStocktakingOptions";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { FormField, FormFieldList, SelectOption, TextInput } from "@/shared/components/form/form-fields";
import SubmitButton from "@/shared/components/form/submit-button";

export default function Stocktaking() {
  // const router = useRouter();
  const { isLoading, error } = useStocktakingOptions();
  const { isSubmitting, handleSubmit } = useStocktakingForm();

  // useEffect(() => {
  //   const hasParticipated = localStorage.getItem("stocktakingParticipated");
  //   if (hasParticipated === "true") {
  //     alert("이미 재고조사에 참여하셨습니다.");
  //     router.push("/");
  //   }
  // }, [router]);

  const 법인명Options = useAtomValue(StocktakingOptions법인명Atom);

  const [법인명, set법인명] = useAtom(StocktakingForm법인명Atom);
  const [부서, set부서] = useAtom(StocktakingForm부서Atom);
  const [사용자, set사용자] = useAtom(StocktakingForm사용자Atom);
  const [자산번호, set자산번호] = useAtom(StocktakingForm자산번호Atom);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <Container>
      <Header title="Stocktaking" highlighted="Form" />
      <FormFieldList onSubmit={handleSubmit}>
        <FormField title="법인명" required>
          <SelectOption options={법인명Options} value={법인명} onChange={set법인명} required />
        </FormField>
        <FormField title="부서" required>
          <TextInput placeholder="ex. 경영지원팀 or 자산관리파트" value={부서} onChange={set부서} required />
        </FormField>
        <FormField title="사용자" required>
          <TextInput placeholder="ex. 김자산" value={사용자} onChange={set사용자} required />
        </FormField>
        <FormField title="자산번호" required>
          <TextInput placeholder="ex. 2309-N0001" value={자산번호} onChange={set자산번호} required />
        </FormField>
        <SubmitButton text="제출하기" isLoading={isSubmitting} />
      </FormFieldList>
    </Container>
  );
}
