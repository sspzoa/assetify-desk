import { atom } from "jotai";

import type { AskTicketDetail } from "@/types/askTicket";

export const askTicketDetailAtom = atom<AskTicketDetail | null>(null);

export const copyStatusAtom = atom<"idle" | "copied">("idle");
