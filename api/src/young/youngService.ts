import { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } from "./youngDocument";
import { YoungDocument, YoungModel, YoungType } from "../models";
import { ERRORS, YOUNG_PHASE, YOUNG_STATUS, YOUNG_STATUS_PHASE1, YoungDto, FUNCTIONAL_ERRORS } from "snu-lib";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";

export const generateConvocationsForMultipleYoungs = async (youngs: YoungDto[]): Promise<Buffer> => {
  const validatedYoungsWithSession = youngs.filter((young) => young.status === YOUNG_STATUS.VALIDATED && young.sessionPhase1Id);
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
  const youngsWithImageRights = youngs.filter((young) => young.imageRight === "true" || young.imageRight === "false");
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
  const youngsParentAllowSNU = youngs.filter((young) => young.parentAllowSNU === "true");
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
