import { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } from "./youngDocument";
import { YoungDocument, YoungModel, YoungType } from "../models";
import { ERRORS, YOUNG_PHASE, YOUNG_STATUS, YOUNG_STATUS_PHASE1, YoungDto, FUNCTIONAL_ERRORS } from "snu-lib";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";
import { format } from "date-fns";
import { CohesionCenterModel, SessionPhase1Model, CohortModel, LigneBusModel, LigneToPointModel, PointDeRassemblementModel, DepartmentServiceModel } from "../models";

export const generateConvocationsForMultipleYoungs = async (youngs: YoungDto[]): Promise<Buffer> => {
  const validStatus: Record<string, boolean> = {
    [YOUNG_STATUS_PHASE1.AFFECTED]: true,
    [YOUNG_STATUS_PHASE1.DONE]: true,
    [YOUNG_STATUS_PHASE1.NOT_DONE]: true,
  };
  const validatedYoungsWithSession = youngs.filter((young) => {
    if (young.status !== YOUNG_STATUS.VALIDATED || !young.sessionPhase1Id) {
      return false;
    }

    if (!validStatus[young.statusPhase1 as string]) {
      return false;
    }

    if (!young.sessionPhase1Id || (!isLocalTransport(young) && !young.meetingPointId && young.deplacementPhase1Autonomous !== "true" && young.source !== "CLE")) {
      return false;
    }

    return true;
  });
  if (validatedYoungsWithSession.length === 0) {
    throw new Error(FUNCTIONAL_ERRORS.NO_YOUNG_IN_EXPECTED_STATUS);
  }
  if (validatedYoungsWithSession.length > 100) {
    throw new Error(FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE);
  }
  return await generatePdfIntoBuffer({
    type: YOUNG_DOCUMENT.CONVOCATION_BATCH,
    template: YOUNG_DOCUMENT_PHASE_TEMPLATE.COHESION,
    young: validatedYoungsWithSession,
  });
};

export const generateImageRightForMultipleYoungs = async (youngs: YoungDto[]): Promise<Buffer> => {
  const validStatus: Record<string, boolean> = {
    [YOUNG_STATUS.VALIDATED]: true,
    [YOUNG_STATUS.IN_PROGRESS]: true,
    [YOUNG_STATUS.WAITING_CORRECTION]: true,
    [YOUNG_STATUS.WAITING_VALIDATION]: true,
  };
  const youngsWithImageRights = youngs.filter((young) => validStatus[young.status as string] && (young.imageRight === "true" || young.imageRight === "false"));
  if (youngsWithImageRights.length === 0) {
    throw new Error(FUNCTIONAL_ERRORS.NO_YOUNG_IN_EXPECTED_STATUS);
  }
  if (youngsWithImageRights.length > 100) {
    throw new Error(FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE);
  }
  return await generatePdfIntoBuffer({
    type: YOUNG_DOCUMENT.IMAGE_RIGHT_BATCH,
    template: YOUNG_DOCUMENT_PHASE_TEMPLATE.IMAGE_RIGHT,
    young: youngsWithImageRights,
  });
};
export const generateConsentementForMultipleYoungs = async (youngs: YoungDto[]): Promise<Buffer> => {
  const validStatus: Record<string, boolean> = {
    [YOUNG_STATUS.VALIDATED]: true,
    [YOUNG_STATUS.IN_PROGRESS]: true,
    [YOUNG_STATUS.WAITING_CORRECTION]: true,
    [YOUNG_STATUS.WAITING_VALIDATION]: true,
  };
  const youngsParentAllowSNU = youngs.filter((young) => validStatus[young.status as string] && young.parentAllowSNU === "true");

  if (youngsParentAllowSNU.length === 0) {
    throw new Error(FUNCTIONAL_ERRORS.NO_YOUNG_IN_EXPECTED_STATUS);
  }
  if (youngsParentAllowSNU.length > 100) {
    throw new Error(FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE);
  }
  return await generatePdfIntoBuffer({
    type: YOUNG_DOCUMENT.CONSENT_BATCH,
    template: YOUNG_DOCUMENT_PHASE_TEMPLATE.CONSENT,
    young: youngsParentAllowSNU,
  });
};

export const getYoungValidationDate = (young) => {
  const validationDate = young.parent1ValidationDate
    ? format(new Date(young.parent1ValidationDate), "dd/MM/yyyy à HH:mm")
    : young.parent2ValidationDate
      ? format(new Date(young.parent2ValidationDate), "dd/MM/yyyy à HH:mm")
      : format(new Date(), "dd/MM/yyyy à HH:mm");
  return validationDate;
};

export const isLocalTransport = (young) => {
  return young.transportInfoGivenByLocal === "true";
};

export const getMeetingAddress = (young, meetingPoint, center) => {
  if (young.deplacementPhase1Autonomous === "true" || !meetingPoint) return `${center.address} ${center.zip} ${center.city}`;
  const complement = meetingPoint?.complementAddress.find((c) => c.cohort === young.cohort);
  const complementText = complement?.complement ? ", " + complement.complement : "";
  return meetingPoint.name + ", " + meetingPoint.address + " " + meetingPoint.zip + " " + meetingPoint.city + complementText;
};

export const fetchDataForYoungCertificate = async (young) => {
  const session = await SessionPhase1Model.findById(young.sessionPhase1Id);
  if (!session) throw new Error(`session ${young.sessionPhase1Id} not found for young ${young._id}`);
  const center = await CohesionCenterModel.findById(session.cohesionCenterId);
  if (!center) throw new Error(`center ${session.cohesionCenterId} not found for young ${young._id} - session ${session._id}`);

  const cohort = await CohortModel.findOne({ name: young.cohort });
  if (!cohort) throw new Error(`cohort ${young.cohort} not found for young ${young._id}`);
  cohort.dateStart.setMinutes(cohort.dateStart.getMinutes() - cohort.dateStart.getTimezoneOffset());
  cohort.dateEnd.setMinutes(cohort.dateEnd.getMinutes() - cohort.dateEnd.getTimezoneOffset());

  let service = null;
  if (young.source !== "CLE") {
    service = await DepartmentServiceModel.findOne({ department: young.department });
    if (!service) throw new Error(`service not found for young ${young._id}, center ${center?._id} in department ${young?.department}`);
  }

  let meetingPoint = null;
  let ligneToPoint = null;
  let ligneBus = null;
  if (!isLocalTransport(young)) {
    meetingPoint = await PointDeRassemblementModel.findById(young.meetingPointId);

    if (meetingPoint && young.ligneId) {
      ligneBus = await LigneBusModel.findById(young.ligneId);
      ligneToPoint = await LigneToPointModel.findOne({ lineId: young.ligneId, meetingPointId: young.meetingPointId });
    }
  }

  return { session, cohort, center, service, meetingPoint, ligneBus, ligneToPoint };
};

export const getCertificateTemplate = (young) => {
  if (young.cohort === "Octobre 2023 - NC" && young.source !== "CLE") {
    return "convocation/convocation_template_base_NC.png";
  }
  return "convocation/convocation_template_base_2024_V2.png";
};

export const findYoungsByClasseId = async (classeId: string): Promise<YoungDto[]> => {
  return YoungModel.find({ classeId });
};

export const shouldSwitchYoungByIdToLC = async (youngId: string, newYoungStatus: keyof typeof YOUNG_STATUS): Promise<boolean> => {
  const young = await findYoungByIdOrThrow(youngId);
  return young.status === YOUNG_STATUS.VALIDATED && young.phase === YOUNG_PHASE.INSCRIPTION && newYoungStatus === YOUNG_STATUS.WAITING_LIST;
};

export const findYoungByIdOrThrow = async (youngId: string): Promise<YoungDocument> => {
  const young = await YoungModel.findById(youngId);
  if (!young) {
    throw new Error(ERRORS.YOUNG_NOT_FOUND);
  }
  return young;
};

export const switchYoungByIdToLC = async (youngId: string): Promise<YoungType> => {
  const young = await findYoungByIdOrThrow(youngId);
  young.set({
    cohesionCenterId: undefined,
    sessionPhase1Id: undefined,
    meetingPointId: undefined,
    ligneId: undefined,
    deplacementPhase1Autonomous: undefined,
    transportInfoGivenByLocal: undefined,
    cohesionStayPresence: undefined,
    presenceJDM: undefined,
    departInform: undefined,
    departSejourAt: undefined,
    departSejourMotif: undefined,
    departSejourMotifComment: undefined,
    youngPhase1Agreement: "false",
    hasMeetingInformation: undefined,
    cohesionStayMedicalFileReceived: undefined,
  });
  return await young.save();
};
