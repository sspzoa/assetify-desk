"use client";

import { useAtom } from "jotai";
import {
  LicenseForm법인명Atom,
  LicenseForm사용자명Atom,
} from "@/app/(pages)/license/(atoms)/useLicenseFormStore";
import { LicenseOptions법인명Atom } from "@/app/(pages)/license/(atoms)/useLicenseOptionsStore";
import { useLicenseOptions } from "@/app/(pages)/license/(hooks)/useLicenseOptions";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import {
  FormField,
  FormFieldList,
  SelectOption,
  TextInput,
} from "@/shared/components/form/form-fields";
import SubmitButton from "@/shared/components/form/submit-button";

export default function License() {
  const { isLoading, error } = useLicenseOptions();

  const [법인명Options] = useAtom(LicenseOptions법인명Atom);

  const [법인명, set법인명] = useAtom(LicenseForm법인명Atom);
  const [사용자명, set사용자명] = useAtom(LicenseForm사용자명Atom);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <Container>
      <Header title="License" highlighted="Finder" />
      <FormFieldList>
        <FormField title="법인명" required>
          <SelectOption
            options={법인명Options}
            value={법인명}
            onChange={set법인명}
            required
          />
        </FormField>
        <FormField title="사용자명" required>
          <TextInput
            value={사용자명}
            onChange={set사용자명}
            placeholder="ex. 김자산"
            required
          />
        </FormField>
        <SubmitButton text="라이선스 찾기" />
      </FormFieldList>
    </Container>
  );
}
