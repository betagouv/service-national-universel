import { format } from "date-fns";

import {
  ERRORS,
  FUNCTIONAL_ERRORS,
  getDepartmentForEligibility,
  isAdmin,
  UserDto,
  YOUNG_PHASE,
  YOUNG_SOURCE,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  YoungDto,
  YoungType,
} from "snu-lib";

import { ClasseModel, CohortModel, LigneBusModel, SessionPhase1Model, YoungDocument, YoungModel } from "../models";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";

import { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } from "./youngDocument";
import { isLocalTransport } from "./youngCertificateService";
import { logger } from "../logger";
import { getCompletionObjectifs } from "../services/inscription-goal";
import { updatePlacesSessionPhase1, updateSeatsTakenInBusLine } from "../utils";

export const generateConvocationsForMultipleYoungs = async (youngs: YoungDto[]): Promise<Buffer> => {
  const validatedYoungsWithSession = getValidatedYoungsWithSession(youngs);

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

export const getValidatedYoungsWithSession = (youngs: YoungDto[]) => {
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

    if (!isLocalTransport(young) && !young.meetingPointId && young.deplacementPhase1Autonomous !== "true" && young.source !== "CLE") {
      return false;
    }

    return true;
  });

  return validatedYoungsWithSession;
};

export const generateImageRightForMultipleYoungs = async (youngs: YoungDto[]): Promise<Buffer> => {
  const youngsWithImageRights = getYoungsImageRight(youngs);
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

export const getYoungsImageRight = (youngs: YoungDto[]) => {
  const validStatus: Record<string, boolean> = {
    [YOUNG_STATUS.VALIDATED]: true,
    [YOUNG_STATUS.IN_PROGRESS]: true,
    [YOUNG_STATUS.WAITING_CORRECTION]: true,
    [YOUNG_STATUS.WAITING_VALIDATION]: true,
  };
  const youngsWithImageRights = youngs.filter((young) => validStatus[young.status as string] && (young.imageRight === "true" || young.imageRight === "false"));
  return youngsWithImageRights;
};
export const generateConsentementForMultipleYoungs = async (youngs: YoungDto[]): Promise<Buffer> => {
  const youngsParentAllowSNU = getYoungsParentAllowSNU(youngs);

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

export const getYoungsParentAllowSNU = (youngs: YoungDto[]) => {
  const validStatus: Record<string, boolean> = {
    [YOUNG_STATUS.VALIDATED]: true,
    [YOUNG_STATUS.IN_PROGRESS]: true,
    [YOUNG_STATUS.WAITING_CORRECTION]: true,
    [YOUNG_STATUS.WAITING_VALIDATION]: true,
  };
  const youngsParentAllowSNU = youngs.filter((young) => validStatus[young.status as string] && young.parentAllowSNU === "true");
  return youngsParentAllowSNU;
};

export const getYoungValidationDate = (young: YoungDto) => {
  const validationDate = young.parent1ValidationDate
    ? format(new Date(young.parent1ValidationDate), "dd/MM/yyyy à HH:mm")
    : young.parent2ValidationDate
      ? format(new Date(young.parent2ValidationDate), "dd/MM/yyyy à HH:mm")
      : format(new Date(), "dd/MM/yyyy à HH:mm");
  return validationDate;
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

//@FIXME: Remove me when every young manually created are in status IN_PROGRESS or above
export const mightAddInProgressStatus = async (young: YoungDocument, user: UserDto) => {
  if (young.status === YOUNG_STATUS.IN_PROGRESS) {
    return;
  }
  const patches: any[] = await (young as any).patches.find({ ref: young.id });
  const flattedOps = patches?.flatMap((patch) => patch.ops);
  const opsWithInProgressStatus = flattedOps.some((op) => op.path === "/status" && op.value === YOUNG_STATUS.IN_PROGRESS);
  if (opsWithInProgressStatus) {
    return;
  }
  if (young.status === YOUNG_STATUS.VALIDATED) {
    young.set({ status: YOUNG_STATUS.IN_PROGRESS });
    await young.save({ fromUser: user });
    young.set({ status: YOUNG_STATUS.VALIDATED });
    await young.save({ fromUser: user });
    logger.info(`YoungService - mightAddInProgressStatus(), Status set to IN_PROGRESS for YoungId:${young.id}`);
  }
};

export const validateYoungPhase1 = async (young: YoungDocument, user: UserDto): Promise<YoungType> => {
  //From put("/young/:id"
  // first part
  const cohort = await CohortModel.findById(young.cohortId);
  if (!cohort) {
    throw new Error(ERRORS.COHORT_NOT_FOUND);
  }
  // schoolDepartment pour les scolarisés et HZR sinon department pour les non scolarisés
  const departement = getDepartmentForEligibility(young);
  const completionObjectif = await getCompletionObjectifs(departement, cohort.name);
  if (completionObjectif.isAtteint) {
    throw new Error(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REACHED);
    // remove this
    // return res.status(400).send({
    //   ok: false,
    //   code: completionObjectif.region.isAtteint ? FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REGION_REACHED : FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_REACHED,
    // });
  }

  // second part
  if (young.source === YOUNG_SOURCE.CLE) {
    const classe = await ClasseModel.findById(young.classeId);
    if (!classe) {
      throw new Error(ERRORS.CLASSE_NOT_FOUND);
    }
    const now = new Date();
    const isInsctructionOpen = now < cohort.instructionEndDate;
    const remainingPlaces = classe.totalSeats - classe.seatsTaken;
    if (remainingPlaces <= 0) {
      throw new Error(ERRORS.OPERATION_NOT_ALLOWED);
    }
    if (!isInsctructionOpen && !isAdmin(user)) {
      throw new Error(ERRORS.OPERATION_NOT_ALLOWED);
    }
  } else {
    const now = new Date();
    const isInsctructionOpen = now < cohort.instructionEndDate;
    if (!isInsctructionOpen && !isAdmin(user)) {
      throw new Error(ERRORS.OPERATION_NOT_ALLOWED);
    }
  }

  //update places in cohesionCenter
  if (young.sessionPhase1Id) {
    const sessionPhase1 = await SessionPhase1Model.findById(young.sessionPhase1Id);
    if (sessionPhase1) await updatePlacesSessionPhase1(sessionPhase1, user);
  }
  //update places in bus
  if (young.ligneId) {
    const bus = await LigneBusModel.findById(young.ligneId);
    if (bus) await updateSeatsTakenInBusLine(bus);
  }
  return young;
};
