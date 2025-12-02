"use client";

import { useAtom, useAtomValue } from "jotai";
import { use } from "react";
import { LicenseForm법인명Atom, LicenseForm사용자명Atom } from "@/app/(pages)/license/(atoms)/useLicenseFormStore";
import { LicenseOptions법인명Atom } from "@/app/(pages)/license/(atoms)/useLicenseOptionsStore";
import { LicenseResultsAtom } from "@/app/(pages)/license/(atoms)/useLicenseStore";
import SessionTimer from "@/app/(pages)/license/(components)/sessionTimer";
import { useLicenseForm } from "@/app/(pages)/license/(hooks)/useLicenseForm";
import { useLicenseOptions } from "@/app/(pages)/license/(hooks)/useLicenseOptions";
import Container from "@/shared/components/common/container";
import ErrorComponent from "@/shared/components/common/errorComponent";
import Header from "@/shared/components/common/header";
import LoadingComponent from "@/shared/components/common/loadingComponent";
import { FormField, FormFieldList, SelectOption, TextInput } from "@/shared/components/form/form-fields";
import SubmitButton from "@/shared/components/form/submit-button";

export default function License({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);

  const { isLoading, error } = useLicenseOptions(sessionId);

  const 법인명Options = useAtomValue(LicenseOptions법인명Atom);

  const [법인명, set법인명] = useAtom(LicenseForm법인명Atom);
  const [사용자명, set사용자명] = useAtom(LicenseForm사용자명Atom);

  const { isSubmitting, error: searchError, handleSubmit } = useLicenseForm(sessionId);
  const results = useAtomValue(LicenseResultsAtom);

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <Container>
      <Header title="License" highlighted="Finder" />
      <SessionTimer sessionId={sessionId} />
      <FormFieldList onSubmit={handleSubmit}>
        <FormField title="법인명" required>
          <SelectOption options={법인명Options} value={법인명} onChange={set법인명} required />
        </FormField>
        <FormField title="사용자명" required>
          <TextInput value={사용자명} onChange={set사용자명} placeholder="ex. 김자산" required />
        </FormField>
        <SubmitButton text="라이선스 찾기" isLoading={isSubmitting} />
      </FormFieldList>

      {searchError && <p className="text-core-status-negative text-label">{searchError.message}</p>}

      {results.length > 0 && (
        <FormFieldList>
          {results.map((result, index) => (
            <FormField key={index} title={`${result.licenseType}`}>
              {result.data.map((license, licenseIndex) => (
                <div
                  key={licenseIndex}
                  className="flex w-full flex-col gap-spacing-100 rounded-radius-400 border border-line-outline bg-components-fill-standard-secondary px-spacing-400 py-spacing-300">
                  {Object.entries(license).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-content-standard-secondary">{key}:</span>{" "}
                      <span className="font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </FormField>
          ))}
        </FormFieldList>
      )}
    </Container>
  );
}
