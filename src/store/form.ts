import { atom } from "jotai";

import type {
  AskFormOptions,
  AskFormState,
  FormResult,
  RepairFormOptions,
  RepairFormState,
} from "@/types/ticket";

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

export const initialAskFormOptions: AskFormOptions = {
  corporations: [],
  inquiryTypes: [],
  urgencies: [],
};

export const initialRepairFormOptions: RepairFormOptions = {
  corporations: [],
  urgencies: [],
  issueTypes: [],
};

export const askFormStateAtom = atom<AskFormState>(initialAskFormState);
export const askFormResultAtom = atom<FormResult>(null);

export const repairFormStateAtom = atom<RepairFormState>(
  initialRepairFormState,
);
export const repairFormResultAtom = atom<FormResult>(null);

export const copyStatusAtom = atom<"idle" | "copied">("idle");

export type CancelStatus =
  | { state: "idle" }
  | { state: "pending" }
  | { state: "error"; message: string };

export const askCancelStatusAtom = atom<CancelStatus>({ state: "idle" });
export const repairCancelStatusAtom = atom<CancelStatus>({ state: "idle" });
