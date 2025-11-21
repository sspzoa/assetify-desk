export type AskTicketDetail = {
  id: string;
  url: string | null;
  createdTime: string;
  lastEditedTime: string;
  detail?: string;
  corporation?: string;
  inquiryType?: string;
  urgency?: string;
  assetNumber?: string;
  department?: string;
  requester?: string;
  status?: string;
  assignee?: string;
  attachments?: string[];
};
