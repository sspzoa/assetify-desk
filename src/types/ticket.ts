// 티켓 기본 상세 정보 타입
export type BaseTicketDetail = {
  id: string; // 티켓 고유 ID
  url: string | null; // Notion 페이지 URL
  createdTime: string; // 생성 시간
  lastEditedTime: string; // 마지막 수정 시간
  archived?: boolean; // 보관 여부
  detail?: string; // 상세 내용
  corporation?: string; // 법인
  urgency?: string; // 긴급도
  assetNumber?: string; // 자산 번호
  department?: string; // 부서
  requester?: string; // 요청자
  status?: string; // 처리 상태
  assignee?: string; // 담당자
  attachments?: string[]; // 첨부파일 목록
};

// 문의 티켓 상세 정보 타입
export type InquiryTicketDetail = BaseTicketDetail & {
  inquiryType?: string; // 문의 유형
};

// 수리 티켓 상세 정보 타입
export type RepairTicketDetail = BaseTicketDetail & {
  team?: string; // 담당 팀
  issueTypes?: string[]; // 문제 유형 목록
  location?: string; // 위치
  progressStatus?: string; // 진행 상태
  actionNotes?: string; // 조치 내용
  liability?: string; // 책임 구분
  schedule?: string; // 일정
  price?: string; // 비용
};

// 폼 기본 상태 타입
export type BaseFormState = {
  corporation: string; // 법인
  department: string; // 부서
  assetNumber: string; // 자산 번호
  urgency: string; // 긴급도
  detail: string; // 상세 내용
  requester: string; // 요청자
  attachments: string[]; // 첨부파일 목록
};

// 문의 폼 상태 타입
export type InquiryFormState = BaseFormState & {
  inquiryType: string; // 문의 유형
};

// 수리 폼 상태 타입
export type RepairFormState = BaseFormState & {
  issueType: string; // 문제 유형
  location: string; // 위치
  consent: boolean; // 동의 여부
};

// 라이센스 찾기 폼 상태 타입
export type FindLicenseFormState = {
  corporation: string; // 법인
  requester: string; // 이름
};

// 폼 제출 결과 타입
export type FormResult = {
  id?: string; // 생성된 티켓 ID
  error?: string; // 에러 메시지
} | null;

// 폼 옵션 기본 타입
export type BaseFormOptions = {
  corporations: string[]; // 법인 목록
  urgencies: string[]; // 긴급도 목록
};

// 문의 폼 옵션 타입
export type InquiryFormOptions = BaseFormOptions & {
  inquiryTypes: string[]; // 문의 유형 목록
};

// 수리 폼 옵션 타입
export type RepairFormOptions = BaseFormOptions & {
  issueTypes: string[]; // 문제 유형 목록
};

// 라이센스 찾기 폼 옵션 타입
export type FindLicenseFormOptions = {
  corporations: string[]; // 법인 목록
};

// 티켓 종류 타입
export type TicketType = "inquiry" | "repair";
