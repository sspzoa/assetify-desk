import { atom } from "jotai";

export interface LicenseData {
  [key: string]: string;
}

export interface LicenseResult {
  licenseType: string;
  data: LicenseData[];
}

export const LicenseResultsAtom = atom<LicenseResult[]>([]);
