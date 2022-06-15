const ROLES = {
  ADMIN: "admin",
  REFERENT_DEPARTMENT: "referent_department",
  REFERENT_REGION: "referent_region",
  RESPONSIBLE: "responsible",
  SUPERVISOR: "supervisor",
  HEAD_CENTER: "head_center",
  VISITOR: "visitor",
};

const SUB_ROLES = {
  manager_department: "manager_department",
  assistant_manager_department: "assistant_manager_department",
  manager_phase2: "manager_phase2",
  secretariat: "secretariat",
  coordinator: "coordinator",
  assistant_coordinator: "assistant_coordinator",
  none: "",
};

const SUPPORT_ROLES = {
  admin: "Modérateur",
  referent: "Référent",
  structure: "Structure",
  head_center: "Chef de Centre",
  young: "Volontaire",
  public: "Public",
  visitor: "Visiteur",
};

const VISITOR_SUBROLES = {
  recteur_region: "Recteur de région académique",
  recteur: "Recteur d’académie",
  vice_recteur: "Vice-recteur d'académie",
  dasen: "Directeur académique des services de l’éducation nationale (DASEN)",
  sgra: "Secrétaire général de région académique (SGRA)",
  sga: "Secrétaire général d’académie (SGA)",
  drajes:
    "Délégué régional académique à la jeunesse, à l’engagement et aux sports (DRAJES)",
  other: "Autre",
};

const CENTER_ROLES = {
  chef: "Chef de centre",
  adjoint: "Chef de centre adjoint",
  cadre_specialise: "Cadre spécialisé",
  cadre_compagnie: "Cadre de compagnie",
  tuteur: "Tuteur de maisonnée",
};

const ROLES_LIST = Object.values(ROLES);
const SUB_ROLES_LIST = Object.values(SUB_ROLES);
const SUPPORT_ROLES_LIST = Object.keys(SUPPORT_ROLES);
const VISITOR_SUB_ROLES_LIST = Object.keys(VISITOR_SUBROLES);

function canInviteUser(actorRole, targetRole) {
  // Admins can invite any user
  if (actorRole === ROLES.ADMIN) return true;

  // REFERENT_DEPARTMENT can invite REFERENT_DEPARTMENT, RESPONSIBLE, SUPERVISOR, HEAD_CENTER
  if (actorRole === ROLES.REFERENT_DEPARTMENT) {
    return [
      ROLES.REFERENT_DEPARTMENT,
      ROLES.HEAD_CENTER,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
    ].includes(targetRole);
  }

  // REFERENT_REGION can invite REFERENT_DEPARTMENT, REFERENT_REGION, RESPONSIBLE, SUPERVISOR, HEAD_CENTER, VISITOR
  if (actorRole === ROLES.REFERENT_REGION) {
    return [
      ROLES.REFERENT_DEPARTMENT,
      ROLES.REFERENT_REGION,
      ROLES.HEAD_CENTER,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
      ROLES.VISITOR,
    ].includes(targetRole);
  }

  // RESPONSIBLE and SUPERVISOR can invite only RESPONSIBLE and SUPERVISOR.
  if (actorRole === ROLES.RESPONSIBLE || actorRole === ROLES.SUPERVISOR) {
    return targetRole === ROLES.RESPONSIBLE || targetRole === ROLES.SUPERVISOR;
  }

  return false;
}

function canDeleteStructure(actor, target) {
  return actor.role === ROLES.ADMIN;
}

function canDeleteYoung(actor, young) {
  const isAdmin = actor.role === ROLES.ADMIN;

  const actorAndTargetInTheSameRegion = actor.region === young.region;
  const actorAndTargetInTheSameDepartment = actor.department.includes(
    young.department
  );

  const referentRegionFromTheSameRegion =
    actor.role === ROLES.REFERENT_REGION && actorAndTargetInTheSameRegion;
  const referentDepartmentFromTheSameDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    actorAndTargetInTheSameDepartment;

  const authorized =
    isAdmin ||
    referentRegionFromTheSameRegion ||
    referentDepartmentFromTheSameDepartment;
  return authorized;
}

function canEditYoung(actor, young) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isHeadCenter = actor.role === ROLES.HEAD_CENTER;

  const actorAndTargetInTheSameRegion = actor.region === young.region;
  const actorAndTargetInTheSameDepartment = actor.department.includes(
    young.department
  );
  const referentRegionFromTheSameRegion =
    actor.role === ROLES.REFERENT_REGION && actorAndTargetInTheSameRegion;
  const referentDepartmentFromTheSameDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    actorAndTargetInTheSameDepartment;

  const authorized =
    isAdmin ||
    isHeadCenter ||
    referentRegionFromTheSameRegion ||
    referentDepartmentFromTheSameDepartment;
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

  const actorAndTargetInTheSameRegion =
    actor.region === geographicTargetData.region;
  // Check si il y a au moins un match entre les departements de la target et de l'actor
  const actorAndTargetInTheSameDepartment = actor.department.some(
    (department) => geographicTargetData.department.includes(department)
  );

  const targetIsReferentRegion = originalTarget.role === ROLES.REFERENT_REGION;
  const targetIsReferentDepartment =
    originalTarget.role === ROLES.REFERENT_DEPARTMENT;
  const targetIsSupervisor = originalTarget.role === ROLES.SUPERVISOR;
  const targetIsResponsible = originalTarget.role === ROLES.RESPONSIBLE;
  const targetIsVisitor = originalTarget.role === ROLES.VISITOR;
  const targetIsHeadCenter = originalTarget.role === ROLES.HEAD_CENTER;

  // actor is referent region
  const referentRegionFromTheSameRegion =
    actor.role === ROLES.REFERENT_REGION &&
    targetIsReferentRegion &&
    actorAndTargetInTheSameRegion;
  const referentDepartmentFromTheSameRegion =
    actor.role === ROLES.REFERENT_REGION &&
    targetIsReferentDepartment &&
    actorAndTargetInTheSameRegion;
  const referentResponsibleFromTheSameRegion =
    actor.role === ROLES.REFERENT_REGION &&
    targetIsResponsible &&
    actorAndTargetInTheSameRegion;
  const responsibleFromTheSameRegion =
    actor.role === ROLES.REFERENT_REGION &&
    targetIsResponsible &&
    actorAndTargetInTheSameRegion;
  const visitorFromTheSameRegion =
    actor.role === ROLES.REFERENT_REGION &&
    targetIsVisitor &&
    actorAndTargetInTheSameRegion;
  const headCenterFromTheSameRegion =
    actor.role === ROLES.REFERENT_REGION &&
    targetIsHeadCenter &&
    actorAndTargetInTheSameRegion;

  // actor is referent department
  const referentDepartmentFromTheSameDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    targetIsReferentDepartment &&
    actorAndTargetInTheSameDepartment;
  const responsibleFromTheSameDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    targetIsResponsible &&
    actorAndTargetInTheSameDepartment;
  const headCenterFromTheSameDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    targetIsHeadCenter &&
    actorAndTargetInTheSameDepartment;

  // same substructure
  const responsibleFromSameStructure =
    (targetIsResponsible || targetIsSupervisor) &&
    actor.structureId === originalTarget.structureId;
  const supervisorOfMainStructure =
    structure && isSupervisor && actor.structureId === structure.networkId;

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
  const isAdminOrReferent = [
    ROLES.ADMIN,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
  ].includes(actor.role);
  return isAdminOrReferent;
}

function canViewEmailHistory(actor) {
  const isAdminOrReferent = [
    ROLES.ADMIN,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
  ].includes(actor.role);
  return isAdminOrReferent;
}

function canViewReferent(actor, target) {
  const isMe = actor.id === target.id;
  const isAdminOrReferent = [
    ROLES.ADMIN,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
  ].includes(actor.role);
  const isResponsibleModifyingResponsible =
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role) &&
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role);
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  return isMe || isAdminOrReferent || isResponsibleModifyingResponsible;
}

function canUpdateReferent({
  actor,
  originalTarget,
  modifiedTarget = null,
  structure,
}) {
  const isMe = actor.id === originalTarget.id;
  const isAdmin = actor.role === ROLES.ADMIN;
  const withoutChangingRole =
    modifiedTarget === null ||
    !("role" in modifiedTarget) ||
    modifiedTarget.role === originalTarget.role;
  const isResponsibleModifyingResponsibleWithoutChangingRole =
    // Is responsible...
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role) &&
    // ... modifying responsible ...
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(originalTarget.role) &&
    withoutChangingRole;

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
    [
      ROLES.REFERENT_DEPARTMENT,
      ROLES.REFERENT_REGION,
      ROLES.RESPONSIBLE,
    ].includes(originalTarget.role) &&
    // ... witout changing its role.
    (modifiedTarget === null ||
      [
        ROLES.REFERENT_DEPARTMENT,
        ROLES.REFERENT_REGION,
        ROLES.RESPONSIBLE,
      ].includes(modifiedTarget.role));
  const isReferentModifyingHeadCenterWithoutChangingRole =
    // Is referent...
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role) &&
    // ... modifying referent ...
    originalTarget.role === ROLES.HEAD_CENTER &&
    // ... witout changing its role.
    (modifiedTarget === null ||
      [ROLES.HEAD_CENTER].includes(modifiedTarget.role));

  const geographicTargetData = {
    region: originalTarget.region || structure?.region,
    department: originalTarget.department || [structure?.department],
  };

  const isActorAndTargetInTheSameRegion =
    actor.region === geographicTargetData.region;
  // Check si il y a au moins un match entre les departements de la target et de l'actor
  const isActorAndTargetInTheSameDepartment = actor.department.some(
    (department) => geographicTargetData.department.includes(department)
  );

  const authorized =
    (isMeWithoutChangingRole ||
      isAdmin ||
      isResponsibleModifyingResponsibleWithoutChangingRole ||
      isReferentModifyingReferentWithoutChangingRole ||
      isReferentModifyingHeadCenterWithoutChangingRole) &&
    (actor.role === ROLES.REFERENT_REGION
      ? isActorAndTargetInTheSameRegion
      : true) &&
    (actor.role === ROLES.REFERENT_DEPARTMENT
      ? isActorAndTargetInTheSameDepartment
      : true);
  return authorized;
}

function canViewYoungMilitaryPreparationFile(actor, young) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentDepartmentFromTargetDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    actor.department.includes(young.department);
  const isReferentRegionFromTargetRegion =
    actor.role === ROLES.REFERENT_REGION && actor.region === young.region;
  const authorized =
    isAdmin ||
    isReferentDepartmentFromTargetDepartment ||
    isReferentRegionFromTargetRegion;
  return authorized;
}

function canRefuseMilitaryPreparation(actor, young) {
  return (
    canViewYoungMilitaryPreparationFile(actor, young) ||
    [ROLES.RESPONSIBLE, ROLES.REFERENT_REGION].includes(actor.role)
  );
}

function canViewYoungFile(actor, young) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentDepartmentFromTargetDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    actor.department.includes(young.department);
  const isReferentRegionFromTargetRegion =
    actor.role === ROLES.REFERENT_REGION && actor.region === young.region;
  const authorized =
    isAdmin ||
    isReferentDepartmentFromTargetDepartment ||
    isReferentRegionFromTargetRegion;
  return authorized;
}

function canCreateOrUpdateCohesionCenter(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
  ].includes(actor.role);
}

function canCreateEvent(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}
function canCreateOrUpdateSessionPhase1(actor, target) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferent = [
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
  ].includes(actor.role);
  const isHeadCenter =
    actor.role === ROLES.HEAD_CENTER && actor.id === target.headCenterId;

  return isAdmin || isReferent || isHeadCenter;
}

function canSearchSessionPhase1(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
  ].includes(actor.role);
}

function canViewSessionPhase1(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
  ].includes(actor.role);
}

function canCreateOrModifyMission(user, mission) {
  return (
    !(
      (user.role === ROLES.REFERENT_DEPARTMENT &&
        !user.department.includes(mission.department)) ||
      (user.role === ROLES.REFERENT_REGION && user.region !== mission.region)
    ) && user.role !== ROLES.VISITOR
  );
}

function canCreateOrUpdateProgram(user, program) {
  const isAdminOrReferent = [
    ROLES.ADMIN,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
  ].includes(user.role);
  return (
    isAdminOrReferent &&
    !(
      (user.role === ROLES.REFERENT_DEPARTMENT &&
        !user.department.includes(program.department)) ||
      (user.role === ROLES.REFERENT_REGION && user.region !== program.region)
    )
  );
}
function canModifyStructure(user, structure) {
  const isAdmin = user.role === ROLES.ADMIN;
  const isReferentRegionFromSameRegion =
    user.role === ROLES.REFERENT_REGION && user.region === structure.region;
  const isReferentDepartmentFromSameDepartment =
    user.role === ROLES.REFERENT_DEPARTMENT &&
    user.department.includes(structure.department);
  const isResponsibleModifyingOwnStructure =
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role) &&
    structure._id.equals(user.structureId);
  const isSupervisorModifyingChild =
    user.role === ROLES.SUPERVISOR && user.structureId === structure.networkId;

  return (
    isAdmin ||
    isReferentRegionFromSameRegion ||
    isReferentDepartmentFromSameDepartment ||
    isResponsibleModifyingOwnStructure ||
    isSupervisorModifyingChild
  );
}

function canCreateStructure(user) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
  ].includes(user.role);
}

function isAdmin(user) {
  return ROLES.ADMIN === user.role;
}

function isReferent(user) {
  [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
}

function isReferentOrAdmin(user) {
  return isAdmin(user) || isReferent(user);
}

const FORCE_DISABLED_ASSIGN_COHESION_CENTER = false;
const canAssignCohesionCenter = (user) =>
  !FORCE_DISABLED_ASSIGN_COHESION_CENTER &&
  [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role);

const FORCE_DISABLED_ASSIGN_MEETING_POINT = false;
const canAssignMeetingPoint = (user) =>
  !FORCE_DISABLED_ASSIGN_MEETING_POINT && isReferentOrAdmin(user);

const canEditPresenceYoung = (actor, target) => {
  // todo affiner les droits
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
  ].includes(actor.role);
};

// ? La fonction ne marche pas avec les targets qui sont des responsables de structures
const canSigninAs = (actor, target) => {
  if (isAdmin(actor)) return true;
  if (!isReferent(actor)) return false;
  if (target.constructor.modelName !== "young") return false;

  const isReferentRegionFromSameRegion =
    actor.role === ROLES.REFERENT_REGION && actor.region === target.region;
  const isReferentDepartmentFromSameDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    actor.department.includes(target.department);
  return (
    isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment
  );
};

const canSendFileByMailToYoung = (actor, young) => {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentRegionFromSameRegion =
    actor.role === ROLES.REFERENT_REGION && actor.region === young.region;
  const isReferentDepartmentFromSameDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    actor.department.includes(young.department);
  return (
    isAdmin ||
    isReferentRegionFromSameRegion ||
    isReferentDepartmentFromSameDepartment
  );
};

function canSearchAssociation(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}

function canViewCohesionCenter(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
  ].includes(actor.role);
}

function canGetReferentByEmail(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
  ].includes(actor.role);
}

function canViewMeetingPoints(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
  ].includes(actor.role);
}

function canUpdateMeetingPoint(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function canDeleteMeetingPoint(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function canCreateMeetingPoint(actor) {
  return [ROLES.ADMIN].includes(actor.role);
}

function canSearchMeetingPoints(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}

function canUpdateInscriptionGoals(actor) {
  return actor.role === ROLES.ADMIN;
}

function canViewInscriptionGoals(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
    ROLES.VISITOR,
  ].includes(actor.role);
}

function canViewTicketTags(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}

function canGetYoungByEmail(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}

function canViewYoung(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
  ].includes(actor.role);
}

function canViewBus(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}

function canUpdateBus(actor) {
  return actor.role === ROLES.ADMIN;
}

function canCreateBus(actor) {
  return actor.role === ROLES.ADMIN;
}

function canViewMission(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
  ].includes(actor.role);
}

function canViewStructures(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.HEAD_CENTER,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
  ].includes(actor.role);
}

function canModifyMissionStructureId(actor) {
  return actor.role === ROLES.ADMIN;
}

function canViewStructureChildren(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
  ].includes(actor.role);
}

function canDownloadYoungDocuments(actor, target) {
  return canEditYoung(actor, target);
}

function canInviteYoung(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}

function canSendTemplateToYoung(actor, young) {
  return canEditYoung(actor, young);
}

function canViewYoungApplications(actor, young) {
  return (
    canEditYoung(actor, young) ||
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role)
  );
}

function canCreateYoungApplication(actor, young) {
  return (
    canEditYoung(actor, young) ||
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role)
  );
}

function canCreateOrUpdateContract(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
  ].includes(actor.role);
}

function canViewContract(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
  ].includes(actor.role);
}

function canCreateOrUpdateDepartmentService(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
  ].includes(actor.role);
}

function canChangeYoungCohort(actor, young) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentDepartmentFromTargetDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    actor.department.includes(young.department);
  const isReferentRegionFromTargetRegion =
    actor.role === ROLES.REFERENT_REGION && actor.region === target.region;
  const authorized =
    isAdmin ||
    isReferentDepartmentFromTargetDepartment ||
    isReferentRegionFromTargetRegion;
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
  ].includes(actor.role);
}

function canSearchInElasticSearch(actor, index) {
  if (index === "mission") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
    ].includes(actor.role);
  } else if (index === "school") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
      ROLES.HEAD_CENTER,
    ].includes(actor.role);
  } else if (index === "young-having-school-in-department") {
    return [ROLES.REFERENT_DEPARTMENT].includes(actor.role);
  } else if (index === "young-having-school-in-region") {
    return [ROLES.REFERENT_REGION].includes(actor.role);
  } else if (index === "cohesionyoung") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
    ].includes(actor.role);
  } else if (index === "sessionphase1young") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
      ROLES.HEAD_CENTER,
    ].includes(actor.role);
  } else if (index === "structure") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
    ].includes(actor.role);
  } else if (index === "referent") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
      ROLES.HEAD_CENTER,
    ].includes(actor.role);
  } else if (index === "application") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
    ].includes(actor.role);
  } else if (index === "cohesioncenter") {
    return [
      ROLES.ADMIN,
      ROLES.REFERENT_REGION,
      ROLES.REFERENT_DEPARTMENT,
    ].includes(actor.role);
  } else if (index === "team") {
    return [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(
      actor.role
    );
  }
  return false;
}

function canSendTutorTemplate(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.RESPONSIBLE,
    ROLES.SUPERVISOR,
  ].includes(actor.role);
}

function canShareSessionPhase1(actor) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_REGION,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.RESPONSIBLE,
    ROLES.HEAD_CENTER,
  ].includes(actor.role);
}

module.exports = {
  ROLES,
  SUB_ROLES,
  ROLES_LIST,
  SUB_ROLES_LIST,
  SUPPORT_ROLES,
  SUPPORT_ROLES_LIST,
  VISITOR_SUBROLES,
  VISITOR_SUB_ROLES_LIST,
  CENTER_ROLES,
  canInviteUser,
  canDeleteYoung,
  canEditYoung,
  canDownloadYoungDocuments,
  canDeleteReferent,
  canViewPatchesHistory,
  canViewEmailHistory,
  canViewReferent,
  canUpdateReferent,
  canViewYoungMilitaryPreparationFile,
  canCreateOrUpdateCohesionCenter,
  canCreateOrUpdateSessionPhase1,
  canViewSessionPhase1,
  canCreateOrModifyMission,
  canCreateOrUpdateProgram,
  canInviteYoung,
  isReferentOrAdmin,
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
  canDeleteMeetingPoint,
  canCreateMeetingPoint,
  canSearchMeetingPoints,
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
  canEditPresenceYoung,
  canShareSessionPhase1,
};
