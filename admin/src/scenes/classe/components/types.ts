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
};

export type InfoBus = {
  busId: string;
  departureDate: string;
  meetingHour: string;
  departureHour: string;
  returnDate: string;
  returnHour: string;
};
