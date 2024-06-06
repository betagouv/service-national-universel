export type Rights = {
  canEdit: boolean;
  canEditCohort: boolean;
  canEditCenter: boolean;
  canEditPDR: boolean;
  showCohort: boolean;
  showCenter: boolean;
  showPDR: boolean;
};

export type InfoBus = {
  busId: string;
  departureDate: string;
  meetingHour: string;
  departureHour: string;
  returnDate: string;
  returnHour: string;
};

export type TStatus =
  | "none"
  | "DRAFT"
  | "CANCEL"
  | "REFUSED"
  | "IN_PROGRESS"
  | "WAITING_VALIDATION"
  | "WAITING_CORRECTION"
  | "VALIDATED"
  | "WAITING_LIST"
  | "secondary"
  | "primary";