const isStepPDRDone = (young) =>
  (young?.meetingPointId !== null && young?.meetingPointId !== undefined) || young?.deplacementPhase1Autonomous === "true" || young?.transportInfoGivenByLocal === "true";
const isStepAgreementDone = (young) => isStepPDRDone && young?.youngPhase1Agreement === "true";
const isStepConvocationDone = (young) => isStepAgreementDone && young?.convocationFileDownload === "true";
const isStepMedicalFieldDone = (young) => isStepConvocationDone && young?.cohesionStayMedicalFileDownload === "true";

const numberOfStepsCompleted = (young) => {
  if (isStepMedicalFieldDone(young)) return 4;
  if (isStepConvocationDone(young)) return 3;
  if (isStepAgreementDone(young)) return 2;
  if (isStepPDRDone(young)) return 1;
  return 0;
};

const ALONE_ARRIVAL_HOUR = "16h";
const ALONE_DEPARTURE_HOUR = "11h";

export { isStepPDRDone, isStepAgreementDone, isStepConvocationDone, isStepMedicalFieldDone, numberOfStepsCompleted, ALONE_ARRIVAL_HOUR, ALONE_DEPARTURE_HOUR };
