export interface InquiryRetrieveData {
  object: "data_source";
  id: string;
  cover: {
    type: "file";
    file: {
      url: string;
      expiry_time: string;
    };
  };
  icon: {
    type: "emoji";
    emoji: string;
  };
  created_time: string;
  created_by: {
    object: "user";
    id: string;
  };
  last_edited_by: {
    object: "user";
    id: string;
  };
  last_edited_time: string;
  title: Array<{
    type: "text";
    text: {
      content: string;
      link: null | string;
    };
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
    plain_text: string;
    href: null | string;
  }>;
  description: unknown[];
  is_inline: boolean;
  properties: {
    담당자: {
      id: string;
      name: string;
      description: null | string;
      type: "people";
      people: Record<string, unknown>;
    };
    Ticket: {
      id: string;
      name: string;
      description: null | string;
      type: "unique_id";
      unique_id: Record<string, unknown>;
    };
    첨부파일: {
      id: string;
      name: string;
      description: null | string;
      type: "files";
      files: Record<string, unknown>;
    };
    "Last edited": {
      id: string;
      name: string;
      description: null | string;
      type: "last_edited_time";
      last_edited_time: Record<string, unknown>;
    };
    문의제출시간: {
      id: string;
      name: string;
      description: null | string;
      type: "created_time";
      created_time: Record<string, unknown>;
    };
    상태: {
      id: string;
      name: string;
      description: null | string;
      type: "status";
      status: {
        options: Array<{
          id: string;
          name: string;
          color: string;
          description: null | string;
        }>;
        groups: Array<{
          id: string;
          name: string;
          color: string;
          option_ids: string[];
        }>;
      };
    };
    부서: {
      id: string;
      name: string;
      description: null | string;
      type: "rich_text";
      rich_text: Record<string, unknown>;
    };
    "Needed by": {
      id: string;
      name: string;
      description: null | string;
      type: "date";
      date: Record<string, unknown>;
    };
    Notes: {
      id: string;
      name: string;
      description: null | string;
      type: "rich_text";
      rich_text: Record<string, unknown>;
    };
    긴급도: {
      id: string;
      name: string;
      description: null | string;
      type: "select";
      select: {
        options: Array<{
          id: string;
          name: string;
          color: string;
          description: null | string;
        }>;
      };
    };
    최종편집자: {
      id: string;
      name: string;
      description: null | string;
      type: "last_edited_by";
      last_edited_by: Record<string, unknown>;
    };
    Team: {
      id: string;
      name: string;
      description: null | string;
      type: "select";
      select: {
        options: Array<{
          id: string;
          name: string;
          color: string;
          description: null | string;
        }>;
      };
    };
    법인: {
      id: string;
      name: string;
      description: null | string;
      type: "select";
      select: {
        options: Array<{
          id: string;
          name: string;
          color: string;
          description: null | string;
        }>;
      };
    };
    문의자: {
      id: string;
      name: string;
      description: null | string;
      type: "rich_text";
      rich_text: Record<string, unknown>;
    };
    문의유형: {
      id: string;
      name: string;
      description: null | string;
      type: "select";
      select: {
        options: Array<{
          id: string;
          name: string;
          color: string;
          description: null | string;
        }>;
      };
    };
    자산번호: {
      id: string;
      name: string;
      description: null | string;
      type: "rich_text";
      rich_text: Record<string, unknown>;
    };
    문의내용: {
      id: "title";
      name: string;
      description: null | string;
      type: "title";
      title: Record<string, unknown>;
    };
  };
  parent: {
    type: "database_id";
    database_id: string;
  };
  database_parent: {
    type: "block_id";
    block_id: string;
  };
  url: string;
  public_url: null | string;
  archived: boolean;
  in_trash: boolean;
  request_id: string;
}

export interface InquiryPageData {
  object: "page";
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    object: "user";
    id: string;
  };
  last_edited_by: {
    object: "user";
    id: string;
    name?: string;
    avatar_url: null | string;
    type: "person" | "bot";
    bot?: Record<string, unknown>;
  };
  cover: null;
  icon: null;
  parent: {
    type: "data_source_id";
    data_source_id: string;
    database_id: string;
  };
  archived: boolean;
  in_trash: boolean;
  is_locked: boolean;
  properties: {
    담당자: {
      id: string;
      type: "people";
      people: Array<Record<string, unknown>>;
    };
    Ticket: {
      id: string;
      type: "unique_id";
      unique_id: {
        prefix: null | string;
        number: number;
      };
    };
    첨부파일: {
      id: string;
      type: "files";
      files: Array<Record<string, unknown>>;
    };
    "Last edited": {
      id: string;
      type: "last_edited_time";
      last_edited_time: string;
    };
    "문의 제출 시간": {
      id: string;
      type: "created_time";
      created_time: string;
    };
    상태: {
      id: string;
      type: "status";
      status: {
        id: string;
        name: string;
        color: string;
      };
    };
    부서: {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | string;
        };
        annotations: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
        plain_text: string;
        href: null | string;
      }>;
    };
    "Needed by": {
      id: string;
      type: "date";
      date: null | string;
    };
    Notes: {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | string;
        };
        annotations: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
        plain_text: string;
        href: null | string;
      }>;
    };
    긴급도: {
      id: string;
      type: "select";
      select: {
        id: string;
        name: string;
        color: string;
      } | null;
    };
    최종편집자: {
      id: string;
      type: "last_edited_by";
      last_edited_by: {
        object: "user";
        id: string;
        name?: string;
        avatar_url: null | string;
        type: "person" | "bot";
        bot?: Record<string, unknown>;
      };
    };
    Team: {
      id: string;
      type: "select";
      select: {
        id: string;
        name: string;
        color: string;
      } | null;
    };
    법인: {
      id: string;
      type: "select";
      select: {
        id: string;
        name: string;
        color: string;
      } | null;
    };
    문의자: {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | string;
        };
        annotations: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
        plain_text: string;
        href: null | string;
      }>;
    };
    문의유형: {
      id: string;
      type: "select";
      select: {
        id: string;
        name: string;
        color: string;
      } | null;
    };
    자산번호: {
      id: string;
      type: "rich_text";
      rich_text: Array<{
        type: "text";
        text: {
          content: string;
          link: null | string;
        };
        annotations: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
        plain_text: string;
        href: null | string;
      }>;
    };
    문의내용: {
      id: "title";
      type: "title";
      title: Array<{
        type: "text";
        text: {
          content: string;
          link: null | string;
        };
        annotations: {
          bold: boolean;
          italic: boolean;
          strikethrough: boolean;
          underline: boolean;
          code: boolean;
          color: string;
        };
        plain_text: string;
        href: null | string;
      }>;
    };
  };
  url: string;
  public_url: null | string;
  request_id: string;
}
