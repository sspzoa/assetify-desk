// Notion 텍스트 스팬 타입
export type NotionTextSpan = {
  plain_text?: string | null; // 일반 텍스트
};

// Notion 선택 옵션 타입
export type NotionSelectOption = {
  name?: string | null; // 옵션명
};

// Notion 선택 속성 타입 (단일/다중 선택, 상태)
export type NotionSelectProperty =
  | {
      select?: { options?: NotionSelectOption[] }; // 단일 선택
      multi_select?: { options?: NotionSelectOption[] }; // 다중 선택
      status?: { options?: NotionSelectOption[] }; // 상태
    }
  | undefined;

// Notion 속성 값 타입
export type NotionPropertyValue = {
  type: string; // 속성 타입
  title?: NotionTextSpan[]; // 제목
  rich_text?: NotionTextSpan[]; // 리치 텍스트
  select?: { name?: string | null } | null; // 단일 선택 값
  multi_select?: Array<{ name?: string | null }> | null; // 다중 선택 값
  status?: { name?: string | null } | null; // 상태 값
  people?: Array<{ name?: string | null }> | null; // 사람 목록
  files?: Array<{ name?: string | null }> | null; // 파일 목록
  checkbox?: boolean; // 체크박스
  date?: { start?: string | null; end?: string | null } | null; // 날짜
  number?: number | null; // 숫자
};

// Notion 데이터베이스 응답 타입
export type NotionDatabaseResponse = {
  properties?: Record<string, NotionSelectProperty>; // 속성 목록
};

// Notion 페이지 응답 타입
export type NotionPageResponse = {
  id: string; // 페이지 ID
  url?: string | null; // 페이지 URL
  created_time: string; // 생성 시간
  last_edited_time: string; // 마지막 수정 시간
  archived?: boolean; // 보관 여부
  properties?: Record<string, NotionPropertyValue>; // 속성 값 목록
};
