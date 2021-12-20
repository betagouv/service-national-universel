const ROLES = {
  ADMIN: "admin",
  REFERENT_DEPARTMENT: "referent_department",
  REFERENT_REGION: "referent_region",
  RESPONSIBLE: "responsible",
  SUPERVISOR: "supervisor",
  HEAD_CENTER: "head_center",
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
};

const ROLES_LIST = Object.values(ROLES);
const SUB_ROLES_LIST = Object.values(SUB_ROLES);
const SUPPORT_ROLES_LIST = Object.keys(SUPPORT_ROLES);

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

  // REFERENT_REGION can invite REFERENT_DEPARTMENT, REFERENT_REGION, RESPONSIBLE, SUPERVISOR, HEAD_CENTER
  if (actorRole === ROLES.REFERENT_REGION) {
    return [
      ROLES.REFERENT_DEPARTMENT,
      ROLES.REFERENT_REGION,
      ROLES.HEAD_CENTER,
      ROLES.RESPONSIBLE,
      ROLES.SUPERVISOR,
    ].includes(targetRole);
  }

  // RESPONSIBLE and SUPERVISOR can invite only RESPONSIBLE and SUPERVISOR.
  if (actorRole === ROLES.RESPONSIBLE || actorRole === ROLES.SUPERVISOR) {
    return targetRole === ROLES.RESPONSIBLE || targetRole === ROLES.SUPERVISOR;
  }
}

function canDeleteStructure(actor, target) {
  return actor.role === ROLES.ADMIN;
}

function canDeleteYoung(actor, target) {
  return actor.role === ROLES.ADMIN;
}

function canDeleteReferent(actor, target) {
  if (actor.role === ROLES.ADMIN) return true;
  // https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  if (actor.role === ROLES.REFERENT_REGION) {
    return (
      ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(target.role) &&
        actor.region === target.region) ||
      [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role)
    );
  }
  if (actor.role === ROLES.REFERENT_DEPARTMENT) {
    return (
      (actor.role === target.role && actor.department === target.department) ||
      [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role)
    );
  }
  return false;
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
  return actor.role === ROLES.ADMIN;
}

function canViewReferent(actor, target) {
  const isAdminOrReferent = [
    ROLES.ADMIN,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
  ].includes(actor.role);
  const isResponsibleModifyingResponsible =
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role) &&
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(target.role);
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  return isAdminOrReferent || isResponsibleModifyingResponsible;
}

function canUpdateReferent({ actor, originalTarget, modifiedTarget = null, structure }) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isResponsibleModifyingResponsibleWithoutChangingRole =
    // Is responsible...
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(actor.role) &&
    // ... modifying responsible ...
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(originalTarget.role) &&
    // ... witout changing its role.
    [ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(modifiedTarget.role);

  // TODO: we must handle rights more precisely.
  // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  const isReferentModifyingReferentWithoutChangingRole =
    // Is referent...
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role) &&
    // ... modifying referent ...
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE].includes(
      originalTarget.role
    ) &&
    // ... witout changing its role.
    (modifiedTarget === null ||
      [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.RESPONSIBLE].includes(
        modifiedTarget.role
      ));

  const isActorAndTargetInTheSameRegion =
    actor.region === (originalTarget.region || (structure && structure.region))
  const isActorAndTargetInTheSameDepartment =
    actor.department === (originalTarget.department || (structure && structure.department));

  const authorized =
    (isAdmin ||
      isResponsibleModifyingResponsibleWithoutChangingRole ||
      isReferentModifyingReferentWithoutChangingRole) &&
    (actor.role === ROLES.REFERENT_REGION ? isActorAndTargetInTheSameRegion : true) &&
    (actor.role === ROLES.REFERENT_DEPARTMENT ? isActorAndTargetInTheSameDepartment : true);
  return authorized;
}

function canViewYoungMilitaryPreparationFile(actor, target) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentDepartmentFromTargetDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
  const isReferentRegionFromTargetRegion =
    actor.role === ROLES.REFERENT_REGION && actor.region === target.region;
  const authorized =
    isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
  return authorized;
}

function canCreateOrUpdateCohesionCenter(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
}
function canCreateOrUpdateSessionPhase1(actor) {
  return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(actor.role);
}

function canModifyMission(user, mission) {
  return !(
    (user.role === ROLES.REFERENT_DEPARTMENT && user.department !== mission.department) ||
    (user.role === ROLES.REFERENT_REGION && user.region !== mission.region)
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
      (user.role === ROLES.REFERENT_DEPARTMENT && user.department !== program.department) ||
      (user.role === ROLES.REFERENT_REGION && user.region !== program.region)
    )
  );
}
function canModifyStructure(user, structure) {
  const isAdmin = user.role === ROLES.ADMIN;
  const isReferentRegionFromSameRegion =
    user.role === ROLES.REFERENT_REGION && user.region === structure.region;
  const isReferentDepartmentFromSameDepartment =
    user.role === ROLES.REFERENT_DEPARTMENT && user.department === structure.department;
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

function isReferentOrAdmin(user) {
  return [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role);
}

const FORCE_DISABLED_ASSIGN_COHESION_CENTER = false;
const canAssignCohesionCenter = (user) =>
  !FORCE_DISABLED_ASSIGN_COHESION_CENTER && isReferentOrAdmin(user);

const FORCE_DISABLED_ASSIGN_MEETING_POINT = true;
const canAssignMeetingPoint = (user) =>
  !FORCE_DISABLED_ASSIGN_MEETING_POINT && isReferentOrAdmin(user);

const canSigninAs = (actor, target) => {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentRegionFromSameRegion =
    actor.role === ROLES.REFERENT_REGION && actor.region === target.region;
  const isReferentDepartmentFromSameDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
  return (
    (target.constructor.modelName === "referent" && isAdmin) ||
    (target.constructor.modelName === "young" &&
      (isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment))
  );
};

const canSendFileByMail = (actor, target) => {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentRegionFromSameRegion =
    actor.role === ROLES.REFERENT_REGION && actor.region === target.region;
  const isReferentDepartmentFromSameDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
  return isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment;
};

module.exports = {
  ROLES,
  SUB_ROLES,
  ROLES_LIST,
  SUB_ROLES_LIST,
  SUPPORT_ROLES,
  SUPPORT_ROLES_LIST,
  canInviteUser,
  canDeleteYoung,
  canDeleteReferent,
  canViewPatchesHistory,
  canViewEmailHistory,
  canViewReferent,
  canUpdateReferent,
  canViewYoungMilitaryPreparationFile,
  canCreateOrUpdateCohesionCenter,
  canCreateOrUpdateSessionPhase1,
  canModifyMission,
  canCreateOrUpdateProgram,
  isReferentOrAdmin,
  FORCE_DISABLED_ASSIGN_COHESION_CENTER,
  FORCE_DISABLED_ASSIGN_MEETING_POINT,
  canAssignCohesionCenter,
  canAssignMeetingPoint,
  canModifyStructure,
  canDeleteStructure,
  canSigninAs,
  canSendFileByMail,
};
