export type NotionTextSpan = {
  plain_text?: string | null;
};

export type NotionSelectOption = {
  name?: string | null;
};

export type NotionSelectProperty =
  | {
      select?: { options?: NotionSelectOption[] };
      multi_select?: { options?: NotionSelectOption[] };
      status?: { options?: NotionSelectOption[] };
    }
  | undefined;

export type NotionPropertyValue = {
  type: string;
  title?: NotionTextSpan[];
  rich_text?: NotionTextSpan[];
  select?: { name?: string | null } | null;
  multi_select?: Array<{ name?: string | null }> | null;
  status?: { name?: string | null } | null;
  people?: Array<{ name?: string | null }> | null;
  files?: Array<{ name?: string | null }> | null;
  checkbox?: boolean;
  date?: { start?: string | null; end?: string | null } | null;
  number?: number | null;
};

export type NotionDatabaseResponse = {
  properties?: Record<string, NotionSelectProperty>;
};

export type NotionPageResponse = {
  id: string;
  url?: string | null;
  created_time: string;
  last_edited_time: string;
  archived?: boolean;
  properties?: Record<string, NotionPropertyValue>;
};
