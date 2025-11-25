import { getPlainText, getSelectName } from "@/utils/notion/helpers";
import type { NotionPropertyValue } from "@/utils/notion/types";

import type { LicenseSearchConfig } from "./license-config";

export type ParsedLicenseResult = {
  id: string;
  properties: Record<string, string | null>;
};

/**
 * 라이센스 설정을 기반으로 Notion 페이지 결과를 파싱
 */
export function parseLicenseResult(
  page: {
    id: string;
    properties?: Record<string, NotionPropertyValue>;
  },
  config: LicenseSearchConfig,
): ParsedLicenseResult {
  const properties = page.properties ?? {};
  const parsed: Record<string, string | null> = {};

  // 설정에 정의된 속성만 추출
  config.resultProperties.forEach((propName) => {
    const prop = properties[propName];
    if (!prop) {
      parsed[propName] = null;
      return;
    }

    // 속성 타입에 따라 값 추출 시도
    const plainText = getPlainText(prop);
    const selectValue = getSelectName(prop);

    parsed[propName] = plainText || selectValue || null;
  });

  return {
    id: page.id,
    properties: parsed,
  };
}
