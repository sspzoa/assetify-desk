import { atom } from "jotai";

export type AskFormOptions = {
  corporations: string[];
  inquiryTypes: string[];
  urgencies: string[];
};

export type AskFormState = {
  corporation: string;
  department: string;
  assetNumber: string;
  inquiryType: string;
  detail: string;
  urgency: string;
  requester: string;
  attachments: string[];
};

export type AskFormResult = {
  id?: string;
  error?: string;
} | null;

export const initialAskFormOptions: AskFormOptions = {
  corporations: [],
  inquiryTypes: [],
  urgencies: [],
};

export const initialAskFormState: AskFormState = {
  corporation: "",
  department: "",
  assetNumber: "",
  inquiryType: "",
  detail: "",
  urgency: "",
  requester: "",
  attachments: [],
};

export const askFormStateAtom = atom<AskFormState>(initialAskFormState);
export const askFormResultAtom = atom<AskFormResult>(null);
