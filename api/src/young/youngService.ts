import { format } from "date-fns";

import {
  ERRORS,
  FUNCTIONAL_ERRORS,
  UserDto,
  YOUNG_PHASE,
  YOUNG_SOURCE,
  YOUNG_STATUS,
  YOUNG_STATUS_PHASE1,
  YoungDto,
  YoungType,
  ROLES,
  REFERENT_DEPARTMENT_SUBROLE,
  SENDINBLUE_TEMPLATES,
  SUB_ROLES,
  WITHRAWN_REASONS,
  formatDateFRTimezoneUTC,
} from "snu-lib";

import {
  YoungDocument,
  YoungModel,
  ReferentModel,
  ClasseModel,
  CohesionCenterModel,
  DepartmentServiceModel,
  EtablissementModel,
  ReferentDocument,
  SessionPhase1Model,
} from "../models";

import { sendTemplate } from "../brevo";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";
import { getCcOfYoung, isReferent } from "../utils";
import { YOUNG_DOCUMENT, YOUNG_DOCUMENT_PHASE_TEMPLATE } from "./youngDocument";
import { isLocalTransport } from "./youngCertificateService";
import { logger } from "../logger";
import { config } from "../config";
import { capture } from "../sentry";

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

export async function handleNotificationForDeparture(young: YoungType, departSejourMotif: string, departSejourMotifComment: string) {
  if (!young.department) throw new Error(ERRORS.BAD_REQUEST);

  const referentsDep = await ReferentModel.find({ role: ROLES.REFERENT_DEPARTMENT, department: young.department });
  if (!referentsDep) throw new Error(ERRORS.NOT_FOUND);

  const center = await CohesionCenterModel.findById(young.cohesionCenterId);
  if (!center) throw new Error(ERRORS.NOT_FOUND);

  // On envoie au chef de projet departemental (ou assistant). Sinon, on envoie au secretariat du departement ou au manager de phase 2.
  // Si toujours rien on envoie a son contact convocation.
  const managers = referentsDep.filter(
    (referent) => referent.subRole === REFERENT_DEPARTMENT_SUBROLE.manager_department || referent.subRole === REFERENT_DEPARTMENT_SUBROLE.assistant_manager_department,
  );
  const secretariat = referentsDep.filter(
    (referent) => referent.subRole === REFERENT_DEPARTMENT_SUBROLE.secretariat || referent.subRole === REFERENT_DEPARTMENT_SUBROLE.manager_phase2,
  );
  const contactsConvocation = await getContactsConvocation(young.department, young.cohort!);
  const contacts = managers.length > 0 ? managers : secretariat.length > 0 ? secretariat : contactsConvocation;

  // Si CLE on envoit aussi aux contacts CLE
  const contactCLE = young.source === YOUNG_SOURCE.CLE ? await getContactsCLE(young.classeId!) : [];

  const template = SENDINBLUE_TEMPLATES.referent.DEPARTURE_CENTER;
  const emailTo = [...contacts, ...contactCLE].map((referent) => ({
    name: `${referent.firstName} ${referent.lastName}`,
    email: referent.email || "",
  }));
  const params = {
    youngFirstName: young.firstName,
    youngLastName: young.lastName,
    centreName: center.name,
    centreDepartement: center.department,
    departureReason: departSejourMotif,
    departureNote: departSejourMotifComment,
    cta: `${config.ADMIN_URL}/volontaire/${young._id}`,
  };
  return await sendTemplate(template, { emailTo, params });
}

async function getContactsConvocation(department: string, cohortName: string) {
  const departmentService = await DepartmentServiceModel.findOne({ department });
  if (!departmentService) throw new Error(ERRORS.NOT_FOUND);

  return departmentService.contacts
    .filter((contact) => contact.cohort === cohortName)
    .map((contact) => {
      const [firstName, lastName] = contact.contactName!.split(" ");
      const email = contact.contactMail;
      return { ...contact, firstName, lastName, email };
    });
}

async function getContactsCLE(classeId: string) {
  let contactCLEId: string[] = [];

  const classe = await ClasseModel.findById(classeId);
  if (!classe) throw new Error(ERRORS.NOT_FOUND);
  contactCLEId.push(classe.referentClasseIds[0]);

  const etablissement = await EtablissementModel.findById(classe.etablissementId);
  if (!etablissement) throw new Error(ERRORS.NOT_FOUND);
  contactCLEId.push(etablissement.referentEtablissementIds[0]);
  contactCLEId.push(...etablissement.coordinateurIds);

  return await ReferentModel.find({ _id: { $in: contactCLEId } });
}

export async function handleNotifForYoungWithdrawn(young, cohort, withdrawnReason, actor) {
  const oldStatusPhase1 = young.statusPhase1;

  // We notify the ref dep and the young
  try {
    const youngFullName = young.firstName + " " + young.lastName;
    const referents: ReferentDocument[] = await ReferentModel.find({ role: ROLES.REFERENT_DEPARTMENT, department: young.department });
    const SUB_ROLES_PRIORITY = [SUB_ROLES.manager_department, SUB_ROLES.assistant_manager_department, SUB_ROLES.secretariat, SUB_ROLES.manager_phase2];
    let selectedReferent: ReferentDocument | undefined = referents.find((referent) => referent.subRole && SUB_ROLES_PRIORITY.includes(referent.subRole));
    if (!selectedReferent && referents.length > 0) {
      selectedReferent = referents[0];
    }
    if (selectedReferent) {
      await sendTemplate(SENDINBLUE_TEMPLATES.referent.YOUNG_WITHDRAWN_NOTIFICATION, {
        emailTo: [{ name: `${selectedReferent.firstName} ${selectedReferent.lastName}`, email: selectedReferent.email }],
        params: { student_name: youngFullName, message: WITHRAWN_REASONS.find((r) => r.value === withdrawnReason)?.label || "" },
      });
    }
    // If they are CLE, we notify the class referent.
    if (cohort?.type === YOUNG_SOURCE.CLE) {
      const classe = await ClasseModel.findById(young.classeId);
      const referent = await ReferentModel.findById(classe?.referentClasseIds[0]);
      const datecohorte = `du ${formatDateFRTimezoneUTC(cohort.dateStart)} au ${formatDateFRTimezoneUTC(cohort.dateEnd)}`;
      if (referent) {
        await sendTemplate(SENDINBLUE_TEMPLATES.referent.YOUNG_WITHDRAWN_CLE, {
          emailTo: [{ name: `${referent.firstName} ${referent.lastName}`, email: referent.email }],
          params: {
            youngFirstName: young.firstName,
            youngLastName: young.lastName,
            datecohorte,
            raisondesistement: WITHRAWN_REASONS.find((r) => r.value === withdrawnReason)?.label || "",
          },
        });
      }
    }

    // If young affected, we notify the head center
    if (oldStatusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED && young.sessionPhase1Id != null) {
      const session = await SessionPhase1Model.findById(young.sessionPhase1Id);
      const headCenter = await ReferentModel.findById(session?.headCenterId);

      if (headCenter) {
        await sendTemplate(SENDINBLUE_TEMPLATES.headCenter.YOUNG_WITHDRAWN, {
          emailTo: [{ name: `${headCenter.firstName} ${headCenter.lastName}`, email: headCenter.email }],
          params: { contact_name: youngFullName, message: WITHRAWN_REASONS.find((r) => r.value === withdrawnReason)?.label || "" },
        });
      }
    }

    const template = isReferent(actor) ? SENDINBLUE_TEMPLATES.young.WITHDRAWN_BY_REFERENT : SENDINBLUE_TEMPLATES.young.WITHDRAWN;

    await sendTemplate(template, {
      emailTo: [{ name: `${young.firstName} ${young.lastName}`, email: young.email }],
      params: { message: WITHRAWN_REASONS.find((r) => r.value === withdrawnReason)?.label || "" },
      cc: getCcOfYoung(young),
    });
  } catch (e) {
    capture(e);
  }
}
