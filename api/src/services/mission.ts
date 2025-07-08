import { ReferentType } from "snu-lib";

export const getTutorName = (referent: Pick<ReferentType, "firstName" | "lastName"> | null) => {
  if (!referent) return " ";
  return `${referent.firstName} ${referent.lastName}`;
};
