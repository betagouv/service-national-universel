import { UserSaved } from "snu-lib";

export type Rights = {
  canEdit: boolean;
  canEditCohort: boolean;
  canEditCenter: boolean;
  canEditPDR: boolean;
  showCohort: boolean;
  showCenter: boolean;
  showPDR: boolean;
  canEditEstimatedSeats: boolean;
  canEditTotalSeats: boolean;
  canEditColoration: boolean;
  canEditRef: boolean;
};

export type InfoBus = {
  busId: string;
  departureDate: string;
  meetingHour: string;
  departureHour: string;
  returnDate: string;
  returnHour: string;
};

type ClasseUpdateOperation = {
  op: "add" | "remove" | "replace";
  path: string;
  value?: string;
  originalValue?: string;
};

export type ClassePatchesType = {
  _id: string;
  ops: ClasseUpdateOperation[];
  modelName: "classe";
  ref: string;
  date: string;
  user?: UserSaved;
};

export type ClasseYoungPatchesType = {
  _id: string;
  ops: ClasseUpdateOperation[];
  modelName: "young";
  ref: string;
  date: string;
  user?: UserSaved;
  young: { firstName: string; lastName: string };
  oldStudent?: boolean;
};
