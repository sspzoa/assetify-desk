/**
 * 라이센스 데이터베이스 설정
 * 각 라이센스 데이터베이스는 서로 다른 속성명을 가질 수 있음
 */

export type LicenseSearchConfig = {
  userProperty: string; // 사용자/이름 속성명
  corporationProperty: string; // 법인 속성명
  userPropertyType: "title" | "rich_text"; // 사용자 속성 타입
  resultProperties: string[]; // 결과에 포함할 속성 목록
};

export const LICENSE_CONFIGS: Record<string, LicenseSearchConfig> = {
  MS_OFFICE: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["시리얼넘버"],
  },
  MS365: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["시리얼넘버"],
  },
  HANCOM_OFFICE: {
    userProperty: "이름",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["시리얼넘버"],
  },
  EZ_PDF: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["시리얼넘버"],
  },
  ADOBE_PDF: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["시리얼넘버/win", "시리얼넘버/MAC"],
  },
  ADOBE_CREATIVE_CLOUD: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["등록 계정", "라이선스 구분"],
  },
  ADOBE_PHOTO_SHOP: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["등록계정"],
  },
  ADOBE_ILLUSTRATOR: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["등록계정"],
  },
  ADOBE_PREMIERE_PRO: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["등록계정"],
  },
  AUTOCAD: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["시리얼넘버", "Product Key"],
  },
  MAC_MS_OFFICE: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["시리얼넘버"],
  },
  MAC_HANCOM_OFFICE: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["라이선스키", "소프트웨어명"],
  },
  ETC: {
    userProperty: "사용자명",
    corporationProperty: "법인명",
    userPropertyType: "title",
    resultProperties: ["시리얼넘버", "소프트웨어"],
  },
};
