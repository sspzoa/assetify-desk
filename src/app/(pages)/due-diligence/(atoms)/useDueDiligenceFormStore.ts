import { atom } from "jotai";

export const DueDiligenceFormAssetIdAtom = atom<string>("");

export const DueDiligenceFoundPageIdAtom = atom<string | null>(null);
export const DueDiligenceFound법인명Atom = atom<string>("");
export const DueDiligenceFound부서Atom = atom<string>("");
export const DueDiligenceFound사용자Atom = atom<string>("");
export const DueDiligenceFound제조사Atom = atom<string>("");
export const DueDiligenceFound실사확인Atom = atom<boolean>(false);

export const DueDiligenceManual법인명Atom = atom<string>("");
export const DueDiligenceManual부서Atom = atom<string>("");
export const DueDiligenceManual사용자Atom = atom<string>("");

export const DueDiligenceStepAtom = atom<"input" | "confirm" | "manual">("input");
