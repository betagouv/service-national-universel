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

const ROLES_LIST = Object.values(ROLES);
const SUB_ROLES_LIST = Object.values(SUB_ROLES);

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
function canDelete(actor, target) {
  if (actor.role === ROLES.ADMIN) return true;
  // https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  if (actor.role === ROLES.REFERENT_REGION) {
    return (
      ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(
        target.role
      ) &&
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
  return actor.role === "admin";
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

function canUpdateReferent(actor, originalTarget, modifiedTarget) {
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
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(
      originalTarget.role
    ) &&
    // ... witout changing its role.
    [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(
      modifiedTarget.role
    );
  const authorized =
    isAdmin ||
    isResponsibleModifyingResponsibleWithoutChangingRole ||
    isReferentModifyingReferentWithoutChangingRole;
  return authorized;
}

function canViewYoungMilitaryPreparationFile(actor, target) {
  const isAdmin = actor.role === ROLES.ADMIN;
  const isReferentDepartmentFromTargetDepartment =
    actor.role === ROLES.REFERENT_DEPARTMENT &&
    actor.department === target.department;
  const isReferentRegionFromTargetRegion =
    actor.role === ROLES.REFERENT_REGION && actor.region === target.region;
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

function canModifyMission(user, mission) {
  return !(
    (user.role === ROLES.REFERENT_DEPARTMENT &&
      user.department !== mission.department) ||
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
      (user.role === ROLES.REFERENT_DEPARTMENT &&
        user.department !== program.department) ||
      (user.role === ROLES.REFERENT_REGION && user.region !== program.region)
    )
  );
}

function isReferentOrAdmin(user) {
  return [
    ROLES.ADMIN,
    ROLES.REFERENT_DEPARTMENT,
    ROLES.REFERENT_REGION,
  ].includes(user.role);
}

module.exports = {
  ROLES,
  SUB_ROLES,
  ROLES_LIST,
  SUB_ROLES_LIST,
  canInviteUser,
  canDelete,
  canViewPatchesHistory,
  canViewReferent,
  canUpdateReferent,
  canViewYoungMilitaryPreparationFile,
  canCreateOrUpdateCohesionCenter,
  canModifyMission,
  canCreateOrUpdateProgram,
  isReferentOrAdmin,
};
