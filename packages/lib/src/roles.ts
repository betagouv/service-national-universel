import { CohortDto, ReferentDto, UserDto } from "./dto";
import { region2department } from "./region-and-departments";
import { isNowBetweenDates } from "./utils/date";
import { COHORT_TYPE, LIMIT_DATE_ESTIMATED_SEATS, LIMIT_DATE_TOTAL_SEATS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, YOUNG_STATUS_PHASE3 } from "./constants/constants";
import { CohortType, PointDeRassemblementType, ReferentType, SessionPhase1Type, StructureType, YoungType } from "./mongoSchema";
import { isBefore } from "date-fns";

const DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS = 1000 * 60 * 15; // 15 minutes
const DURATION_BEFORE_EXPIRATION_2FA_ADMIN_MS = 1000 * 60 * 10; // 10 minutes

const ROLES = {
  ADMIN: "admin",
  REFERENT_DEPARTMENT: "referent_department",
  REFERENT_REGION: "referent_region",
  RESPONSIBLE: "responsible",
  SUPERVISOR: "supervisor",
  HEAD_CENTER: "head_center",
  HEAD_CENTER_ADJOINT: "head_center_adjoint",
  REFERENT_SANITAIRE: "referent_sanitaire",
  VISITOR: "visitor",
  DSNJ: "dsnj",
  INJEP: "injep",
  TRANSPORTER: "transporter",
  ADMINISTRATEUR_CLE: "administrateur_cle",
  REFERENT_CLASSE: "referent_classe",
};

export const ROLE_JEUNE = "jeune";

const SUB_ROLES = {
  manager_department: "manager_department",
  assistant_manager_department: "assistant_manager_department",
  manager_phase2: "manager_phase2",
  secretariat: "secretariat",
  coordinator: "coordinator",
  assistant_coordinator: "assistant_coordinator",
  referent_etablissement: "referent_etablissement",
  coordinateur_cle: "coordinateur_cle",
  none: "",
};

export const SUB_ROLE_GOD = "god";

const VISITOR_SUBROLES = {
  recteur_region: "Recteur de région académique",
  recteur: "Recteur d’académie",
  vice_recteur: "Vice-recteur d'académie",
  dasen: "Directeur académique des services de l’éducation nationale (DASEN)",
  sgra: "Secrétaire général de région académique (SGRA)",
  sga: "Secrétaire général d’académie (SGA)",
  drajes: "Délégué régional académique à la jeunesse, à l’engagement et aux sports (DRAJES)",
  other: "Autre",
};

// /!\ n'est pas un role pour un referent
// legacy
// TODO: à retirer
const SUPPORT_ROLES = {
  admin: "Modérateur",
  referent: "Référent",
  structure: "Structure",
  head_center: "Chef de Centre",
  head_center_adjoint: "Chef de Centre Adjoint",
  referent_sanitaire: "Référent Sanitaire",
  young: "Volontaire",
  public: "Public",
  visitor: "Visiteur",
};

// /!\ n'est pas un role pour un referent
// uniquement le champ "team" des sessions phase 1
const CENTER_ROLES = {
  chef: "Chef de centre",
  adjoint: "Chef de centre adjoint",
  referent_sanitaire: "Référent sanitaire",
  cadre_specialise: "Cadre spécialisé",
  cadre_compagnie: "Cadre de compagnie",
  tuteur: "Tuteur de maisonnée",
};

const ROLES_LIST = Object.values(ROLES);
export const REFERENT_AND_JEUNE_ROLES_LIST = [...ROLES_LIST, ROLE_JEUNE];
const SUB_ROLES_LIST = Object.values(SUB_ROLES);
const SUPPORT_ROLES_LIST = Object.keys(SUPPORT_ROLES);
const VISITOR_SUB_ROLES_LIST = Object.keys(VISITOR_SUBROLES);

//TODO a supprimer
const REFERENT_ROLES = ROLES;

const REFERENT_DEPARTMENT_SUBROLE = {
  manager_department: SUB_ROLES.manager_department,
  assistant_manager_department: SUB_ROLES.assistant_manager_department,
  manager_phase2: SUB_ROLES.manager_phase2,
  secretariat: SUB_ROLES.secretariat,
};
const REFERENT_REGION_SUBROLE = {
  coordinator: SUB_ROLES.coordinator,
  assistant_coordinator: SUB_ROLES.assistant_coordinator,
  manager_phase2: SUB_ROLES.manager_phase2,
};

const ADMINISTRATEUR_CLE_SUBROLE = {
  referent_etablissement: SUB_ROLES.referent_etablissement,
  coordinateur_cle: SUB_ROLES.coordinateur_cle,
};

// TODO - Geography department ref-ref array-array ref-ref/struc|young array-string
const sameGeography = (actor, target) => {
  const actorAndTargetInTheSameRegion = (actor?.region && actor?.region === target?.region) || region2department[actor?.region].includes(target?.department);
  const actorAndTargetInTheSameDepartment = actor?.department && actor?.department.includes(target?.department);

  switch (actor?.role) {
    case ROLES.REFERENT_REGION:
      return actorAndTargetInTheSameRegion;
    case ROLES.REFERENT_DEPARTMENT:
      return actorAndTargetInTheSameDepartment;
    default:
      return actorAndTargetInTheSameDepartment || actorAndTargetInTheSameRegion;
  }
};

const referentInSameGeography = (actor, target) => isReferentRegDep(actor) && sameGeography(actor, target);

function canInviteUser(actorRole, targetRole) {
  // Admins can invite any user
  if (actorRole === ROLES.ADMIN) return true;

  // REFERENT_DEPARTMENT can invite REFERENT_DEPARTMENT, RESPONSIBLE, SUPERVISOR, HEAD_CENTER, HEAD_CENTER_ADJOINT, REFERENT_SANITAIRE
  if (actorRole === ROLES.REFERENT_DEPARTMENT) {
    return [ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(targetRole);
  }

  // REFERENT_REGION can invite REFERENT_DEPARTMENT, REFERENT_REGION, RESPONSIBLE, SUPERVISOR, HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE, VISITOR
  if (actorRole === ROLES.REFERENT_REGION) {
    return [
      ROLES.REFERENT_DEPARTMENT,
      ROLES.REFERENT_REGION,
      ROLES.HEAD_CENTER,
      ROLES.HEAD_CENTER_ADJOINT,
      ROLES.REFERENT_SANITAIRE,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
      ROLES.VISITOR,
    ].includes(targetRole);
  }

  // RESPONSIBLE can invite only RESPONSIBLE.
  if (actorRole === ROLES.RESPONSIBLE) {
    return targetRole === ROLES.RESPONSIBLE;
  }
  // SUPERVISOR can invite RESPONSIBLE and SUPERVISOR.
  if (actorRole === ROLES.SUPERVISOR) {
    return [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(targetRole);
  }

  return false;
}

const canModifyDirectionCenterTeam = (actor) => {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
};

const canDeleteStructure = (actor, target) => isAdmin(actor) || referentInSameGeography(actor, target);

const canDeleteYoung = (actor) => {
  return isAdmin(actor);
};

function canEditYoung(actor, young) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isHeadCenter = [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role);

  const actorAndTargetInTheSameRegion = actor.region === young.region;
  const actorAndTargetInTheSameDepartment = actor.department.includes(young.department);
  const referentRegionFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && actorAndTargetInTheSameRegion;
  const referentDepartmentFromTheSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actorAndTargetInTheSameDepartment;
  //TODO update this
  const referentCLEAuthorized = [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(actor.role) && young.source === "CLE";
  const authorized = isAdmin || isHeadCenter || referentRegionFromTheSameRegion || referentDepartmentFromTheSameDepartment || referentCLEAuthorized;
  return authorized;
}

function canDeleteReferent({ actor, originalTarget, structure }) {
  // TODO: we must handle rights more precisely.
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  const isMe = actor._id === originalTarget._id;

  const isAdmin = actor.role === ROLES.ADMIN;
  const isSupervisor = actor.role === ROLES.SUPERVISOR;

  const geographicTargetData = {
    region: originalTarget.region || structure?.region,
    department: originalTarget.department || [structure?.department],
  };

  const actorAndTargetInTheSameRegion = actor.region === geographicTargetData.region;
  // Check si il y a au moins un match entre les departements de la target et de l'actor
  const actorAndTargetInTheSameDepartment = actor.department.some((department) => geographicTargetData.department.includes(department));

  const targetIsReferentRegion = originalTarget.role === ROLES.REFERENT_REGION;
  const targetIsReferentDepartment = originalTarget.role === ROLES.REFERENT_DEPARTMENT;
  const targetIsSupervisor = originalTarget.role === ROLES.SUPERVISOR;
  const targetIsResponsible = originalTarget.role === ROLES.RESPONSIBLE;
  const targetIsVisitor = originalTarget.role === ROLES.VISITOR;
  const targetIsHeadCenter = [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(originalTarget.role);

  // actor is referent region
  const referentRegionFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsReferentRegion && actorAndTargetInTheSameRegion;
  const referentDepartmentFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsReferentDepartment && actorAndTargetInTheSameRegion;
  const referentResponsibleFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsResponsible && actorAndTargetInTheSameRegion;
  const responsibleFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsResponsible && actorAndTargetInTheSameRegion;
  const visitorFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsVisitor && actorAndTargetInTheSameRegion;
  const headCenterFromTheSameRegion = actor.role === ROLES.REFERENT_REGION && targetIsHeadCenter && actorAndTargetInTheSameRegion;

  // actor is referent department
  const referentDepartmentFromTheSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && targetIsReferentDepartment && actorAndTargetInTheSameDepartment;
  const responsibleFromTheSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && targetIsResponsible && actorAndTargetInTheSameDepartment;
  const headCenterFromTheSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && targetIsHeadCenter && actorAndTargetInTheSameDepartment;

  // same substructure
  const responsibleFromSameStructure = (targetIsResponsible || targetIsSupervisor) && actor.structureId === originalTarget.structureId;
  const supervisorOfMainStructure = structure && isSupervisor && actor.structureId === structure.networkId;

  const authorized =
    isAdmin ||
    referentRegionFromTheSameRegion ||
    referentDepartmentFromTheSameRegion ||
    referentResponsibleFromTheSameRegion ||
    responsibleFromTheSameRegion ||
    visitorFromTheSameRegion ||
    headCenterFromTheSameRegion ||
    referentDepartmentFromTheSameDepartment ||
    responsibleFromTheSameDepartment ||
    headCenterFromTheSameDepartment ||
    (responsibleFromSameStructure && !isMe) ||
    supervisorOfMainStructure;

  return authorized;
}

function canViewPatchesHistory(actor) {
  const isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(
    actor.role,
  );
  return isAdminOrReferent;
}

function canDeletePatchesHistory(actor, target) {
  const isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(actor.role);
  const isOwner = actor._id.toString() === target._id.toString();
  return isAdminOrReferent || isOwner;
}

function canViewEmailHistory(actor) {
  const isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(actor.role);
  return isAdminOrReferent;
}

function canViewNotes(actor) {
  const isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(actor.role);
  return isAdminOrReferent;
}

function canViewReferent(actor, target) {
  const isMe = actor.id === target.id;
  const isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
  const isResponsibleModifyingResponsible = [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role) && [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role);
  const isHeadCenter =
    [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role) &&
    [ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(target.role);
  const isAdministratorCLE = actor.role === ROLES.ADMINISTRATEUR_CLE && [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(target.role);
  const isReferentClasse = actor.role === ROLES.REFERENT_CLASSE && [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(target.role);
  //@todo update doc
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  return isMe || isAdminOrReferent || isResponsibleModifyingResponsible || isHeadCenter || isAdministratorCLE || isReferentClasse;
}

type CanUpdateReferent = {
  actor: UserDto;
  originalTarget: ReferentType;
  modifiedTarget?: ReferentType | null;
  structure?: StructureType | null;
};

function canUpdateReferent({ actor, originalTarget, modifiedTarget = null, structure }: CanUpdateReferent) {
  const isMe = actor._id?.toString() === originalTarget._id?.toString();
  const isActorAdmin = isAdmin(actor);
  const isStructureTeamMember = isResponsibleOrSupervisor(actor);
  const withoutChangingRole = modifiedTarget === null || !("role" in modifiedTarget) || modifiedTarget.role === originalTarget.role;

  // Seul les admins peuvent changer les roles des utilisateurs
  if (!isActorAdmin && modifiedTarget?.role && modifiedTarget.role !== originalTarget.role) {
    return false;
  }
  // un responsable/superviseur ne peut pas se changer de structure
  if (isStructureTeamMember && modifiedTarget?.structureId && modifiedTarget?.structureId !== originalTarget.structureId) {
    return false;
  }

  const isResponsibleModifyingResponsibleWithoutChangingRole =
    // Is responsible...
    isStructureTeamMember &&
    // ... modifying responsible ...
    isResponsibleOrSupervisor(originalTarget) &&
    withoutChangingRole;

  const isSupervisorModifyingTeamMember =
    // Is supervisor...
    actor.role === ROLES.SUPERVISOR &&
    // ... modifying team member ...
    isResponsibleOrSupervisor(originalTarget) &&
    actor.structureId === originalTarget.structureId;

  const isMeWithoutChangingRole =
    // Is me ...
    isMe &&
    // ... without changing its role.
    withoutChangingRole;

  // TODO: we must handle rights more precisely.
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  const isReferentModifyingReferentWithoutChangingRole =
    // Is referent...
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role) &&
    // ... modifying referent ...
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE].includes(originalTarget.role!) &&
    // ... witout changing its role.
    (modifiedTarget === null || [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE].includes(modifiedTarget.role!));
  const isReferentModifyingHeadCenterWithoutChangingRole =
    // Is referent...
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role) &&
    // ... modifying referent ...
    [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(originalTarget.role!) &&
    // ... witout changing its role.
    (modifiedTarget === null || [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(modifiedTarget.role!));

  const geographicTargetData = {
    region: originalTarget.region || structure?.region,
    // many users have an array like [""] for department
    department: originalTarget.department?.length && originalTarget.department[0] !== "" ? originalTarget.department : [structure?.department],
  };

  const isActorAndTargetInTheSameRegion = actor.region === geographicTargetData.region;
  // Check si il y a au moins un match entre les departements de la target et de l'actor
  const isActorAndTargetInTheSameDepartment = (actor.department as string[]).some((department) => geographicTargetData.department.includes(department));

  const authorized =
    (isMeWithoutChangingRole ||
      isActorAdmin ||
      isSupervisorModifyingTeamMember ||
      isResponsibleModifyingResponsibleWithoutChangingRole ||
      isReferentModifyingReferentWithoutChangingRole ||
      isReferentModifyingHeadCenterWithoutChangingRole) &&
    (actor.role === ROLES.REFERENT_REGION ? isActorAndTargetInTheSameRegion || isReferentModifyingHeadCenterWithoutChangingRole : true) &&
    (actor.role === ROLES.REFERENT_DEPARTMENT
      ? ([ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(originalTarget.role!) ||
          isMe) &&
        (isActorAndTargetInTheSameDepartment || isReferentModifyingHeadCenterWithoutChangingRole)
      : true);
  return authorized;
}

function canViewYoungMilitaryPreparationFile(actor, young) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentDepartmentFromTargetDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(young.department);
  const isReferentRegionFromTargetRegion = actor.role === ROLES.REFERENT_REGION && actor.region === young.region;
  const authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
  return authorized;
}

function canRefuseMilitaryPreparation(actor, young) {
  return canViewYoungMilitaryPreparationFile(actor, young) || [ROLES.RESPONSIBLE, ROLES.REFERENT_REGION].includes(actor.role);
}

function canViewYoungFile(actor, target, targetCenter?) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentDepartmentFromTargetDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(target.department);
  const isReferentRegionFromTargetRegion = actor.role === ROLES.REFERENT_REGION && actor.region === target.region;
  // @ts-ignore
  const isReferentCenterFromSameDepartmentTargetCenter = actor.department === targetCenter?.department;
  // @ts-ignore
  const isReferentCenterFromSameRegionTargetCenter = actor.region === targetCenter?.region;
  const authorized =
    isAdmin ||
    isReferentDepartmentFromTargetDepartment ||
    isReferentRegionFromTargetRegion ||
    isReferentCenterFromSameDepartmentTargetCenter ||
    isReferentCenterFromSameRegionTargetCenter;
  return authorized;
}

function canCreateOrUpdateCohesionCenter(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(actor.role);
}

function canCreateEvent(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}
function canCreateOrUpdateSessionPhase1(actor: UserDto, target?: SessionPhase1Type | null) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferent = [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
  const isHeadCenter = actor.role === ROLES.HEAD_CENTER && target && actor._id.toString() === target.headCenterId;
  const isAdjoints = [ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role) && target && target.adjointsIds.includes(actor._id.toString());

  return isAdmin || isReferent || isHeadCenter || isAdjoints;
}

function canSearchSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE, ROLES.TRANSPORTER].includes(
    actor.role,
  );
}

function canViewSessionPhase1(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.REFERENT_CLASSE,
    ROLES.ADMINISTRATEUR_CLE,
  ].includes(actor.role);
}

function canPutSpecificDateOnSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canSeeYoungInfo(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role);
}

function canEditSanitaryEmailContact(actor, cohort) {
  if (
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role) &&
    !cohort.isAssignmentAnnouncementsOpenForYoung
  ) {
    return true;
  } else if ([ROLES.ADMIN].includes(actor.role)) {
    return true;
  } else {
    return false;
  }
}

function isSessionEditionOpen(actor, cohort) {
  switch (actor?.role) {
    case ROLES.ADMIN:
      return true;
    case ROLES.HEAD_CENTER:
      return true;
    case ROLES.HEAD_CENTER_ADJOINT:
      return true;
    case ROLES.REFERENT_SANITAIRE:
      return true;
    case ROLES.REFERENT_REGION:
      return cohort?.sessionEditionOpenForReferentRegion;
    case ROLES.REFERENT_DEPARTMENT:
      return cohort?.sessionEditionOpenForReferentDepartment;
    case ROLES.TRANSPORTER:
      return cohort?.sessionEditionOpenForTransporter;
    default:
      return false;
  }
}

function isPdrEditionOpen(actor, cohort) {
  switch (actor?.role) {
    case ROLES.ADMIN:
      return true;
    case ROLES.REFERENT_REGION:
      return cohort?.pdrEditionOpenForReferentRegion;
    case ROLES.REFERENT_DEPARTMENT:
      return cohort?.pdrEditionOpenForReferentDepartment;
    case ROLES.TRANSPORTER:
      return cohort?.pdrEditionOpenForTransporter;
    default:
      return false;
  }
}

const isBusEditionOpen = (actor, cohort) => {
  switch (actor?.role) {
    case ROLES.ADMIN:
      return true;
    case ROLES.TRANSPORTER:
      return cohort?.busEditionOpenForTransporter;
    default:
      return false;
  }
};

function isLigneBusDemandeDeModificationOpen(actor, cohort) {
  if (actor.role === ROLES.ADMIN) return true;
  if (actor.role === ROLES.REFERENT_REGION) return cohort?.isTransportPlanCorrectionRequestOpen || false;
  return false;
}

function canSendTimeScheduleReminderForSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canSendImageRightsForSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role);
}

function canCreateOrModifyMission(user, mission, structure) {
  if (user.role === ROLES.SUPERVISOR) {
    return user.structureId === mission.structureId || user.structureId === structure?.networkId;
  }
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) || (user.role === ROLES.RESPONSIBLE && user.structureId === mission.structureId);
}

function canCreateOrUpdateProgram(user, program) {
  const isAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
  return (
    isAdminOrReferent &&
    !((user.role === ROLES.REFERENT_DEPARTMENT && !user.department.includes(program.department)) || (user.role === ROLES.REFERENT_REGION && user.region !== program.region))
  );
}
function canModifyStructure(user: UserDto, structure: StructureType, modifyStructure?: StructureType) {
  const isAdmin = user.role === ROLES.ADMIN;
  const isResponsible = user.role === ROLES.RESPONSIBLE;
  const isReferentRegionFromSameRegion = user.role === ROLES.REFERENT_REGION && user.region === structure.region;
  const isReferentDepartmentFromSameDepartment = user.role === ROLES.REFERENT_DEPARTMENT && user.department.includes(structure.department!);
  const isResponsibleModifyingOwnStructure = [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) && structure._id.toString() === user.structureId;
  const isSupervisorModifyingChild = user.role === ROLES.SUPERVISOR && user.structureId === structure.networkId;

  // un responsable ne peux pas passer en tête de réseau la structure
  if (isResponsible && modifyStructure && structure.isNetwork !== "true" && modifyStructure.isNetwork === "true") {
    return false;
  }

  return isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment || isResponsibleModifyingOwnStructure || isSupervisorModifyingChild;
}

function canCreateStructure(user) {
  return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
}

function canSendPlanDeTransport(user) {
  return [ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.TRANSPORTER].includes(user.role);
}

interface UserRoles {
  role?: ReferentType["role"];
  subRole?: ReferentType["subRole"];
  roles?: ReferentType["roles"];
}

function isAdmin(user: UserRoles) {
  return ROLES.ADMIN === user.role;
}

function isReferentReg(user: UserRoles) {
  return ROLES.REFERENT_REGION === user.role;
}

function isReferentDep(user: UserRoles) {
  return ROLES.REFERENT_DEPARTMENT === user.role;
}

function isReferentRegDep(user: UserRoles) {
  return [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role || "");
}

export function isResponsible(user: UserRoles) {
  return ROLES.RESPONSIBLE === user.role;
}

export function isSupervisor(user: UserRoles) {
  return ROLES.SUPERVISOR === user.role;
}

export function isResponsibleOrSupervisor(user: UserRoles) {
  return isResponsible(user) || isSupervisor(user);
}

function isReferentOrAdmin(user: UserRoles) {
  return isAdmin(user) || isReferentRegDep(user);
}

function isAdminCle(user: UserRoles) {
  return user?.role === ROLES.ADMINISTRATEUR_CLE;
}

function isChefEtablissement(user: UserRoles) {
  return isAdminCle(user) && user?.subRole === SUB_ROLES.referent_etablissement;
}

function isCoordinateurEtablissement(user: UserRoles) {
  return isAdminCle(user) && user?.subRole === SUB_ROLES.coordinateur_cle;
}

function isReferentClasse(user: UserRoles) {
  return user?.role === ROLES.REFERENT_CLASSE;
}

function isHeadCenter(user: UserRoles) {
  return user?.role === ROLES.HEAD_CENTER;
}

function isHeadCenterAdjoint(user: UserRoles) {
  return user?.role === ROLES.HEAD_CENTER_ADJOINT;
}

function isReferentSanitaire(user: UserRoles) {
  return user?.role === ROLES.REFERENT_SANITAIRE;
}

const isTemporaryAffected = (young) => young?.statusPhase1 === "WAITING_AFFECTATION" && ["AFFECTED", "WAITING_LIST"].includes(young?.statusPhase1Tmp);

const FORCE_DISABLED_ASSIGN_COHESION_CENTER = false;
const canAssignCohesionCenter = (actor, target) => !FORCE_DISABLED_ASSIGN_COHESION_CENTER && isReferentOrAdmin(actor) && (!target?.statusPhase1Tmp || !isTemporaryAffected(target));

const FORCE_DISABLED_ASSIGN_MEETING_POINT = false;
const canAssignMeetingPoint = (actor, target) => !FORCE_DISABLED_ASSIGN_MEETING_POINT && isReferentOrAdmin(actor) && (!target?.statusPhase1Tmp || !isTemporaryAffected(target));

const canEditPresenceYoung = (actor) => {
  // todo affiner les droits
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role);
};

const canSigninAs = (
  actor: Pick<UserDto, "role" | "department" | "region">,
  target: Pick<ReferentType, "role" | "subRole" | "department" | "region"> | Pick<YoungType, "department" | "region">,
  source: "referent" | "young",
) => {
  if (isAdmin(actor)) return source === "young" || (target as ReferentType).subRole !== SUB_ROLE_GOD;
  if (!isReferentRegDep(actor)) return false;

  if (source === "referent") {
    // ReferentType
    const targetReferent = target as Pick<ReferentType, "role" | "subRole" | "department" | "region">;
    const allowedTargetRoles = [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE];
    if (!allowedTargetRoles.includes(targetReferent.role!)) return false;
    if (actor.role === ROLES.REFERENT_DEPARTMENT && (actor.department as string[]).some((d) => targetReferent.department.includes(d))) return true;
  } else {
    // YoungType
    const targetYoung = target as Pick<YoungType, "department" | "region">;
    if (actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(targetYoung.department!)) return true;
  }
  if (actor.role === ROLES.REFERENT_REGION && actor.region === target.region) return true;
  return false;
};

const canSendFileByMailToYoung = (actor, young) => {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentRegionFromSameRegion = actor.role === ROLES.REFERENT_REGION && actor.region === young.region;
  const isReferentDepartmentFromSameDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(young.department);
  return isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment;
};

function canSearchAssociation(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canViewCohesionCenter(actor: UserDto) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.TRANSPORTER,
    ROLES.REFERENT_CLASSE,
    ROLES.ADMINISTRATEUR_CLE,
  ].includes(actor.role);
}

function canGetReferentByEmail(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role);
}

function canViewMeetingPoints(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.TRANSPORTER,
    ROLES.ADMINISTRATEUR_CLE,
    ROLES.REFERENT_CLASSE,
  ].includes(actor.role);
}

function canUpdateMeetingPoint(actor, meetingPoint: PointDeRassemblementType | null = null) {
  if (isAdmin(actor)) return true;
  if ([ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role)) {
    if (!meetingPoint) return true;
    return referentInSameGeography(actor, meetingPoint);
  }
  if (actor.role === ROLES.TRANSPORTER) {
    return true;
  }
  return false;
}

function canDeleteMeetingPoint(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function canDeleteMeetingPointSession(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canCreateMeetingPoint(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
}

function canSearchMeetingPoints(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
}

function canViewMeetingPointId(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role);
}

function canUpdateInscriptionGoals(actor) {
  return actor.role === ROLES.ADMIN;
}

function canViewInscriptionGoals(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE, ROLES.VISITOR].includes(
    actor.role,
  );
}

function canViewTicketTags(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canGetYoungByEmail(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canViewYoung(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
    ROLES.ADMINISTRATEUR_CLE,
    ROLES.REFERENT_CLASSE,
  ].includes(actor.role);
}

function canViewBus(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canUpdateBus(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(actor.role);
}

function canCreateBus(actor) {
  return actor.role === ROLES.ADMIN;
}

function canViewMission(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}

function canViewStructures(actor) {
  if (actor.constructor.modelName === "young") return true;
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
  ].includes(actor.role);
}

function canModifyMissionStructureId(actor) {
  return actor.role === ROLES.ADMIN;
}

function canViewStructureChildren(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}

function canDownloadYoungDocuments(actor: UserDto, target?: UserDto, type?: string) {
  if (type === "certificate" || type === "convocation") {
    return [
      ROLES.REFERENT_DEPARTMENT,
      ROLES.REFERENT_REGION,
      ROLES.ADMIN,
      ROLES.HEAD_CENTER,
      ROLES.HEAD_CENTER_ADJOINT,
      ROLES.REFERENT_SANITAIRE,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
      ROLES.REFERENT_CLASSE,
      ROLES.ADMINISTRATEUR_CLE,
    ].includes(actor.role);
  } else {
    return (
      canEditYoung(actor, target) || [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role)
      // && applications?.length
    );
  }
}

function canInviteYoung(actor: UserDto, cohort: CohortDto | null) {
  if (!cohort) return false;

  switch (actor.role) {
    case ROLES.ADMIN:
      return true;
    case ROLES.REFERENT_DEPARTMENT:
      return cohort.isInscriptionOpen || cohort.inscriptionOpenForReferentDepartment === true;
    case ROLES.REFERENT_REGION:
      return cohort.isInscriptionOpen || cohort.inscriptionOpenForReferentRegion === true;
    case ROLES.REFERENT_CLASSE:
      return cohort.type === COHORT_TYPE.CLE && (cohort.isInscriptionOpen || cohort.inscriptionOpenForReferentClasse === true);
    case ROLES.ADMINISTRATEUR_CLE:
      return cohort.type === COHORT_TYPE.CLE && (cohort.isInscriptionOpen || cohort.inscriptionOpenForAdministrateurCle === true);
    default:
      return false;
  }
}

function canSendTemplateToYoung(actor, young) {
  return canEditYoung(actor, young);
}

function canViewYoungApplications(actor, young) {
  return canEditYoung(actor, young) || [ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
}

function canCreateYoungApplication(actor, young) {
  return canEditYoung(actor, young) || [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}

function canCreateOrUpdateContract(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}

function canViewContract(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}

function canCreateOrUpdateDepartmentService(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canChangeYoungCohort(actor, young) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentDepartmentFromTargetDepartment = actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(young.department);
  const isReferentRegionFromTargetRegion = actor.role === ROLES.REFERENT_REGION && actor.region === young.region;
  const authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
  return authorized;
}

function canViewDepartmentService(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.ADMINISTRATEUR_CLE,
    ROLES.REFERENT_CLASSE,
  ].includes(actor.role);
}

function canAssignManually(actor, young, cohort) {
  if (!cohort) return false;
  return (
    (actor.role === ROLES.ADMIN && cohort.manualAffectionOpenForAdmin) ||
    (actor.role === ROLES.REFERENT_REGION && actor.region === young.region && cohort.manualAffectionOpenForReferentRegion) ||
    (actor.role === ROLES.REFERENT_DEPARTMENT && actor.department.includes(young.department) && cohort.manualAffectionOpenForReferentDepartment)
  );
}

function canSearchInElasticSearch(actor, index) {
  if (index === "mission") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
  } else if (index === "school" || index === "schoolramses") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
      ROLES.HEAD_CENTER,
      ROLES.HEAD_CENTER_ADJOINT,
      ROLES.REFERENT_SANITAIRE,
      ROLES.VISITOR,
    ].includes(actor.role);
  } else if (index === "young-having-school-in-department") {
    return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "young-having-school-in-region") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(actor.role);
  } else if (index === "cohesionyoung") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (/* legacy and new name */ index === "sessionphase1young" || index === "sessionphase1") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
      ROLES.HEAD_CENTER,
      ROLES.HEAD_CENTER_ADJOINT,
      ROLES.REFERENT_SANITAIRE,
      ROLES.TRANSPORTER,
      ROLES.ADMINISTRATEUR_CLE,
      ROLES.REFERENT_CLASSE,
    ].includes(actor.role);
  } else if (index === "structure") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
  } else if (index === "referent") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
      ROLES.HEAD_CENTER,
      ROLES.HEAD_CENTER_ADJOINT,
      ROLES.REFERENT_SANITAIRE,
      ROLES.ADMINISTRATEUR_CLE,
      ROLES.REFERENT_CLASSE,
    ].includes(actor.role);
  } else if (index === "application") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
  } else if (index === "cohesioncenter") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
  } else if (index === "team") {
    return [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "modificationbus") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.TRANSPORTER, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "young-by-school") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "young") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "aggregate-status") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "lignebus") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(actor.role);
  } else if (index === "classe") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE, ROLES.TRANSPORTER].includes(actor.role);
  } else if (index === "youngCle") {
    return [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(actor.role);
  } else if (index === "etablissement") {
    return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  }
  return false;
}

function canSendTutorTemplate(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role);
}

function canShareSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(
    actor.role,
  );
}

function canCreateAlerteMessage(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function canReadAlerteMessage(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.RESPONSIBLE,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.SUPERVISOR,
    ROLES.REFERENT_CLASSE,
    ROLES.ADMINISTRATEUR_CLE,
  ].includes(actor.role);
}

function canViewTableDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canEditTableDeRepartitionDepartment(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(actor.role);
}

function canEditTableDeRepartitionRegion(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(actor.role);
}

function canViewSchemaDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
}

function canCreateSchemaDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canEditSchemaDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canDeleteSchemaDeRepartition(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canViewLigneBus(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.TRANSPORTER,
    ROLES.HEAD_CENTER,
    ROLES.HEAD_CENTER_ADJOINT,
    ROLES.REFERENT_SANITAIRE,
    ROLES.REFERENT_CLASSE,
    ROLES.ADMINISTRATEUR_CLE,
  ].includes(actor.role);
}
function canUpdateLigneBus(actor) {
  return [
    ROLES.ADMIN,
    ROLES.TRANSPORTER,
    // ROLES.REFERENT_REGION,
    // ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}
function canCreateLigneBus(actor) {
  return [
    ROLES.ADMIN,
    // ROLES.REFERENT_REGION,
    // ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}

function canDeleteLigneBus(actor) {
  return [
    ROLES.ADMIN,
    // ROLES.REFERENT_REGION,
    // ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}

function canSearchLigneBus(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(
    actor.role,
  );
}

function canExportLigneBus(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER].includes(actor.role);
}
function canExportConvoyeur(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER].includes(actor.role);
}

function canEditLigneBusTeam(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function canEditLigneBusGeneralInfo(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function canEditLigneBusCenter(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function canEditLigneBusPointDeRassemblement(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function ligneBusCanCreateDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(actor.role);
}

function ligneBusCanViewDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.TRANSPORTER, ROLES.REFERENT_DEPARTMENT, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(
    actor.role,
  );
}

function ligneBusCanSendMessageDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.TRANSPORTER].includes(actor.role);
}

function ligneBusCanEditStatusDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER].includes(actor.role);
}

function ligneBusCanEditOpinionDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER].includes(actor.role);
}

function ligneBusCanEditTagsDemandeDeModification(actor) {
  return [ROLES.ADMIN, ROLES.TRANSPORTER].includes(actor.role);
}

function canCreateTags(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function isSuperAdmin(actor) {
  if (!actor) return false;
  return [ROLES.ADMIN].includes(actor.role) && actor.subRole === SUB_ROLE_GOD;
}

function canCheckIfRefExist(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.SUPERVISOR].includes(actor.role);
}

function canSeeDashboardSejourInfo(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canSeeDashboardSejourHeadCenter(actor) {
  return [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(actor.role);
}

function canSeeDashboardInscriptionInfo(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.VISITOR].includes(actor.role);
}

function canSeeDashboardInscriptionDetail(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.VISITOR, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(
    actor.role,
  );
}

function canSeeDashboardEngagementInfo(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role);
}

function canSeeDashboardEngagementStatus(actor) {
  return [ROLES.SUPERVISOR, ROLES.RESPONSIBLE].includes(actor.role);
}

function canUpdateMyself({ actor, modifiedTarget }) {
  const isMe = actor._id.toString() === modifiedTarget._id.toString();
  return isMe;
}

//CLE

function canCreateClasse(actor) {
  return [ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE].includes(actor.role);
}

function canUpdateClasse(actor) {
  return actor.role === ROLES.ADMINISTRATEUR_CLE || actor.role === ROLES.REFERENT_CLASSE || [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(actor.role);
}

function canUpdateReferentClasse(actor) {
  return [ROLES.ADMINISTRATEUR_CLE, ROLES.ADMIN].includes(actor.role);
}

function canUpdateClasseStay(actor) {
  return [ROLES.REFERENT_REGION, ROLES.ADMIN].includes(actor.role);
}

function canViewClasse(actor) {
  return [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(actor.role);
}

function canUpdateEtablissement(actor) {
  return (
    (actor.role === ROLES.ADMINISTRATEUR_CLE && actor.subRole === SUB_ROLES.referent_etablissement) ||
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(actor.role)
  );
}

function canViewEtablissement(actor) {
  return [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(actor.role);
}

function canSearchStudent(actor) {
  return [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(actor.role);
}

function canWithdrawClasse(actor) {
  return [ROLES.ADMINISTRATEUR_CLE, ROLES.ADMIN].includes(actor.role);
}

function canDeleteClasse(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function canAllowSNU(actor) {
  return [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(actor.role);
}

function canEditEstimatedSeats(actor) {
  if (isAdmin(actor)) return true;
  const now = new Date();
  const limitDateEstimatedSeats = new Date(LIMIT_DATE_ESTIMATED_SEATS);
  return actor.role === ROLES.ADMINISTRATEUR_CLE && now <= limitDateEstimatedSeats;
}

function canEditTotalSeats(actor) {
  if (isAdmin(actor)) return true;
  if ([ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(actor.role)) {
    const now = new Date();
    const limitDateTotalSeat = new Date(LIMIT_DATE_TOTAL_SEATS);
    return now <= limitDateTotalSeat;
  }
  const limitDatesEstimatedSeats = new Date(LIMIT_DATE_ESTIMATED_SEATS).toISOString();
  const limitDatesTotalSeats = new Date(LIMIT_DATE_TOTAL_SEATS).toISOString();
  return [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(actor.role) && isNowBetweenDates(limitDatesEstimatedSeats, limitDatesTotalSeats);
}

function canNotifyAdminCleForVerif(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
}
function canVerifyClasse(actor) {
  return [ROLES.ADMINISTRATEUR_CLE, ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
}

function canManageMig(user: ReferentDto) {
  return ![ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role);
}

function canCreateEtablissement(user: UserDto) {
  return [ROLES.ADMIN].includes(user.role);
}

//CLE
function canValidateMultipleYoungsInClass(actor: UserDto) {
  return [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(actor.role);
}

const phaseStatusOptionsByRole = {
  0: { DEFAULT: [] },
  1: {
    [ROLES.ADMIN]: [YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, YOUNG_STATUS_PHASE1.EXEMPTED, YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.NOT_DONE],
    DEFAULT: [YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.NOT_DONE],
  },
  2: { DEFAULT: [YOUNG_STATUS_PHASE2.WAITING_REALISATION, YOUNG_STATUS_PHASE2.IN_PROGRESS, YOUNG_STATUS_PHASE2.VALIDATED] },
  3: { DEFAULT: [YOUNG_STATUS_PHASE3.WAITING_REALISATION, YOUNG_STATUS_PHASE3.WAITING_VALIDATION, YOUNG_STATUS_PHASE3.VALIDATED] },
};

function getPhaseStatusOptions(actor: UserDto, phase: number) {
  const phaseStatusOptions = phaseStatusOptionsByRole[phase][actor.role] || phaseStatusOptionsByRole[phase].DEFAULT || [];
  if (phase === 1 && isSuperAdmin(actor) && !phaseStatusOptions.includes(YOUNG_STATUS_PHASE1.AFFECTED)) {
    phaseStatusOptions.push(YOUNG_STATUS_PHASE1.AFFECTED);
  }
  return phaseStatusOptions;
}

export function canValidateYoungToLP(actor: UserDto, cohort?: Pick<CohortType, "instructionEndDate" | "youngHTSBasculeLPDisabled">) {
  if (!cohort) return false;

  const isInstructionOpen = isBefore(new Date(), new Date(cohort.instructionEndDate));
  if (isAdmin(actor) || isInstructionOpen) {
    return true;
  }
  if (isReferentDep(actor)) {
    return false;
  }
  if (cohort.youngHTSBasculeLPDisabled) {
    return false;
  }
  // referent regional
  return true;
}

export function canCreateMission(actor: UserDto) {
  return actor.role === ROLES.SUPERVISOR && actor.structureId && actor.structureId !== "DRAFT";
}

export {
  ROLES,
  SUB_ROLES,
  ROLES_LIST,
  SUB_ROLES_LIST,
  SUPPORT_ROLES,
  SUPPORT_ROLES_LIST,
  VISITOR_SUBROLES,
  VISITOR_SUB_ROLES_LIST,
  CENTER_ROLES,
  DURATION_BEFORE_EXPIRATION_2FA_MONCOMPTE_MS,
  DURATION_BEFORE_EXPIRATION_2FA_ADMIN_MS,
  REFERENT_ROLES,
  REFERENT_DEPARTMENT_SUBROLE,
  REFERENT_REGION_SUBROLE,
  ADMINISTRATEUR_CLE_SUBROLE,
  canInviteUser,
  canDeleteYoung,
  canEditYoung,
  canDownloadYoungDocuments,
  canDeleteReferent,
  canViewPatchesHistory,
  canDeletePatchesHistory,
  canViewEmailHistory,
  canViewReferent,
  canUpdateReferent,
  canViewYoungMilitaryPreparationFile,
  canCreateOrUpdateCohesionCenter,
  canCreateOrUpdateSessionPhase1,
  canViewSessionPhase1,
  isSessionEditionOpen,
  isPdrEditionOpen,
  isLigneBusDemandeDeModificationOpen,
  canCreateOrModifyMission,
  canCreateOrUpdateProgram,
  canInviteYoung,
  isReferentOrAdmin,
  isTemporaryAffected,
  FORCE_DISABLED_ASSIGN_COHESION_CENTER,
  FORCE_DISABLED_ASSIGN_MEETING_POINT,
  canAssignCohesionCenter,
  canAssignMeetingPoint,
  canModifyStructure,
  canDeleteStructure,
  canSigninAs,
  canSendFileByMailToYoung,
  canCreateEvent,
  canSearchAssociation,
  canCreateStructure,
  canViewCohesionCenter,
  canSearchSessionPhase1,
  canGetReferentByEmail,
  canViewMeetingPoints,
  canUpdateMeetingPoint,
  canAssignManually,
  canDeleteMeetingPoint,
  canDeleteMeetingPointSession,
  canCreateMeetingPoint,
  canSearchMeetingPoints,
  canViewMeetingPointId,
  canUpdateInscriptionGoals,
  canViewInscriptionGoals,
  canViewTicketTags,
  canGetYoungByEmail,
  canViewYoung,
  canViewYoungFile,
  canViewBus,
  canUpdateBus,
  canCreateBus,
  canViewMission,
  canViewStructures,
  canModifyMissionStructureId,
  canViewStructureChildren,
  canSendTemplateToYoung,
  canViewYoungApplications,
  canCreateYoungApplication,
  canCreateOrUpdateContract,
  canViewContract,
  canCreateOrUpdateDepartmentService,
  canViewDepartmentService,
  canSearchInElasticSearch,
  canRefuseMilitaryPreparation,
  canChangeYoungCohort,
  canSendTutorTemplate,
  canSeeYoungInfo,
  canEditPresenceYoung,
  canShareSessionPhase1,
  canCreateAlerteMessage,
  canReadAlerteMessage,
  canViewTableDeRepartition,
  canEditTableDeRepartitionDepartment,
  canEditTableDeRepartitionRegion,
  canViewSchemaDeRepartition,
  canCreateSchemaDeRepartition,
  canEditSchemaDeRepartition,
  canDeleteSchemaDeRepartition,
  canViewNotes,
  canViewLigneBus,
  canUpdateLigneBus,
  canCreateLigneBus,
  canDeleteLigneBus,
  canSearchLigneBus,
  canEditLigneBusGeneralInfo,
  canEditLigneBusCenter,
  canEditLigneBusPointDeRassemblement,
  canEditLigneBusTeam,
  canExportLigneBus,
  canExportConvoyeur,
  ligneBusCanCreateDemandeDeModification,
  ligneBusCanViewDemandeDeModification,
  ligneBusCanSendMessageDemandeDeModification,
  ligneBusCanEditStatusDemandeDeModification,
  ligneBusCanEditOpinionDemandeDeModification,
  ligneBusCanEditTagsDemandeDeModification,
  canCreateTags,
  isSuperAdmin,
  isAdmin,
  isReferentReg,
  isReferentDep,
  isAdminCle,
  isChefEtablissement,
  isCoordinateurEtablissement,
  isReferentClasse,
  isHeadCenter,
  isHeadCenterAdjoint,
  isReferentSanitaire,
  canSendTimeScheduleReminderForSessionPhase1,
  canSendPlanDeTransport,
  canSendImageRightsForSessionPhase1,
  canPutSpecificDateOnSessionPhase1,
  isBusEditionOpen,
  canCheckIfRefExist,
  canSeeDashboardSejourInfo,
  canSeeDashboardInscriptionInfo,
  canSeeDashboardInscriptionDetail,
  canSeeDashboardEngagementInfo,
  canSeeDashboardEngagementStatus,
  canSeeDashboardSejourHeadCenter,
  canUpdateMyself,
  canCreateClasse,
  canUpdateClasse,
  canUpdateClasseStay,
  canViewClasse,
  canUpdateEtablissement,
  canViewEtablissement,
  canSearchStudent,
  canDeleteClasse,
  canWithdrawClasse,
  canAllowSNU,
  canEditSanitaryEmailContact,
  canEditEstimatedSeats,
  canEditTotalSeats,
  canNotifyAdminCleForVerif,
  canVerifyClasse,
  canManageMig,
  canUpdateReferentClasse,
  canCreateEtablissement,
  canValidateMultipleYoungsInClass,
  getPhaseStatusOptions,
  isReferentRegDep,
  canModifyDirectionCenterTeam,
};
