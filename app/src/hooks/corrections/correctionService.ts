import { CORRECTION_STEPS } from "@/utils/navigation";
import { CorrectionRequestType, YoungType } from "snu-lib";

export type Step = keyof typeof CORRECTION_STEPS;

export type CorrectionsMapByStep = {
  [key in keyof typeof CORRECTION_STEPS]?: string;
};

export type CorrectionMap = Partial<{
  [key in keyof typeof CORRECTION_STEPS]: {
    fields: string[];
    url: string;
  };
}>;

export function getCorrectionsMapByStep(young: YoungType, map: CorrectionMap, step: Step): CorrectionsMapByStep {
  if (!young.correctionRequests) return {} as CorrectionsMapByStep;

  const keyList = map[step];
  if (!keyList) throw new Error("Invalid step");

  return young.correctionRequests.reduce((acc, curr) => {
    if (["SENT", "REMINDED"].includes(curr.status) && keyList.fields.includes(curr.field)) {
      acc[curr.field] = curr.message;
    }
    return acc;
  }, {} as CorrectionsMapByStep);
}

export function getCorrectionsListByStep(young: YoungType, correctionMap: CorrectionMap, step: Step): CorrectionRequestType[] {
  if (!young.correctionRequests) return [] as CorrectionRequestType[];

  const fields = correctionMap[step]?.fields;
  if (!fields) throw new Error("Invalid step");

  const requests = young.correctionRequests.map((e) => e.toObject()) as CorrectionRequestType[];
  return requests.filter((e) => e.cohort === young.cohort && ["SENT", "REMINDED"].includes(e.status) && fields.includes(e.field));
}

export function getCorrectionUrlByField(correctionMap: CorrectionMap, field: string): string {
  const url = Object.values(correctionMap).find((correction) => correction.fields.includes(field))?.url;
  if (!url) throw new Error("Invalid field");
  return url;
}
