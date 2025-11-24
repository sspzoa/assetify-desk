export type BaseTicketDetail = {
  id: string;
  url: string | null;
  createdTime: string;
  lastEditedTime: string;
  archived?: boolean;
  detail?: string;
  corporation?: string;
  urgency?: string;
  assetNumber?: string;
  department?: string;
  requester?: string;
  status?: string;
  assignee?: string;
  attachments?: string[];
};

export type AskTicketDetail = BaseTicketDetail & {
  inquiryType?: string;
};

export type RepairTicketDetail = BaseTicketDetail & {
  team?: string;
  issueTypes?: string[];
  location?: string;
  progressStatus?: string;
  actionNotes?: string;
  liability?: string;
  schedule?: string;
  price?: string;
};

export type BaseFormState = {
  corporation: string;
  department: string;
  assetNumber: string;
  urgency: string;
  detail: string;
  requester: string;
  attachments: string[];
};

export type AskFormState = BaseFormState & {
  inquiryType: string;
};

export type RepairFormState = BaseFormState & {
  issueType: string;
  location: string;
  consent: boolean;
};

export type FormResult = {
  id?: string;
  error?: string;
} | null;

export type BaseFormOptions = {
  corporations: string[];
  urgencies: string[];
};

export type AskFormOptions = BaseFormOptions & {
  inquiryTypes: string[];
};

export type RepairFormOptions = BaseFormOptions & {
  issueTypes: string[];
};

export type TicketType = "ask" | "repair";
