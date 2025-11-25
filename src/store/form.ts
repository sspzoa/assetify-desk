import { atom } from "jotai";

import type {
  FindLicenseFormOptions,
  FindLicenseFormState,
  FormResult,
  InquiryFormOptions,
  InquiryFormState,
  RepairFormOptions,
  RepairFormState,
} from "@/types/ticket";

// 문의 폼 초기 상태
export const initialInquiryFormState: InquiryFormState = {
  corporation: "",
  department: "",
  assetNumber: "",
  inquiryType: "",
  detail: "",
  urgency: "",
  requester: "",
  attachments: [],
};

// 수리 폼 초기 상태
export const initialRepairFormState: RepairFormState = {
  corporation: "",
  department: "",
  assetNumber: "",
  urgency: "",
  issueType: "",
  detail: "",
  location: "",
  requester: "",
  attachments: [],
  consent: false,
};

// 문의 폼 옵션 초기값
export const initialInquiryFormOptions: InquiryFormOptions = {
  corporations: [],
  inquiryTypes: [],
  urgencies: [],
};

// 수리 폼 옵션 초기값
export const initialRepairFormOptions: RepairFormOptions = {
  corporations: [],
  urgencies: [],
  issueTypes: [],
};

// 라이센스 찾기 폼 초기 상태
export const initialFindLicenseFormState: FindLicenseFormState = {
  corporation: "",
  requester: "",
};

// 라이센스 찾기 폼 옵션 초기값
export const initialFindLicenseFormOptions: FindLicenseFormOptions = {
  corporations: [],
};

// 문의 폼 상태 아톰
export const inquiryFormStateAtom = atom<InquiryFormState>(
  initialInquiryFormState,
);
// 문의 폼 결과 아톰
export const inquiryFormResultAtom = atom<FormResult>(null);

// 수리 폼 상태 아톰
export const repairFormStateAtom = atom<RepairFormState>(
  initialRepairFormState,
);
// 수리 폼 결과 아톰
export const repairFormResultAtom = atom<FormResult>(null);

// 라이센스 찾기 폼 상태 아톰
export const findLicenseFormStateAtom = atom<FindLicenseFormState>(
  initialFindLicenseFormState,
);
// 라이센스 찾기 폼 결과 아톰
export const findLicenseFormResultAtom = atom<FormResult>(null);

// 링크 복사 상태 아톰
export const copyStatusAtom = atom<"idle" | "copied">("idle");

// 취소 상태 타입 정의
export type CancelStatus =
  | { state: "idle" } // 대기 상태
  | { state: "pending" } // 처리 중
  | { state: "error"; message: string }; // 에러 발생

// 문의 티켓 취소 상태 아톰
export const inquiryCancelStatusAtom = atom<CancelStatus>({ state: "idle" });
// 수리 티켓 취소 상태 아톰
export const repairCancelStatusAtom = atom<CancelStatus>({ state: "idle" });
