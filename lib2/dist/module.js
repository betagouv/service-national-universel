var $cf838c15c8b009ba$exports = {};
var $535cc80e997d96fd$exports = {};
const $535cc80e997d96fd$var$colors = {
    purple: "#5145cd",
    blue: "#2563EB",
    transPurple: "#5145cd66",
    darkPurple: "#382F79",
    green: "#6CC763",
    darkGreen: "#1C7713",
    red: "#BE3B12",
    lightOrange: "#ffa987",
    orange: "#FE7B52",
    yellow: "#FEB951",
    pink: "#F8A9AD",
    lightGold: "#d9bb71",
    extraLightGrey: "#fafafa",
    lightGrey: "#d7d7d7",
    grey: "#6e757c",
    lightBlueGrey: "#e6ebfa",
    darkBlue: "#00008b",
    black: "#111111"
};
const $535cc80e997d96fd$var$PHASE_STATUS_COLOR = {
    VALIDATED: $535cc80e997d96fd$var$colors.green,
    DONE: $535cc80e997d96fd$var$colors.green,
    CANCEL: $535cc80e997d96fd$var$colors.orange,
    EXEMPTED: $535cc80e997d96fd$var$colors.orange,
    IN_PROGRESS: $535cc80e997d96fd$var$colors.purple,
    AFFECTED: $535cc80e997d96fd$var$colors.purple,
    WITHDRAWN: $535cc80e997d96fd$var$colors.red,
    WAITING_ACCEPTATION: $535cc80e997d96fd$var$colors.yellow
};
const $535cc80e997d96fd$var$APPLICATION_STATUS_COLORS = {
    WAITING_VALIDATION: $535cc80e997d96fd$var$colors.orange,
    WAITING_VERIFICATION: $535cc80e997d96fd$var$colors.orange,
    WAITING_ACCEPTATION: $535cc80e997d96fd$var$colors.yellow,
    VALIDATED: $535cc80e997d96fd$var$colors.green,
    DONE: $535cc80e997d96fd$var$colors.darkGreen,
    REFUSED: $535cc80e997d96fd$var$colors.pink,
    CANCEL: $535cc80e997d96fd$var$colors.lightOrange,
    IN_PROGRESS: $535cc80e997d96fd$var$colors.darkPurple,
    ABANDON: $535cc80e997d96fd$var$colors.red
};
const $535cc80e997d96fd$var$YOUNG_STATUS_COLORS = {
    WAITING_VALIDATION: $535cc80e997d96fd$var$colors.orange,
    WAITING_CORRECTION: $535cc80e997d96fd$var$colors.yellow,
    VALIDATED: $535cc80e997d96fd$var$colors.green,
    REFUSED: $535cc80e997d96fd$var$colors.pink,
    IN_PROGRESS: $535cc80e997d96fd$var$colors.darkPurple,
    WITHDRAWN: $535cc80e997d96fd$var$colors.lightGrey,
    WAITING_REALISATION: $535cc80e997d96fd$var$colors.orange,
    AFFECTED: $535cc80e997d96fd$var$colors.darkPurple,
    WAITING_AFFECTATION: $535cc80e997d96fd$var$colors.yellow,
    WAITING_ACCEPTATION: $535cc80e997d96fd$var$colors.yellow,
    NOT_ELIGIBLE: $535cc80e997d96fd$var$colors.orange,
    CANCEL: $535cc80e997d96fd$var$colors.orange,
    EXEMPTED: $535cc80e997d96fd$var$colors.orange,
    DONE: $535cc80e997d96fd$var$colors.green,
    NOT_DONE: $535cc80e997d96fd$var$colors.red,
    WAITING_LIST: $535cc80e997d96fd$var$colors.lightOrange,
    DELETED: $535cc80e997d96fd$var$colors.lightGrey,
    ABANDONED: $535cc80e997d96fd$var$colors.red
};
const $535cc80e997d96fd$var$MISSION_STATUS_COLORS = {
    WAITING_VALIDATION: $535cc80e997d96fd$var$colors.orange,
    WAITING_CORRECTION: $535cc80e997d96fd$var$colors.yellow,
    VALIDATED: $535cc80e997d96fd$var$colors.green,
    DRAFT: $535cc80e997d96fd$var$colors.lightGold,
    REFUSED: $535cc80e997d96fd$var$colors.pink,
    CANCEL: $535cc80e997d96fd$var$colors.lightOrange,
    ARCHIVED: $535cc80e997d96fd$var$colors.lightGrey
};
const $535cc80e997d96fd$var$STRUCTURE_STATUS_COLORS = {
    WAITING_VALIDATION: $535cc80e997d96fd$var$colors.orange,
    WAITING_CORRECTION: $535cc80e997d96fd$var$colors.yellow,
    VALIDATED: $535cc80e997d96fd$var$colors.green,
    DRAFT: $535cc80e997d96fd$var$colors.lightGold
};
const $535cc80e997d96fd$var$CONTRACT_STATUS_COLORS = {
    DRAFT: $535cc80e997d96fd$var$colors.yellow,
    SENT: $535cc80e997d96fd$var$colors.orange,
    VALIDATED: $535cc80e997d96fd$var$colors.green
};
$535cc80e997d96fd$exports = {
    PHASE_STATUS_COLOR: $535cc80e997d96fd$var$PHASE_STATUS_COLOR,
    APPLICATION_STATUS_COLORS: $535cc80e997d96fd$var$APPLICATION_STATUS_COLORS,
    YOUNG_STATUS_COLORS: $535cc80e997d96fd$var$YOUNG_STATUS_COLORS,
    MISSION_STATUS_COLORS: $535cc80e997d96fd$var$MISSION_STATUS_COLORS,
    STRUCTURE_STATUS_COLORS: $535cc80e997d96fd$var$STRUCTURE_STATUS_COLORS,
    CONTRACT_STATUS_COLORS: $535cc80e997d96fd$var$CONTRACT_STATUS_COLORS,
    colors: $535cc80e997d96fd$var$colors
};


var $128713a3f1d64b6d$exports = {};
const $128713a3f1d64b6d$var$formatDay = (date)=>{
    if (!date) return "-";
    return new Date(date).toISOString().split("T")[0];
};
const $128713a3f1d64b6d$var$formatDateFR = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR");
};
const $128713a3f1d64b6d$var$formatLongDateFR = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
    });
};
const $128713a3f1d64b6d$var$formatDateFRTimezoneUTC = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", {
        timeZone: "UTC"
    });
};
const $128713a3f1d64b6d$var$formatLongDateUTC = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC"
    });
};
const $128713a3f1d64b6d$var$formatLongDateUTCWithoutTime = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", {
        timeZone: "UTC"
    });
};
const $128713a3f1d64b6d$var$formatStringLongDate = (date)=>{
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};
const $128713a3f1d64b6d$var$formatStringDate = (date)=>{
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};
const $128713a3f1d64b6d$var$formatStringDateTimezoneUTC = (date)=>{
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
    });
};
function $128713a3f1d64b6d$var$dateForDatePicker(d) {
    return new Date(d).toISOString().split("T")[0];
}
function $128713a3f1d64b6d$var$getAge(d) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(date - now);
    const age = Math.floor(diffTime / 31557600000);
    if (!age || isNaN(age)) return "?";
    return age;
}
const $128713a3f1d64b6d$var$getLimitDateForPhase2 = (cohort)=>{
    if (cohort === "2019") return "23 mars 2021";
    if (cohort === "2020") return "31 décembre 2021 ";
    return "30 juin 2022";
};
$128713a3f1d64b6d$exports = {
    formatDay: $128713a3f1d64b6d$var$formatDay,
    formatDateFR: $128713a3f1d64b6d$var$formatDateFR,
    formatLongDateFR: $128713a3f1d64b6d$var$formatLongDateFR,
    formatDateFRTimezoneUTC: $128713a3f1d64b6d$var$formatDateFRTimezoneUTC,
    formatLongDateUTC: $128713a3f1d64b6d$var$formatLongDateUTC,
    formatStringLongDate: $128713a3f1d64b6d$var$formatStringLongDate,
    formatStringDate: $128713a3f1d64b6d$var$formatStringDate,
    formatStringDateTimezoneUTC: $128713a3f1d64b6d$var$formatStringDateTimezoneUTC,
    dateForDatePicker: $128713a3f1d64b6d$var$dateForDatePicker,
    getAge: $128713a3f1d64b6d$var$getAge,
    getLimitDateForPhase2: $128713a3f1d64b6d$var$getLimitDateForPhase2,
    formatLongDateUTCWithoutTime: $128713a3f1d64b6d$var$formatLongDateUTCWithoutTime
};


var $8618afcb3bea0caa$exports = {};
var $71db770c56d953aa$exports = {};
const $71db770c56d953aa$var$ROLES = {
    ADMIN: "admin",
    REFERENT_DEPARTMENT: "referent_department",
    REFERENT_REGION: "referent_region",
    RESPONSIBLE: "responsible",
    SUPERVISOR: "supervisor",
    HEAD_CENTER: "head_center",
    VISITOR: "visitor"
};
const $71db770c56d953aa$var$SUB_ROLES = {
    manager_department: "manager_department",
    assistant_manager_department: "assistant_manager_department",
    manager_phase2: "manager_phase2",
    secretariat: "secretariat",
    coordinator: "coordinator",
    assistant_coordinator: "assistant_coordinator",
    none: ""
};
const $71db770c56d953aa$var$SUPPORT_ROLES = {
    admin: "Modérateur",
    referent: "Référent",
    structure: "Structure",
    head_center: "Chef de Centre",
    young: "Volontaire",
    public: "Public",
    visitor: "Visiteur"
};
const $71db770c56d953aa$var$VISITOR_SUBROLES = {
    recteur_region: "Recteur de région académique",
    recteur: "Recteur d’académie",
    vice_recteur: "Vice-recteur d'académie",
    dasen: "Directeur académique des services de l’éducation nationale (DASEN)",
    sgra: "Secrétaire général de région académique (SGRA)",
    sga: "Secrétaire général d’académie (SGA)",
    drajes: "Délégué régional académique à la jeunesse, à l’engagement et aux sports (DRAJES)",
    other: "Autre"
};
const $71db770c56d953aa$var$CENTER_ROLES = {
    chef: "Chef de centre",
    adjoint: "Chef de centre adjoint",
    cadre_specialise: "Cadre spécialisé",
    cadre_compagnie: "Cadre de compagnie",
    tuteur: "Tuteur de maisonnée"
};
const $71db770c56d953aa$var$ROLES_LIST = Object.values($71db770c56d953aa$var$ROLES);
const $71db770c56d953aa$var$SUB_ROLES_LIST = Object.values($71db770c56d953aa$var$SUB_ROLES);
const $71db770c56d953aa$var$SUPPORT_ROLES_LIST = Object.keys($71db770c56d953aa$var$SUPPORT_ROLES);
const $71db770c56d953aa$var$VISITOR_SUB_ROLES_LIST = Object.keys($71db770c56d953aa$var$VISITOR_SUBROLES);
function $71db770c56d953aa$var$canInviteUser(actorRole, targetRole) {
    // Admins can invite any user
    if (actorRole === $71db770c56d953aa$var$ROLES.ADMIN) return true;
    // REFERENT_DEPARTMENT can invite REFERENT_DEPARTMENT, RESPONSIBLE, SUPERVISOR, HEAD_CENTER
    if (actorRole === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT) return [
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(targetRole);
    // REFERENT_REGION can invite REFERENT_DEPARTMENT, REFERENT_REGION, RESPONSIBLE, SUPERVISOR, HEAD_CENTER, VISITOR
    if (actorRole === $71db770c56d953aa$var$ROLES.REFERENT_REGION) return [
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR,
        $71db770c56d953aa$var$ROLES.VISITOR
    ].includes(targetRole);
    // RESPONSIBLE and SUPERVISOR can invite only RESPONSIBLE and SUPERVISOR.
    if (actorRole === $71db770c56d953aa$var$ROLES.RESPONSIBLE || actorRole === $71db770c56d953aa$var$ROLES.SUPERVISOR) return targetRole === $71db770c56d953aa$var$ROLES.RESPONSIBLE || targetRole === $71db770c56d953aa$var$ROLES.SUPERVISOR;
    return false;
}
function $71db770c56d953aa$var$canDeleteStructure(actor) {
    return actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
}
function $71db770c56d953aa$var$canDeleteYoung(actor, target) {
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const actorAndTargetInTheSameRegion = actor.region === target.region;
    const actorAndTargetInTheSameDepartment = actor.department === target.department;
    const referentRegionFromTheSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && actorAndTargetInTheSameRegion;
    const referentDepartmentFromTheSameDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && actorAndTargetInTheSameDepartment;
    const authorized = isAdmin || referentRegionFromTheSameRegion || referentDepartmentFromTheSameDepartment;
    return authorized;
}
function $71db770c56d953aa$var$canEditYoung(actor, target) {
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const isHeadCenter = actor.role === $71db770c56d953aa$var$ROLES.HEAD_CENTER;
    const actorAndTargetInTheSameRegion = actor.region === target.region;
    const actorAndTargetInTheSameDepartment = actor.department === target.department;
    const referentRegionFromTheSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && actorAndTargetInTheSameRegion;
    const referentDepartmentFromTheSameDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && actorAndTargetInTheSameDepartment;
    const authorized = isAdmin || isHeadCenter || referentRegionFromTheSameRegion || referentDepartmentFromTheSameDepartment;
    return authorized;
}
function $71db770c56d953aa$var$canDeleteReferent({ actor: actor , originalTarget: originalTarget , structure: structure  }) {
    // TODO: we must handle rights more precisely.
    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    const isMe = actor._id === originalTarget._id;
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const isSupervisor = actor.role === $71db770c56d953aa$var$ROLES.SUPERVISOR;
    const actorAndTargetInTheSameRegion = actor.region === (originalTarget.region || structure && structure.region);
    const actorAndTargetInTheSameDepartment = actor.department === (originalTarget.department || structure && structure.department);
    const targetIsReferentRegion = originalTarget.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION;
    const targetIsReferentDepartment = originalTarget.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT;
    const targetIsSupervisor = originalTarget.role === $71db770c56d953aa$var$ROLES.SUPERVISOR;
    const targetIsResponsible = originalTarget.role === $71db770c56d953aa$var$ROLES.RESPONSIBLE;
    const targetIsVisitor = originalTarget.role === $71db770c56d953aa$var$ROLES.VISITOR;
    const targetIsHeadCenter = originalTarget.role === $71db770c56d953aa$var$ROLES.HEAD_CENTER;
    // actor is referent region
    const referentRegionFromTheSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && targetIsReferentRegion && actorAndTargetInTheSameRegion;
    const referentDepartmentFromTheSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && targetIsReferentDepartment && actorAndTargetInTheSameRegion;
    const referentResponsibleFromTheSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && targetIsResponsible && actorAndTargetInTheSameRegion;
    const responsibleFromTheSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && targetIsResponsible && actorAndTargetInTheSameRegion;
    const visitorFromTheSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && targetIsVisitor && actorAndTargetInTheSameRegion;
    const headCenterFromTheSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && targetIsHeadCenter && actorAndTargetInTheSameRegion;
    // actor is referent department
    const referentDepartmentFromTheSameDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && targetIsReferentDepartment && actorAndTargetInTheSameDepartment;
    const responsibleFromTheSameDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && targetIsResponsible && actorAndTargetInTheSameDepartment;
    const headCenterFromTheSameDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && targetIsHeadCenter && actorAndTargetInTheSameDepartment;
    // same substructure
    const responsibleFromSameStructure = (targetIsResponsible || targetIsSupervisor) && actor.structureId === originalTarget.structureId;
    const supervisorOfMainStructure = structure && isSupervisor && actor.structureId === structure.networkId;
    const authorized = isAdmin || referentRegionFromTheSameRegion || referentDepartmentFromTheSameRegion || referentResponsibleFromTheSameRegion || responsibleFromTheSameRegion || visitorFromTheSameRegion || headCenterFromTheSameRegion || referentDepartmentFromTheSameDepartment || responsibleFromTheSameDepartment || headCenterFromTheSameDepartment || responsibleFromSameStructure && !isMe || supervisorOfMainStructure;
    return authorized;
}
function $71db770c56d953aa$var$canViewPatchesHistory(actor) {
    const isAdminOrReferent = [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    return isAdminOrReferent;
}
function $71db770c56d953aa$var$canViewEmailHistory(actor) {
    const isAdminOrReferent = [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    return isAdminOrReferent;
}
function $71db770c56d953aa$var$canViewReferent(actor, target) {
    const isMe = actor.id === target.id;
    const isAdminOrReferent = [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    const isResponsibleModifyingResponsible = [
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role) && [
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(target.role);
    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    return isMe || isAdminOrReferent || isResponsibleModifyingResponsible;
}
function $71db770c56d953aa$var$canUpdateReferent({ actor: actor , originalTarget: originalTarget , modifiedTarget: modifiedTarget = null , structure: structure  }) {
    const isMe = actor.id === originalTarget.id;
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const withoutChangingRole = modifiedTarget === null || !("role" in modifiedTarget) || modifiedTarget.role === originalTarget.role;
    const isResponsibleModifyingResponsibleWithoutChangingRole = // Is responsible...
    [
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role) && // ... modifying responsible ...
    [
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(originalTarget.role) && withoutChangingRole;
    const isMeWithoutChangingRole = // Is me ...
    isMe && // ... without changing its role.
    withoutChangingRole;
    // TODO: we must handle rights more precisely.
    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    const isReferentModifyingReferentWithoutChangingRole = // Is referent...
    [
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(actor.role) && // ... modifying referent ...
    [
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE
    ].includes(originalTarget.role) && (modifiedTarget === null || [
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE
    ].includes(modifiedTarget.role));
    const isReferentModifyingHeadCenterWithoutChangingRole = // Is referent...
    [
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(actor.role) && // ... modifying referent ...
    originalTarget.role === $71db770c56d953aa$var$ROLES.HEAD_CENTER && (modifiedTarget === null || [
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(modifiedTarget.role));
    const isActorAndTargetInTheSameRegion = actor.region === (originalTarget.region || structure && structure.region);
    const isActorAndTargetInTheSameDepartment = actor.department === (originalTarget.department || structure && structure.department);
    const authorized = (isMeWithoutChangingRole || isAdmin || isResponsibleModifyingResponsibleWithoutChangingRole || isReferentModifyingReferentWithoutChangingRole || isReferentModifyingHeadCenterWithoutChangingRole) && (actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION ? isActorAndTargetInTheSameRegion : true) && (actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT ? isActorAndTargetInTheSameDepartment : true);
    return authorized;
}
function $71db770c56d953aa$var$canViewYoungMilitaryPreparationFile(actor, target) {
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const isReferentDepartmentFromTargetDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    const isReferentRegionFromTargetRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
    return authorized;
}
function $71db770c56d953aa$var$canRefuseMilitaryPreparation(actor, target) {
    return $71db770c56d953aa$var$canViewYoungMilitaryPreparationFile(actor, target) || [
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canViewYoungFile(actor, target) {
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const isReferentDepartmentFromTargetDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    const isReferentRegionFromTargetRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
    return authorized;
}
function $71db770c56d953aa$var$canCreateOrUpdateCohesionCenter(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canCreateEvent(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canCreateOrUpdateSessionPhase1(actor, target) {
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const isReferent = [
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    const isHeadCenter = actor.role === $71db770c56d953aa$var$ROLES.HEAD_CENTER && actor.id === target.headCenterId;
    return isAdmin || isReferent || isHeadCenter;
}
function $71db770c56d953aa$var$canSearchSessionPhase1(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canViewSessionPhase1(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canCreateOrModifyMission(user, mission) {
    return !(user.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && user.department !== mission.department || user.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && user.region !== mission.region) && user.role !== $71db770c56d953aa$var$ROLES.VISITOR;
}
function $71db770c56d953aa$var$canCreateOrUpdateProgram(user, program) {
    const isAdminOrReferent = [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(user.role);
    return isAdminOrReferent && !(user.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && user.department !== program.department || user.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && user.region !== program.region);
}
function $71db770c56d953aa$var$canModifyStructure(user, structure) {
    const isAdmin = user.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const isReferentRegionFromSameRegion = user.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && user.region === structure.region;
    const isReferentDepartmentFromSameDepartment = user.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && user.department === structure.department;
    const isResponsibleModifyingOwnStructure = [
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(user.role) && structure._id.equals(user.structureId);
    const isSupervisorModifyingChild = user.role === $71db770c56d953aa$var$ROLES.SUPERVISOR && user.structureId === structure.networkId;
    return isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment || isResponsibleModifyingOwnStructure || isSupervisorModifyingChild;
}
function $71db770c56d953aa$var$canCreateStructure(user) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(user.role);
}
function $71db770c56d953aa$var$isReferentOrAdmin(user) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(user.role);
}
function $71db770c56d953aa$var$isAdmin(user) {
    return $71db770c56d953aa$var$ROLES.ADMIN === user.role;
}
const $71db770c56d953aa$var$FORCE_DISABLED_ASSIGN_COHESION_CENTER = false;
const $71db770c56d953aa$var$canAssignCohesionCenter = (user)=>!$71db770c56d953aa$var$FORCE_DISABLED_ASSIGN_COHESION_CENTER && $71db770c56d953aa$var$isAdmin(user)
;
const $71db770c56d953aa$var$FORCE_DISABLED_ASSIGN_MEETING_POINT = false;
const $71db770c56d953aa$var$canAssignMeetingPoint = (user)=>!$71db770c56d953aa$var$FORCE_DISABLED_ASSIGN_MEETING_POINT && $71db770c56d953aa$var$isReferentOrAdmin(user)
;
const $71db770c56d953aa$var$canEditPresenceYoung = (actor)=>{
    // todo affiner les droits
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
};
const $71db770c56d953aa$var$canSigninAs = (actor, target)=>{
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const isReferentRegionFromSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const isReferentDepartmentFromSameDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    return target.constructor.modelName === "referent" && isAdmin || target.constructor.modelName === "young" && (isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment);
};
const $71db770c56d953aa$var$canSendFileByMail = (actor, target)=>{
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const isReferentRegionFromSameRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const isReferentDepartmentFromSameDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    return isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment;
};
function $71db770c56d953aa$var$canSearchAssociation(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canViewCohesionCenter(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canGetReferentByEmail(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canViewMeetingPoints(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canSearchMeetingPoints(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canUpdateInscriptionGoals(actor) {
    return actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
}
function $71db770c56d953aa$var$canViewInscriptionGoals(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER,
        $71db770c56d953aa$var$ROLES.VISITOR
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canViewTicketTags(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canGetYoungByEmail(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canViewYoung(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canViewBus(actor) {
    return actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
}
function $71db770c56d953aa$var$canViewMission(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canViewStructures(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canModifyMissionStructureId(actor) {
    return actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
}
function $71db770c56d953aa$var$canViewStructureChildren(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canDownloadYoungDocuments(actor, target) {
    return $71db770c56d953aa$var$canEditYoung(actor, target);
}
function $71db770c56d953aa$var$canInviteYoung(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canSendTemplateToYoung(actor, target) {
    return $71db770c56d953aa$var$canEditYoung(actor, target);
}
function $71db770c56d953aa$var$canViewYoungApplications(actor, target) {
    return $71db770c56d953aa$var$canEditYoung(actor, target) || [
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canCreateYoungApplication(actor, target) {
    return $71db770c56d953aa$var$canEditYoung(actor, target) || [
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canCreateOrUpdateContract(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canViewContract(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canCreateOrUpdateDepartmentService(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canChangeYoungCohort(actor, target) {
    const isAdmin = actor.role === $71db770c56d953aa$var$ROLES.ADMIN;
    const isReferentDepartmentFromTargetDepartment = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    const isReferentRegionFromTargetRegion = actor.role === $71db770c56d953aa$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
    return authorized;
}
function $71db770c56d953aa$var$canViewDepartmentService(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $71db770c56d953aa$var$canSearchInElasticSearch(actor, index) {
    if (index === "mission") return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
    else if (index === "school") return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
    else if (index === "young-having-school-in-department") return [
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
    else if (index === "young-having-school-in-region") return [
        $71db770c56d953aa$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    else if (index === "cohesionyoung") return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
    else if (index === "sessionphase1young") return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
    else if (index === "structure") return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
    else if (index === "referent") return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR,
        $71db770c56d953aa$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
    else if (index === "application") return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
    else if (index === "cohesioncenter") return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
    else if (index === "team") return [
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
    return false;
}
function $71db770c56d953aa$var$canSendTutorTemplate(actor) {
    return [
        $71db770c56d953aa$var$ROLES.ADMIN,
        $71db770c56d953aa$var$ROLES.REFERENT_REGION,
        $71db770c56d953aa$var$ROLES.REFERENT_DEPARTMENT,
        $71db770c56d953aa$var$ROLES.RESPONSIBLE,
        $71db770c56d953aa$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
$71db770c56d953aa$exports = {
    ROLES: $71db770c56d953aa$var$ROLES,
    SUB_ROLES: $71db770c56d953aa$var$SUB_ROLES,
    ROLES_LIST: $71db770c56d953aa$var$ROLES_LIST,
    SUB_ROLES_LIST: $71db770c56d953aa$var$SUB_ROLES_LIST,
    SUPPORT_ROLES: $71db770c56d953aa$var$SUPPORT_ROLES,
    SUPPORT_ROLES_LIST: $71db770c56d953aa$var$SUPPORT_ROLES_LIST,
    VISITOR_SUBROLES: $71db770c56d953aa$var$VISITOR_SUBROLES,
    VISITOR_SUB_ROLES_LIST: $71db770c56d953aa$var$VISITOR_SUB_ROLES_LIST,
    CENTER_ROLES: $71db770c56d953aa$var$CENTER_ROLES,
    canInviteUser: $71db770c56d953aa$var$canInviteUser,
    canDeleteYoung: $71db770c56d953aa$var$canDeleteYoung,
    canEditYoung: $71db770c56d953aa$var$canEditYoung,
    canDownloadYoungDocuments: $71db770c56d953aa$var$canDownloadYoungDocuments,
    canDeleteReferent: $71db770c56d953aa$var$canDeleteReferent,
    canViewPatchesHistory: $71db770c56d953aa$var$canViewPatchesHistory,
    canViewEmailHistory: $71db770c56d953aa$var$canViewEmailHistory,
    canViewReferent: $71db770c56d953aa$var$canViewReferent,
    canUpdateReferent: $71db770c56d953aa$var$canUpdateReferent,
    canViewYoungMilitaryPreparationFile: $71db770c56d953aa$var$canViewYoungMilitaryPreparationFile,
    canCreateOrUpdateCohesionCenter: $71db770c56d953aa$var$canCreateOrUpdateCohesionCenter,
    canCreateOrUpdateSessionPhase1: $71db770c56d953aa$var$canCreateOrUpdateSessionPhase1,
    canViewSessionPhase1: $71db770c56d953aa$var$canViewSessionPhase1,
    canCreateOrModifyMission: $71db770c56d953aa$var$canCreateOrModifyMission,
    canCreateOrUpdateProgram: $71db770c56d953aa$var$canCreateOrUpdateProgram,
    canInviteYoung: $71db770c56d953aa$var$canInviteYoung,
    isReferentOrAdmin: $71db770c56d953aa$var$isReferentOrAdmin,
    FORCE_DISABLED_ASSIGN_COHESION_CENTER: $71db770c56d953aa$var$FORCE_DISABLED_ASSIGN_COHESION_CENTER,
    FORCE_DISABLED_ASSIGN_MEETING_POINT: $71db770c56d953aa$var$FORCE_DISABLED_ASSIGN_MEETING_POINT,
    canAssignCohesionCenter: $71db770c56d953aa$var$canAssignCohesionCenter,
    canAssignMeetingPoint: $71db770c56d953aa$var$canAssignMeetingPoint,
    canModifyStructure: $71db770c56d953aa$var$canModifyStructure,
    canDeleteStructure: $71db770c56d953aa$var$canDeleteStructure,
    canSigninAs: $71db770c56d953aa$var$canSigninAs,
    canSendFileByMail: $71db770c56d953aa$var$canSendFileByMail,
    canCreateEvent: $71db770c56d953aa$var$canCreateEvent,
    canSearchAssociation: $71db770c56d953aa$var$canSearchAssociation,
    canCreateStructure: $71db770c56d953aa$var$canCreateStructure,
    canViewCohesionCenter: $71db770c56d953aa$var$canViewCohesionCenter,
    canSearchSessionPhase1: $71db770c56d953aa$var$canSearchSessionPhase1,
    canGetReferentByEmail: $71db770c56d953aa$var$canGetReferentByEmail,
    canViewMeetingPoints: $71db770c56d953aa$var$canViewMeetingPoints,
    canSearchMeetingPoints: $71db770c56d953aa$var$canSearchMeetingPoints,
    canUpdateInscriptionGoals: $71db770c56d953aa$var$canUpdateInscriptionGoals,
    canViewInscriptionGoals: $71db770c56d953aa$var$canViewInscriptionGoals,
    canViewTicketTags: $71db770c56d953aa$var$canViewTicketTags,
    canGetYoungByEmail: $71db770c56d953aa$var$canGetYoungByEmail,
    canViewYoung: $71db770c56d953aa$var$canViewYoung,
    canViewYoungFile: $71db770c56d953aa$var$canViewYoungFile,
    canViewBus: $71db770c56d953aa$var$canViewBus,
    canViewMission: $71db770c56d953aa$var$canViewMission,
    canViewStructures: $71db770c56d953aa$var$canViewStructures,
    canModifyMissionStructureId: $71db770c56d953aa$var$canModifyMissionStructureId,
    canViewStructureChildren: $71db770c56d953aa$var$canViewStructureChildren,
    canSendTemplateToYoung: $71db770c56d953aa$var$canSendTemplateToYoung,
    canViewYoungApplications: $71db770c56d953aa$var$canViewYoungApplications,
    canCreateYoungApplication: $71db770c56d953aa$var$canCreateYoungApplication,
    canCreateOrUpdateContract: $71db770c56d953aa$var$canCreateOrUpdateContract,
    canViewContract: $71db770c56d953aa$var$canViewContract,
    canCreateOrUpdateDepartmentService: $71db770c56d953aa$var$canCreateOrUpdateDepartmentService,
    canViewDepartmentService: $71db770c56d953aa$var$canViewDepartmentService,
    canSearchInElasticSearch: $71db770c56d953aa$var$canSearchInElasticSearch,
    canRefuseMilitaryPreparation: $71db770c56d953aa$var$canRefuseMilitaryPreparation,
    canChangeYoungCohort: $71db770c56d953aa$var$canChangeYoungCohort,
    canSendTutorTemplate: $71db770c56d953aa$var$canSendTutorTemplate,
    canEditPresenceYoung: $71db770c56d953aa$var$canEditPresenceYoung
};


var $8618afcb3bea0caa$require$ROLES = $71db770c56d953aa$exports.ROLES;
var $8618afcb3bea0caa$require$SUB_ROLES = $71db770c56d953aa$exports.SUB_ROLES;
const $8618afcb3bea0caa$var$YOUNG_STATUS = {
    WAITING_VALIDATION: "WAITING_VALIDATION",
    WAITING_CORRECTION: "WAITING_CORRECTION",
    VALIDATED: "VALIDATED",
    REFUSED: "REFUSED",
    IN_PROGRESS: "IN_PROGRESS",
    WITHDRAWN: "WITHDRAWN",
    DELETED: "DELETED",
    WAITING_LIST: "WAITING_LIST",
    NOT_ELIGIBLE: "NOT_ELIGIBLE",
    ABANDONED: "ABANDONED"
};
const $8618afcb3bea0caa$var$YOUNG_STATUS_PHASE1 = {
    WAITING_AFFECTATION: "WAITING_AFFECTATION",
    AFFECTED: "AFFECTED",
    EXEMPTED: "EXEMPTED",
    DONE: "DONE",
    NOT_DONE: "NOT_DONE",
    WITHDRAWN: "WITHDRAWN",
    WAITING_LIST: "WAITING_LIST"
};
const $8618afcb3bea0caa$var$YOUNG_STATUS_PHASE1_MOTIF = {
    ILLNESS: "ILLNESS",
    DEATH: "DEATH",
    ADMINISTRATION_CANCEL: "ADMINISTRATION_CANCEL",
    OTHER: "OTHER"
};
const $8618afcb3bea0caa$var$YOUNG_STATUS_PHASE2 = {
    WAITING_REALISATION: "WAITING_REALISATION",
    IN_PROGRESS: "IN_PROGRESS",
    VALIDATED: "VALIDATED",
    WITHDRAWN: "WITHDRAWN"
};
const $8618afcb3bea0caa$var$CONTRACT_STATUS = {
    DRAFT: "DRAFT",
    SENT: "SENT",
    VALIDATED: "VALIDATED"
};
const $8618afcb3bea0caa$var$YOUNG_STATUS_PHASE3 = {
    WAITING_REALISATION: "WAITING_REALISATION",
    WAITING_VALIDATION: "WAITING_VALIDATION",
    VALIDATED: "VALIDATED",
    WITHDRAWN: "WITHDRAWN"
};
const $8618afcb3bea0caa$var$YOUNG_PHASE = {
    INSCRIPTION: "INSCRIPTION",
    COHESION_STAY: "COHESION_STAY",
    INTEREST_MISSION: "INTEREST_MISSION",
    CONTINUE: "CONTINUE"
};
const $8618afcb3bea0caa$var$PHASE_STATUS = {
    IN_PROGRESS: "IN_PROGRESS",
    IN_COMING: "IN_COMING",
    VALIDATED: "VALIDATED",
    CANCEL: "CANCEL",
    WAITING_AFFECTATION: "WAITING_AFFECTATION"
};
const $8618afcb3bea0caa$var$SESSION_STATUS = {
    VALIDATED: "VALIDATED",
    DRAFT: "DRAFT"
};
const $8618afcb3bea0caa$var$APPLICATION_STATUS = {
    WAITING_VALIDATION: "WAITING_VALIDATION",
    WAITING_VERIFICATION: "WAITING_VERIFICATION",
    WAITING_ACCEPTATION: "WAITING_ACCEPTATION",
    VALIDATED: "VALIDATED",
    REFUSED: "REFUSED",
    CANCEL: "CANCEL",
    IN_PROGRESS: "IN_PROGRESS",
    DONE: "DONE",
    ABANDON: "ABANDON"
};
const $8618afcb3bea0caa$var$PROFESSIONNAL_PROJECT = {
    UNIFORM: "UNIFORM",
    OTHER: "OTHER",
    UNKNOWN: "UNKNOWN"
};
const $8618afcb3bea0caa$var$PROFESSIONNAL_PROJECT_PRECISION = {
    FIREFIGHTER: "FIREFIGHTER",
    POLICE: "POLICE",
    ARMY: "ARMY"
};
const $8618afcb3bea0caa$var$MISSION_DOMAINS = {
    CITIZENSHIP: "CITIZENSHIP",
    CULTURE: "CULTURE",
    DEFENSE: "DEFENSE",
    EDUCATION: "EDUCATION",
    ENVIRONMENT: "ENVIRONMENT",
    HEALTH: "HEALTH",
    SECURITY: "SECURITY",
    SOLIDARITY: "SOLIDARITY",
    SPORT: "SPORT"
};
const $8618afcb3bea0caa$var$YOUNG_SITUATIONS = {
    GENERAL_SCHOOL: "GENERAL_SCHOOL",
    PROFESSIONAL_SCHOOL: "PROFESSIONAL_SCHOOL",
    AGRICULTURAL_SCHOOL: "AGRICULTURAL_SCHOOL",
    SPECIALIZED_SCHOOL: "SPECIALIZED_SCHOOL",
    APPRENTICESHIP: "APPRENTICESHIP",
    EMPLOYEE: "EMPLOYEE",
    INDEPENDANT: "INDEPENDANT",
    SELF_EMPLOYED: "SELF_EMPLOYED",
    ADAPTED_COMPANY: "ADAPTED_COMPANY",
    POLE_EMPLOI: "POLE_EMPLOI",
    MISSION_LOCALE: "MISSION_LOCALE",
    CAP_EMPLOI: "CAP_EMPLOI",
    NOTHING: "NOTHING"
};
const $8618afcb3bea0caa$var$FORMAT = {
    CONTINUOUS: "CONTINUOUS",
    DISCONTINUOUS: "DISCONTINUOUS",
    AUTONOMOUS: "AUTONOMOUS"
};
const $8618afcb3bea0caa$var$REFERENT_ROLES = $8618afcb3bea0caa$require$ROLES;
const $8618afcb3bea0caa$var$REFERENT_DEPARTMENT_SUBROLE = {
    manager_department: $8618afcb3bea0caa$require$SUB_ROLES.manager_department,
    assistant_manager_department: $8618afcb3bea0caa$require$SUB_ROLES.assistant_manager_department,
    manager_phase2: $8618afcb3bea0caa$require$SUB_ROLES.manager_phase2,
    secretariat: $8618afcb3bea0caa$require$SUB_ROLES.secretariat
};
const $8618afcb3bea0caa$var$REFERENT_REGION_SUBROLE = {
    coordinator: $8618afcb3bea0caa$require$SUB_ROLES.coordinator,
    assistant_coordinator: $8618afcb3bea0caa$require$SUB_ROLES.assistant_coordinator,
    manager_phase2: $8618afcb3bea0caa$require$SUB_ROLES.manager_phase2
};
const $8618afcb3bea0caa$var$MISSION_STATUS = {
    WAITING_VALIDATION: "WAITING_VALIDATION",
    WAITING_CORRECTION: "WAITING_CORRECTION",
    VALIDATED: "VALIDATED",
    DRAFT: "DRAFT",
    REFUSED: "REFUSED",
    CANCEL: "CANCEL",
    ARCHIVED: "ARCHIVED"
};
const $8618afcb3bea0caa$var$PERIOD = {
    DURING_HOLIDAYS: "DURING_HOLIDAYS",
    DURING_SCHOOL: "DURING_SCHOOL"
};
const $8618afcb3bea0caa$var$TRANSPORT = {
    PUBLIC_TRANSPORT: "PUBLIC_TRANSPORT",
    BIKE: "BIKE",
    MOTOR: "MOTOR",
    CARPOOLING: "CARPOOLING",
    OTHER: "OTHER"
};
const $8618afcb3bea0caa$var$MISSION_PERIOD_DURING_HOLIDAYS = {
    SUMMER: "SUMMER",
    AUTUMN: "AUTUMN",
    DECEMBER: "DECEMBER",
    WINTER: "WINTER",
    SPRING: "SPRING"
};
const $8618afcb3bea0caa$var$MISSION_PERIOD_DURING_SCHOOL = {
    EVENING: "EVENING",
    END_DAY: "END_DAY",
    WEEKEND: "WEEKEND"
};
const $8618afcb3bea0caa$var$STRUCTURE_STATUS = {
    WAITING_VALIDATION: "WAITING_VALIDATION",
    WAITING_CORRECTION: "WAITING_CORRECTION",
    VALIDATED: "VALIDATED",
    DRAFT: "DRAFT"
};
const $8618afcb3bea0caa$var$DEFAULT_STRUCTURE_NAME = "Ma nouvelle Structure";
const $8618afcb3bea0caa$var$COHORTS = [
    "2019",
    "2020",
    "2021",
    "2022",
    "Février 2022",
    "Juin 2022",
    "Juillet 2022"
];
const $8618afcb3bea0caa$var$INTEREST_MISSION_LIMIT_DATE = {
    2019: "23 mars 2021",
    2020: "31 décembre 2021",
    2021: "30 juin 2022"
};
const $8618afcb3bea0caa$var$ES_NO_LIMIT = 10_000;
const $8618afcb3bea0caa$var$SENDINBLUE_TEMPLATES = {
    FORGOT_PASSWORD: "157",
    invitationReferent: {
        [$8618afcb3bea0caa$require$ROLES.REFERENT_DEPARTMENT]: "158",
        [$8618afcb3bea0caa$require$ROLES.REFERENT_REGION]: "159",
        [$8618afcb3bea0caa$require$ROLES.RESPONSIBLE]: "160",
        [$8618afcb3bea0caa$require$ROLES.SUPERVISOR]: "160",
        [$8618afcb3bea0caa$require$ROLES.ADMIN]: "161",
        [$8618afcb3bea0caa$require$ROLES.HEAD_CENTER]: "162",
        [$8618afcb3bea0caa$require$ROLES.VISITOR]: "286",
        NEW_STRUCTURE: "160",
        NEW_STRUCTURE_MEMBER: "163"
    },
    INVITATION_YOUNG: "166",
    // contract
    VALIDATE_CONTRACT: "176",
    REVALIDATE_CONTRACT: "175",
    referent: {
        WELCOME: "378",
        YOUNG_CHANGE_COHORT: "324",
        RECAP_BI_HEBDO_DEPARTMENT: "231",
        // MIG
        MISSION_WAITING_CORRECTION: "164",
        MISSION_WAITING_VALIDATION: "194",
        MISSION_VALIDATED: "63",
        MISSION_END: "213",
        MISSION_CANCEL: "233",
        NEW_MISSION: "192",
        NEW_MISSION_REMINDER: "195",
        MISSION_REFUSED: "165",
        CANCEL_APPLICATION: "155",
        ABANDON_APPLICATION: "214",
        VALIDATE_APPLICATION_TUTOR: "196",
        NEW_APPLICATION_MIG: "156",
        YOUNG_VALIDATED: "173",
        APPLICATION_REMINDER: "197",
        MISSION_ARCHIVED: "204",
        MISSION_ARCHIVED_1_WEEK_NOTICE: "205",
        // PREPA MILITAIRE
        MILITARY_PREPARATION_DOCS_SUBMITTED: "149",
        MILITARY_PREPARATION_DOCS_VALIDATED: "148",
        NEW_MILITARY_PREPARATION_APPLICATION: "185",
        NEW_APPLICATION: "new-application",
        //PHASE 3
        VALIDATE_MISSION_PHASE3: "174",
        // Support
        ANSWER_RECEIVED: "208",
        MESSAGE_NOTIFICATION: "218"
    },
    young: {
        CHANGE_COHORT: "325",
        // le contenu est specifique a la reinscription, il faudrait faire un message plus générique a terme
        ARCHIVED: "269",
        INSCRIPTION_STARTED: "219",
        INSCRIPTION_VALIDATED: "167",
        INSCRIPTION_REACTIVATED: "168",
        INSCRIPTION_WAITING_CORRECTION: "169",
        INSCRIPTION_WAITING_LIST: "171",
        INSCRIPTION_REFUSED: "172",
        INSCRIPTION_WAITING_VALIDATION: "65",
        PHASE_1_VALIDATED: "234",
        // MIG
        REFUSE_APPLICATION: "152",
        VALIDATE_APPLICATION: "151",
        MISSION_PROPOSITION: "170",
        MISSION_CANCEL: "261",
        MISSION_ARCHIVED: "227",
        MISSION_ARCHIVED_AUTO: "289",
        APPLICATION_CANCEL: "180",
        PHASE_2_VALIDATED: "154",
        MISSION_PROPOSITION_AUTO: "237",
        // PREPA MILITAIRE
        MILITARY_PREPARATION_DOCS_VALIDATED: "145",
        MILITARY_PREPARATION_DOCS_CORRECTION: "146",
        MILITARY_PREPARATION_DOCS_REFUSED: "147",
        MILITARY_PREPARATION_DOCS_REMINDER: "201",
        MILITARY_PREPARATION_DOCS_REMINDER_RENOTIFY: "228",
        //PHASE 3
        VALIDATE_PHASE3: "200",
        DOCUMENT: "182",
        CONTRACT_VALIDATED: "183",
        // Support
        ANSWER_RECEIVED: "208",
        // Personal and situation changes
        DEPARTMENT_CHANGE: "215",
        //Phase 1 pj
        PHASE_1_PJ_WAITING_VERIFICATION: "348",
        PHASE_1_PJ_WAITING_CORRECTION: "349",
        PHASE_1_PJ_VALIDATED: "350",
        PHASE_1_FOLLOW_UP_DOCUMENT: "353",
        PHASE_1_FOLLOW_UP_MEDICAL_FILE: "354",
        //send a download link to the young
        LINK: "410"
    },
    YOUNG_ARRIVED_IN_CENTER_TO_REPRESENTANT_LEGAL: "302"
};
const $8618afcb3bea0caa$var$ZAMMAD_GROUP = {
    YOUNG: "Jeunes",
    VOLONTAIRE: "Volontaires",
    REFERENT: "Référents",
    STRUCTURE: "Structures",
    CONTACT: "Contact",
    ADMIN: "Admin",
    VISITOR: "Visiteurs",
    HEAD_CENTER: "Chefs de centre"
};
const $8618afcb3bea0caa$var$WITHRAWN_REASONS = [
    {
        value: "unavailable_perso",
        label: "Non disponibilité pour motif familial ou personnel"
    },
    {
        value: "unavailable_pro",
        label: "Non disponibilité pour motif scolaire ou professionnel"
    },
    {
        value: "no_interest",
        label: "Perte d'intérêt pour le SNU"
    },
    {
        value: "bad_affectation",
        label: "L'affectation ne convient pas"
    },
    {
        value: "can_not_go_metting_point",
        label: "Impossibilité de se rendre au point de rassemblement"
    },
    {
        value: "bad_mission",
        label: "L'offre de mission ne convient pas"
    },
    {
        value: "other",
        label: "Autre"
    }, 
];
const $8618afcb3bea0caa$var$COHESION_STAY_LIMIT_DATE = {
    2019: "du 16 au 28 juin 2019",
    2020: "du 21 juin au 2 juillet 2021",
    2021: "du 21 juin au 2 juillet 2021",
    "Février 2022": "du 13 au 25 Février 2022",
    "Juin 2022": "du 12 au 24 Juin 2022",
    "Juillet 2022": "du 3 au 15 Juillet 2022"
};
const $8618afcb3bea0caa$var$COHESION_STAY_START = {
    2019: new Date("06/16/2019"),
    2020: new Date("06/21/2021"),
    2021: new Date("06/21/2021"),
    "Février 2022": new Date("02/13/2022"),
    "Juin 2022": new Date("06/12/2022"),
    "Juillet 2022": new Date("07/03/2022")
};
const $8618afcb3bea0caa$var$COHESION_STAY_END = {
    2019: new Date("06/28/2019"),
    2020: new Date("07/02/2021"),
    2021: new Date("07/02/2021"),
    "Février 2022": new Date("02/25/2022"),
    "Juin 2022": new Date("06/24/2022"),
    "Juillet 2022": new Date("07/15/2022")
};
const $8618afcb3bea0caa$var$PHASE1_HEADCENTER_ACCESS_LIMIT = {
    "Février 2022": new Date("05/25/2022"),
    "Juin 2022": new Date("09/24/2022"),
    "Juillet 2022": new Date("10/15/2022")
};
const $8618afcb3bea0caa$var$PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE = {
    "Février 2022": new Date("02/13/2022"),
    "Juin 2022": new Date("06/12/2022"),
    "Juillet 2022": new Date("07/03/2022"),
    2021: new Date("01/01/2021")
};
const $8618afcb3bea0caa$var$START_DATE_SESSION_PHASE1 = {
    "Février 2022": new Date("03/13/2022"),
    "Juin 2022": new Date("06/12/2022"),
    "Juillet 2022": new Date("07/03/2022")
};
const $8618afcb3bea0caa$var$CONSENTMENT_TEXTS = {
    young: [
        "A lu et accepte les Conditions générales d'utilisation de la plateforme du Service national universel ;",
        "A pris connaissance des modalités de traitement de mes données personnelles ;",
        "Est volontaire, sous le contrôle des représentants légaux, pour effectuer la session 2022 du Service National Universel qui comprend la participation au séjour de cohésion puis la réalisation d'une mission d'intérêt général ;",
        "Certifie l'exactitude des renseignements fournis ;",
        "Si en terminale, a bien pris connaissance que si je suis convoqué(e) pour les épreuves du second groupe du baccalauréat entre le 6 et le 8 juillet 2022, je ne pourrai pas participer au séjour de cohésion entre le 3 et le 15 juillet 2022(il n’y aura ni dérogation sur la date d’arrivée au séjour de cohésion ni report des épreuves).", 
    ],
    parents: [
        "Confirmation d'être titulaire de l'autorité parentale / le représentant légal du volontaire ;",
        "Autorisation du volontaire à participer à la session 2022 du Service National Universel qui comprend la participation au séjour de cohésion puis la réalisation d'une mission d & apos; intérêt général ;",
        "Engagement à renseigner le consentement relatif aux droits à l'image avant le début du séjour de cohésion ;",
        "Engagement à renseigner l'utilisation d'autotest COVID avant le début du séjour de cohésion ;",
        "Engagement à remettre sous pli confidentiel la fiche sanitaire ainsi que les documents médicaux et justificatifs nécessaires à son arrivée au centre de séjour de cohésion ;",
        "Engagement à ce que le volontaire soit à jour de ses vaccinations obligatoires, c'est-à-dire anti-diphtérie, tétanos et poliomyélite (DTP), et pour les volontaires résidents de Guyane, la fièvre jaune.", 
    ]
};
const $8618afcb3bea0caa$var$FILE_STATUS_PHASE1 = {
    TO_UPLOAD: "TO_UPLOAD",
    WAITING_VERIFICATION: "WAITING_VERIFICATION",
    WAITING_CORRECTION: "WAITING_CORRECTION",
    VALIDATED: "VALIDATED"
};
$8618afcb3bea0caa$exports = {
    YOUNG_STATUS: $8618afcb3bea0caa$var$YOUNG_STATUS,
    YOUNG_STATUS_PHASE1: $8618afcb3bea0caa$var$YOUNG_STATUS_PHASE1,
    YOUNG_STATUS_PHASE1_MOTIF: $8618afcb3bea0caa$var$YOUNG_STATUS_PHASE1_MOTIF,
    YOUNG_STATUS_PHASE2: $8618afcb3bea0caa$var$YOUNG_STATUS_PHASE2,
    CONTRACT_STATUS: $8618afcb3bea0caa$var$CONTRACT_STATUS,
    YOUNG_STATUS_PHASE3: $8618afcb3bea0caa$var$YOUNG_STATUS_PHASE3,
    YOUNG_PHASE: $8618afcb3bea0caa$var$YOUNG_PHASE,
    PHASE_STATUS: $8618afcb3bea0caa$var$PHASE_STATUS,
    SESSION_STATUS: $8618afcb3bea0caa$var$SESSION_STATUS,
    APPLICATION_STATUS: $8618afcb3bea0caa$var$APPLICATION_STATUS,
    PROFESSIONNAL_PROJECT: $8618afcb3bea0caa$var$PROFESSIONNAL_PROJECT,
    PROFESSIONNAL_PROJECT_PRECISION: $8618afcb3bea0caa$var$PROFESSIONNAL_PROJECT_PRECISION,
    MISSION_DOMAINS: $8618afcb3bea0caa$var$MISSION_DOMAINS,
    YOUNG_SITUATIONS: $8618afcb3bea0caa$var$YOUNG_SITUATIONS,
    FORMAT: $8618afcb3bea0caa$var$FORMAT,
    ROLES: $8618afcb3bea0caa$require$ROLES,
    REFERENT_ROLES: $8618afcb3bea0caa$var$REFERENT_ROLES,
    REFERENT_DEPARTMENT_SUBROLE: $8618afcb3bea0caa$var$REFERENT_DEPARTMENT_SUBROLE,
    REFERENT_REGION_SUBROLE: $8618afcb3bea0caa$var$REFERENT_REGION_SUBROLE,
    MISSION_STATUS: $8618afcb3bea0caa$var$MISSION_STATUS,
    PERIOD: $8618afcb3bea0caa$var$PERIOD,
    TRANSPORT: $8618afcb3bea0caa$var$TRANSPORT,
    MISSION_PERIOD_DURING_HOLIDAYS: $8618afcb3bea0caa$var$MISSION_PERIOD_DURING_HOLIDAYS,
    MISSION_PERIOD_DURING_SCHOOL: $8618afcb3bea0caa$var$MISSION_PERIOD_DURING_SCHOOL,
    STRUCTURE_STATUS: $8618afcb3bea0caa$var$STRUCTURE_STATUS,
    DEFAULT_STRUCTURE_NAME: $8618afcb3bea0caa$var$DEFAULT_STRUCTURE_NAME,
    COHESION_STAY_LIMIT_DATE: $8618afcb3bea0caa$var$COHESION_STAY_LIMIT_DATE,
    INTEREST_MISSION_LIMIT_DATE: $8618afcb3bea0caa$var$INTEREST_MISSION_LIMIT_DATE,
    ES_NO_LIMIT: $8618afcb3bea0caa$var$ES_NO_LIMIT,
    SENDINBLUE_TEMPLATES: $8618afcb3bea0caa$var$SENDINBLUE_TEMPLATES,
    ZAMMAD_GROUP: $8618afcb3bea0caa$var$ZAMMAD_GROUP,
    WITHRAWN_REASONS: $8618afcb3bea0caa$var$WITHRAWN_REASONS,
    CONSENTMENT_TEXTS: $8618afcb3bea0caa$var$CONSENTMENT_TEXTS,
    COHORTS: $8618afcb3bea0caa$var$COHORTS,
    PHASE1_HEADCENTER_ACCESS_LIMIT: $8618afcb3bea0caa$var$PHASE1_HEADCENTER_ACCESS_LIMIT,
    PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE: $8618afcb3bea0caa$var$PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE,
    START_DATE_SESSION_PHASE1: $8618afcb3bea0caa$var$START_DATE_SESSION_PHASE1,
    COHESION_STAY_START: $8618afcb3bea0caa$var$COHESION_STAY_START,
    COHESION_STAY_END: $8618afcb3bea0caa$var$COHESION_STAY_END,
    FILE_STATUS_PHASE1: $8618afcb3bea0caa$var$FILE_STATUS_PHASE1
};


var $54daa7b8922c2588$exports = {};
/* eslint-disable no-undef */ function $54daa7b8922c2588$var$download(file, fileName) {
    if (window.navigator.msSaveOrOpenBlob) //IE11 & Edge
    window.navigator.msSaveOrOpenBlob(file, fileName);
    else {
        //Other browsers
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
}
$54daa7b8922c2588$exports = {
    download: $54daa7b8922c2588$var$download
};


var $69f976ffcd86c7ac$exports = {};
const $69f976ffcd86c7ac$var$translate = (value)=>{
    switch(value){
        case "NONE":
            return "Aucun";
        case "AFFECTED":
            return "Affectée";
        case "NOT_DONE":
            return "Non réalisée";
        case "WAITING_VALIDATION":
            return "En attente de validation";
        case "WAITING_ACCEPTATION":
            return "En attente d'acceptation";
        case "WAITING_VERIFICATION":
            return "En attente de vérification d'éligibilité";
        case "WAITING_AFFECTATION":
            return "En attente d'affectation";
        case "WAITING_CORRECTION":
            return "En attente de correction";
        case "WAITING_UPLOAD":
            return "En attente de téléversement";
        case "IN_PROGRESS":
            return "En cours";
        case "VALIDATED":
            return "Validée";
        case "DELETED":
            return "Supprimée";
        case "WAITING_LIST":
            return "Sur liste complémentaire";
        case "CONTINUOUS":
            return "Mission regroupée sur des journées";
        case "DISCONTINUOUS":
            return "Mission répartie sur des heures";
        case "AUTONOMOUS":
            return "En autonomie";
        case "DRAFT":
            return "Brouillon";
        case "REFUSED":
            return "Refusée";
        case "CANCEL":
            return "Annulée";
        case "NOT_ELIGIBLE":
            return "Non éligible";
        case "EXEMPTED":
            return "Dispensée";
        case "ILLNESS":
            return "Maladie d'un proche ou du volontaire";
        case "DEATH":
            return "Mort d'un proche ou du volontaire";
        case "ADMINISTRATION_CANCEL":
            return "Annulation du séjour par l'administration (COVID 19)";
        case "ABANDON":
            return "Abandonnée";
        case "ABANDONED":
            return "Inscription Abandonnée";
        case "ARCHIVED":
            return "Archivée";
        case "DONE":
            return "Effectuée";
        case "WITHDRAWN":
            return "Désistée";
        case "NOT_COMPLETED":
            return "Non achevée";
        case "PRESELECTED":
            return "Présélectionnée";
        case "SIGNED_CONTRACT":
            return "Contrat signé";
        case "ASSOCIATION":
            return "Association";
        case "PUBLIC":
            return "Structure publique";
        case "PRIVATE":
            return "Structure privée";
        case "OTHER":
            return "Autre";
        case "GENERAL_SCHOOL":
            return "En enseignement général ou technologique";
        case "PROFESSIONAL_SCHOOL":
            return "En enseignement professionnel";
        case "AGRICULTURAL_SCHOOL":
            return "En lycée agricole";
        case "SPECIALIZED_SCHOOL":
            return "En établissement spécialisé";
        case "APPRENTICESHIP":
            return "En apprentissage";
        case "EMPLOYEE":
            return "Salarié(e)";
        case "INDEPENDANT":
            return "Indépendant(e)";
        case "SELF_EMPLOYED":
            return "Auto-entrepreneur";
        case "ADAPTED_COMPANY":
            return "En ESAT, CAT ou en entreprise adaptée";
        case "POLE_EMPLOI":
            return "Inscrit(e) à Pôle emploi";
        case "MISSION_LOCALE":
            return "Inscrit(e) à la Mission locale";
        case "CAP_EMPLOI":
            return "Inscrit(e) à Cap emploi";
        case "NOTHING":
            return "Inscrit(e) nulle part";
        case "admin":
            return "modérateur";
        case "referent_department":
            return "Référent départemental";
        case "referent_region":
            return "Référent régional";
        case "responsible":
            return "Responsable";
        case "head_center":
            return "Chef de centre";
        case "visitor":
            return "Visiteur";
        case "supervisor":
            return "Superviseur";
        case "manager_department":
            return "Chef de projet départemental";
        case "assistant_manager_department":
            return "Chef de projet départemental adjoint";
        case "manager_department_phase2":
            return "Référent départemental phase 2";
        case "manager_phase2":
            return "Référent phase 2";
        case "secretariat":
            return "Secrétariat";
        case "coordinator":
            return "Coordinateur régional";
        case "assistant_coordinator":
            return "Coordinateur régional adjoint";
        case "recteur_region":
            return "Recteur de région académique";
        case "recteur":
            return "Recteur d'académie";
        case "vice_recteur":
            return "Vice-recteur d'académie";
        case "dasen":
            return "Directeur académique des services de l'éducation nationale (DASEN)";
        case "sgra":
            return "Secrétaire général de région académique (SGRA)";
        case "sga":
            return "Secrétaire général d'académie (SGA)";
        case "drajes":
            return "Délégué régional académique à la jeunesse, à l'engagement et aux sports (DRAJES)";
        case "INSCRIPTION":
            return "Inscription";
        case "COHESION_STAY":
            return "Séjour de cohésion";
        case "INTEREST_MISSION":
            return "Mission d'intérêt général";
        case "CONTINUE":
            return "Poursuivre le SNU";
        case "SUMMER":
            return "Vacances d'été (juillet ou août)";
        case "AUTUMN":
            return "Vacances d'automne";
        case "DECEMBER":
            return "Vacances de fin d'année (décembre)";
        case "WINTER":
            return "Vacances d'hiver";
        case "SPRING":
            return "Vacances de printemps";
        case "EVENING":
            return "En soirée";
        case "END_DAY":
            return "Pendant l'après-midi";
        case "WEEKEND":
            return "Durant le week-end";
        case "CITIZENSHIP":
            return "Citoyenneté";
        case "CULTURE":
            return "Culture";
        case "DEFENSE":
            return "Défense et mémoire";
        case "EDUCATION":
            return "Éducation";
        case "ENVIRONMENT":
            return "Environnement";
        case "HEALTH":
            return "Santé";
        case "SECURITY":
            return "Sécurité";
        case "SOLIDARITY":
            return "Solidarité";
        case "SPORT":
            return "Sport";
        case "UNIFORM":
            return "Corps en uniforme";
        case "UNKNOWN":
            return "Non connu pour le moment";
        case "FIREFIGHTER":
            return "Pompiers";
        case "POLICE":
            return "Police";
        case "ARMY":
            return "Militaire";
        case "DURING_HOLIDAYS":
            return "Sur les vacances scolaires";
        case "DURING_SCHOOL":
            return "Sur le temps scolaire";
        case "true":
            return "Oui";
        case "false":
            return "Non";
        case "male":
            return "Homme";
        case "female":
            return "Femme";
        case "father":
            return "Père";
        case "mother":
            return "Mère";
        case "representant":
            return "Représentant légal";
        case "SERVER_ERROR":
            return "Erreur serveur";
        case "NOT_FOUND":
            return "Ressource introuvable";
        case "PASSWORD_TOKEN_EXPIRED_OR_INVALID":
            return "Lien expiré ou token invalide";
        case "USER_ALREADY_REGISTERED":
            return "Utilisateur déjà inscrit";
        case "PASSWORD_NOT_VALIDATED":
            return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
        case "INVITATION_TOKEN_EXPIRED_OR_INVALID":
            return "Invitation invalide";
        case "USER_NOT_FOUND":
            return "Utilisateur introuvable";
        case "USER_NOT_EXISTS":
            return "L'utilisateur n'existe pas";
        case "OPERATION_UNAUTHORIZED":
            return "Opération non autorisée";
        case "FILE_CORRUPTED":
            return "Ce fichier est corrompu";
        case "YOUNG_ALREADY_REGISTERED":
            return "Utilisateur déjà inscrit";
        case "OPERATION_NOT_ALLOWED":
            return "Opération non autorisée";
        case "BIKE":
            return "Vélo";
        case "MOTOR":
            return "Motorisé";
        case "CARPOOLING":
            return "Covoiturage";
        case "WAITING_REALISATION":
            return "En attente de réalisation";
        case "PUBLIC_TRANSPORT":
            return "Transport en commun";
        case "IN_COMING":
            return "À venir";
        case "other":
            return "Autre";
        case "SENT":
            return "Envoyée";
        case "UNSUPPORTED_TYPE":
            return "Type non pris en charge";
        case "LINKED_OBJECT":
            return "Objet lié";
        case "NO_TEMPLATE_FOUND":
            return "Template introuvable";
        case "INVALID_BODY":
            return "Requête invalide";
        case "INVALID_PARAMS":
            return "Requête invalide";
        case "EMAIL_OR_PASSWORD_INVALID":
            return "Email ou mot de passe invalide";
        case "PASSWORD_INVALID":
            return "Mot de passe invalide";
        case "EMAIL_INVALID":
            return "Email invalide";
        case "EMAIL_ALREADY_USED":
            return "Cette adresse e-mail est déjà utilisée";
        case "EMAIL_AND_PASSWORD_REQUIRED":
            return "Email et mot de passe requis";
        case "PASSWORD_NOT_MATCH":
            return "Les mots de passe ne correspondent pas";
        case "NEW_PASSWORD_IDENTICAL_PASSWORD":
            return "Le nouveau mot de passe est identique à l'ancien";
        default:
            return value;
    }
};
const $69f976ffcd86c7ac$var$translateState = (state)=>{
    switch(state){
        case "open":
        case "OPEN":
            return "ouvert";
        case "new":
        case "NEW":
            return "nouveau";
        case "closed":
        case "CLOSED":
            return "archivé";
        case "pending reminder":
        case "PENDING REMINDER":
            return "rappel en attente";
        case "pending closure":
        case "PENDING CLOSURE":
            return "clôture en attente";
        case "pending":
        case "PENDING":
            return "en attente";
        default:
            return state;
    }
};
const $69f976ffcd86c7ac$var$translateCohort = (cohort)=>{
    switch(cohort){
        case "Février 2022":
            return "du 13 au 25 Février 2022";
        case "Juin 2022":
            return "du 12 au 24 Juin 2022";
        case "Juillet 2022":
            return "du 3 au 15 Juillet 2022";
        default:
            return cohort;
    }
};
const $69f976ffcd86c7ac$var$translateSessionStatus = (statut)=>{
    switch(statut){
        case "VALIDATED":
            return "Validé";
        case "DRAFT":
            return "Brouillon";
        default:
            return statut;
    }
};
const $69f976ffcd86c7ac$var$translatePhase1 = (phase1)=>{
    switch(phase1){
        case "WAITING_AFFECTATION":
            return "En attente d'affectation";
        case "AFFECTED":
            return "Affectée";
        case "EXEMPTED":
            return "Dispensée";
        case "DONE":
            return "Validée";
        case "NOT_DONE":
            return "Non réalisée";
        case "WITHDRAWN":
            return "Désistée";
        case "CANCEL":
            return "Annulée";
        case "WAITING_LIST":
            return "Sur liste complémentaire";
        case "IN_COMING":
            return "À venir";
        default:
            return phase1;
    }
};
const $69f976ffcd86c7ac$var$translatePhase2 = (phase2)=>{
    switch(phase2){
        case "WAITING_REALISATION":
            return "Inactif";
        case "IN_PROGRESS":
            return "Actif";
        case "VALIDATED":
            return "Validée";
        case "WITHDRAWN":
            return "Désistée";
        case "IN_COMING":
            return "À venir";
        default:
            return phase2;
    }
};
const $69f976ffcd86c7ac$var$translateApplication = (candidature)=>{
    switch(candidature){
        case "WAITING_VALIDATION":
            return "Candidature en attente de validation";
        case "WAITING_VERIFICATION":
            return "En attente de vérification d'éligibilité";
        case "WAITING_ACCEPTATION":
            return "Proposition de mission en attente";
        case "VALIDATED":
            return "Candidature approuvée";
        case "REFUSED":
            return "Candidature non retenue";
        case "CANCEL":
            return "Candidature annulée";
        case "IN_PROGRESS":
            return "Mission en cours";
        case "DONE":
            return "Mission effectuée";
        case "ABANDON":
            return "Mission abandonnée";
        default:
            return candidature;
    }
};
const $69f976ffcd86c7ac$var$translateEngagement = (engagement)=>{
    switch(engagement){
        case "DRAFT":
            return "Brouillon";
        case "SENT":
            return "Envoyée";
        case "VALIDATED":
            return "Contrat signé";
        default:
            return engagement;
    }
};
const $69f976ffcd86c7ac$var$translateFileStatusPhase1 = (status)=>{
    switch(status){
        case "TO_UPLOAD":
            return "À renseigner";
        case "WAITING_VERIFICATION":
            return "En attente de vérification";
        case "WAITING_CORRECTION":
            return "En attente de correction";
        case "VALIDATED":
            return "Validé";
        case "cohesionStayMedical":
            return "fiche sanitaire";
        case "autoTestPCR":
            return "consentement à l’utilisation d’autotest COVID";
        case "imageRight":
            return "consentement de droit à l'image";
        case "rules":
            return "règlement intérieur";
        default:
            return status;
    }
};
$69f976ffcd86c7ac$exports = {
    translate: $69f976ffcd86c7ac$var$translate,
    translateState: $69f976ffcd86c7ac$var$translateState,
    translateCohort: $69f976ffcd86c7ac$var$translateCohort,
    translateSessionStatus: $69f976ffcd86c7ac$var$translateSessionStatus,
    translatePhase1: $69f976ffcd86c7ac$var$translatePhase1,
    translatePhase2: $69f976ffcd86c7ac$var$translatePhase2,
    translateApplication: $69f976ffcd86c7ac$var$translateApplication,
    translateEngagement: $69f976ffcd86c7ac$var$translateEngagement,
    translateFileStatusPhase1: $69f976ffcd86c7ac$var$translateFileStatusPhase1
};


var $e43d3a0a59b0d290$exports = {};
const $e43d3a0a59b0d290$var$putLocation = async (city, zip)=>{
    // try with municipality = city + zip
    const responseMunicipality = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(city + " " + zip)}&type=municipality`, {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const resMunicipality = await responseMunicipality.json();
    if (resMunicipality.features.length > 0) return {
        lon: resMunicipality.features[0].geometry.coordinates[0],
        lat: resMunicipality.features[0].geometry.coordinates[1]
    };
    // try with locality = city + zip
    const responseLocality = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(zip + " " + city)}&type=locality`, {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const resLocality = await responseLocality.json();
    if (resLocality.features.length > 0) return {
        lon: resLocality.features[0].geometry.coordinates[0],
        lat: resLocality.features[0].geometry.coordinates[1]
    };
    // try with postcode = zip
    let url = `https://api-adresse.data.gouv.fr/search/?q=${city || zip}`;
    if (zip) url += `&postcode=${zip}`;
    const responsePostcode = await fetch(url, {
        mode: "cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const resPostcode = await responsePostcode.json();
    if (resPostcode.features.length > 0) return {
        lon: resPostcode.features[0].geometry.coordinates[0],
        lat: resPostcode.features[0].geometry.coordinates[1]
    };
    return {
        lon: 2.352222,
        lat: 48.856613
    };
};
const $e43d3a0a59b0d290$var$departmentLookUp = {
    "01": "Ain",
    "02": "Aisne",
    "03": "Allier",
    "04": "Alpes-de-Haute-Provence",
    "05": "Hautes-Alpes",
    "06": "Alpes-Maritimes",
    "07": "Ardèche",
    "08": "Ardennes",
    "09": "Ariège",
    10: "Aube",
    11: "Aude",
    12: "Aveyron",
    13: "Bouches-du-Rhône",
    14: "Calvados",
    15: "Cantal",
    16: "Charente",
    17: "Charente-Maritime",
    18: "Cher",
    19: "Corrèze",
    20: "Corse",
    21: "Côte-d'Or",
    22: "Côtes-d'Armor",
    23: "Creuse",
    24: "Dordogne",
    25: "Doubs",
    26: "Drôme",
    27: "Eure",
    28: "Eure-et-Loir",
    29: "Finistère",
    "2A": "Corse-du-Sud",
    "2B": "Haute-Corse",
    30: "Gard",
    31: "Haute-Garonne",
    32: "Gers",
    33: "Gironde",
    34: "Hérault",
    35: "Ille-et-Vilaine",
    36: "Indre",
    37: "Indre-et-Loire",
    38: "Isère",
    39: "Jura",
    40: "Landes",
    41: "Loir-et-Cher",
    42: "Loire",
    43: "Haute-Loire",
    44: "Loire-Atlantique",
    45: "Loiret",
    46: "Lot",
    47: "Lot-et-Garonne",
    48: "Lozère",
    49: "Maine-et-Loire",
    50: "Manche",
    51: "Marne",
    52: "Haute-Marne",
    53: "Mayenne",
    54: "Meurthe-et-Moselle",
    55: "Meuse",
    56: "Morbihan",
    57: "Moselle",
    58: "Nièvre",
    59: "Nord",
    60: "Oise",
    61: "Orne",
    62: "Pas-de-Calais",
    63: "Puy-de-Dôme",
    64: "Pyrénées-Atlantiques",
    65: "Hautes-Pyrénées",
    66: "Pyrénées-Orientales",
    67: "Bas-Rhin",
    68: "Haut-Rhin",
    69: "Rhône",
    70: "Haute-Saône",
    71: "Saône-et-Loire",
    72: "Sarthe",
    73: "Savoie",
    74: "Haute-Savoie",
    75: "Paris",
    76: "Seine-Maritime",
    77: "Seine-et-Marne",
    78: "Yvelines",
    79: "Deux-Sèvres",
    80: "Somme",
    81: "Tarn",
    82: "Tarn-et-Garonne",
    83: "Var",
    84: "Vaucluse",
    85: "Vendée",
    86: "Vienne",
    87: "Haute-Vienne",
    88: "Vosges",
    89: "Yonne",
    90: "Territoire de Belfort",
    91: "Essonne",
    92: "Hauts-de-Seine",
    93: "Seine-Saint-Denis",
    94: "Val-de-Marne",
    95: "Val-d'Oise",
    971: "Guadeloupe",
    "971b": "Saint-Barthélemy",
    972: "Martinique",
    973: "Guyane",
    974: "La Réunion",
    975: "Saint-Pierre-et-Miquelon",
    976: "Mayotte",
    978: "Saint-Martin",
    984: "Terres australes et antarctiques françaises",
    986: "Wallis-et-Futuna",
    987: "Polynésie française",
    988: "Nouvelle-Calédonie"
};
const $e43d3a0a59b0d290$var$departmentList = Object.values($e43d3a0a59b0d290$var$departmentLookUp);
const $e43d3a0a59b0d290$var$getDepartmentNumber = (d)=>Object.keys($e43d3a0a59b0d290$var$departmentLookUp).find((key)=>$e43d3a0a59b0d290$var$departmentLookUp[key] === d
    )
;
const $e43d3a0a59b0d290$var$getDepartmentByZip = (zip)=>{
    if (!zip) return;
    if (zip.length !== 5) return;
    const departmentCode = zip.substr(0, 2);
    return $e43d3a0a59b0d290$var$departmentLookUp[departmentCode];
};
const $e43d3a0a59b0d290$var$getRegionByZip = (zip)=>{
    if (!zip) return;
    if (zip.length !== 5) return;
    const departmentCode = zip.substr(0, 2);
    const department = $e43d3a0a59b0d290$var$departmentLookUp[departmentCode];
    return $e43d3a0a59b0d290$var$department2region[department];
};
const $e43d3a0a59b0d290$var$regionList = [
    "Auvergne-Rhône-Alpes",
    "Bourgogne-Franche-Comté",
    "Bretagne",
    "Centre-Val de Loire",
    "Corse",
    "Grand Est",
    "Hauts-de-France",
    "Île-de-France",
    "Normandie",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Pays de la Loire",
    "Provence-Alpes-Côte d'Azur",
    "Guadeloupe",
    "Martinique",
    "Guyane",
    "La Réunion",
    "Saint-Pierre-et-Miquelon",
    "Mayotte",
    "Terres australes et antarctiques françaises",
    "Wallis-et-Futuna",
    "Polynésie française",
    "Nouvelle-Calédonie", 
];
const $e43d3a0a59b0d290$var$department2region = {
    Ain: "Auvergne-Rhône-Alpes",
    Aisne: "Hauts-de-France",
    Allier: "Auvergne-Rhône-Alpes",
    "Alpes-de-Haute-Provence": "Provence-Alpes-Côte d'Azur",
    "Hautes-Alpes": "Provence-Alpes-Côte d'Azur",
    "Alpes-Maritimes": "Provence-Alpes-Côte d'Azur",
    Ardèche: "Auvergne-Rhône-Alpes",
    Ardennes: "Grand Est",
    Ariège: "Occitanie",
    Aube: "Grand Est",
    Aude: "Occitanie",
    Aveyron: "Occitanie",
    "Bouches-du-Rhône": "Provence-Alpes-Côte d'Azur",
    Calvados: "Normandie",
    Cantal: "Auvergne-Rhône-Alpes",
    Charente: "Nouvelle-Aquitaine",
    "Charente-Maritime": "Nouvelle-Aquitaine",
    Cher: "Centre-Val de Loire",
    Corrèze: "Nouvelle-Aquitaine",
    "Côte-d'Or": "Bourgogne-Franche-Comté",
    "Côtes-d'Armor": "Bretagne",
    Creuse: "Nouvelle-Aquitaine",
    Dordogne: "Nouvelle-Aquitaine",
    Doubs: "Bourgogne-Franche-Comté",
    Drôme: "Auvergne-Rhône-Alpes",
    Eure: "Normandie",
    "Eure-et-Loir": "Centre-Val de Loire",
    Finistère: "Bretagne",
    "Corse-du-Sud": "Corse",
    "Haute-Corse": "Corse",
    Gard: "Occitanie",
    "Haute-Garonne": "Occitanie",
    Gers: "Occitanie",
    Gironde: "Nouvelle-Aquitaine",
    Hérault: "Occitanie",
    "Ille-et-Vilaine": "Bretagne",
    Indre: "Centre-Val de Loire",
    "Indre-et-Loire": "Centre-Val de Loire",
    Isère: "Auvergne-Rhône-Alpes",
    Jura: "Bourgogne-Franche-Comté",
    Landes: "Nouvelle-Aquitaine",
    "Loir-et-Cher": "Centre-Val de Loire",
    Loire: "Auvergne-Rhône-Alpes",
    "Haute-Loire": "Auvergne-Rhône-Alpes",
    "Loire-Atlantique": "Pays de la Loire",
    Loiret: "Centre-Val de Loire",
    Lot: "Occitanie",
    "Lot-et-Garonne": "Nouvelle-Aquitaine",
    Lozère: "Occitanie",
    "Maine-et-Loire": "Pays de la Loire",
    Manche: "Normandie",
    Marne: "Grand Est",
    "Haute-Marne": "Grand Est",
    Mayenne: "Pays de la Loire",
    "Meurthe-et-Moselle": "Grand Est",
    Meuse: "Grand Est",
    Morbihan: "Bretagne",
    Moselle: "Grand Est",
    Nièvre: "Bourgogne-Franche-Comté",
    Nord: "Hauts-de-France",
    Oise: "Hauts-de-France",
    Orne: "Normandie",
    "Pas-de-Calais": "Hauts-de-France",
    "Puy-de-Dôme": "Auvergne-Rhône-Alpes",
    "Pyrénées-Atlantiques": "Nouvelle-Aquitaine",
    "Hautes-Pyrénées": "Occitanie",
    "Pyrénées-Orientales": "Occitanie",
    "Bas-Rhin": "Grand Est",
    "Haut-Rhin": "Grand Est",
    Rhône: "Auvergne-Rhône-Alpes",
    "Haute-Saône": "Bourgogne-Franche-Comté",
    "Saône-et-Loire": "Bourgogne-Franche-Comté",
    Sarthe: "Pays de la Loire",
    Savoie: "Auvergne-Rhône-Alpes",
    "Haute-Savoie": "Auvergne-Rhône-Alpes",
    Paris: "Île-de-France",
    "Seine-Maritime": "Normandie",
    "Seine-et-Marne": "Île-de-France",
    Yvelines: "Île-de-France",
    "Deux-Sèvres": "Nouvelle-Aquitaine",
    Somme: "Hauts-de-France",
    Tarn: "Occitanie",
    "Tarn-et-Garonne": "Occitanie",
    Var: "Provence-Alpes-Côte d'Azur",
    Vaucluse: "Provence-Alpes-Côte d'Azur",
    Vendée: "Pays de la Loire",
    Vienne: "Nouvelle-Aquitaine",
    "Haute-Vienne": "Nouvelle-Aquitaine",
    Vosges: "Grand Est",
    Yonne: "Bourgogne-Franche-Comté",
    "Territoire de Belfort": "Bourgogne-Franche-Comté",
    Essonne: "Île-de-France",
    "Hauts-de-Seine": "Île-de-France",
    "Seine-Saint-Denis": "Île-de-France",
    "Val-de-Marne": "Île-de-France",
    "Val-d'Oise": "Île-de-France",
    Guadeloupe: "Guadeloupe",
    Martinique: "Martinique",
    Guyane: "Guyane",
    "La Réunion": "La Réunion",
    "Saint-Pierre-et-Miquelon": "Saint-Pierre-et-Miquelon",
    Mayotte: "Mayotte",
    "Saint-Barthélemy": "Guadeloupe",
    "Saint-Martin": "Guadeloupe",
    "Terres australes et antarctiques françaises": "Terres australes et antarctiques françaises",
    "Wallis-et-Futuna": "Wallis-et-Futuna",
    "Polynésie française": "Polynésie française",
    "Nouvelle-Calédonie": "Nouvelle-Calédonie"
};
const $e43d3a0a59b0d290$var$region2department = {
    "Auvergne-Rhône-Alpes": [
        "Ain",
        "Allier",
        "Ardèche",
        "Cantal",
        "Drôme",
        "Isère",
        "Loire",
        "Haute-Loire",
        "Puy-de-Dôme",
        "Rhône",
        "Savoie",
        "Haute-Savoie"
    ],
    "Bourgogne-Franche-Comté": [
        "Côte-d'Or",
        "Doubs",
        "Jura",
        "Nièvre",
        "Haute-Saône",
        "Saône-et-Loire",
        "Yonne",
        "Territoire de Belfort"
    ],
    Bretagne: [
        "Côtes-d'Armor",
        "Finistère",
        "Ille-et-Vilaine",
        "Morbihan"
    ],
    "Centre-Val de Loire": [
        "Cher",
        "Eure-et-Loir",
        "Indre",
        "Indre-et-Loire",
        "Loir-et-Cher",
        "Loiret"
    ],
    Corse: [
        "Corse-du-Sud",
        "Haute-Corse"
    ],
    "Grand Est": [
        "Ardennes",
        "Aube",
        "Marne",
        "Haute-Marne",
        "Meurthe-et-Moselle",
        "Meuse",
        "Moselle",
        "Bas-Rhin",
        "Haut-Rhin",
        "Vosges"
    ],
    "Hauts-de-France": [
        "Aisne",
        "Nord",
        "Oise",
        "Pas-de-Calais",
        "Somme"
    ],
    "Île-de-France": [
        "Paris",
        "Seine-et-Marne",
        "Yvelines",
        "Essonne",
        "Hauts-de-Seine",
        "Seine-Saint-Denis",
        "Val-de-Marne",
        "Val-d'Oise"
    ],
    Normandie: [
        "Calvados",
        "Eure",
        "Manche",
        "Orne",
        "Seine-Maritime"
    ],
    "Nouvelle-Aquitaine": [
        "Charente",
        "Charente-Maritime",
        "Corrèze",
        "Creuse",
        "Dordogne",
        "Gironde",
        "Landes",
        "Lot-et-Garonne",
        "Pyrénées-Atlantiques",
        "Deux-Sèvres",
        "Vienne",
        "Haute-Vienne", 
    ],
    Occitanie: [
        "Ariège",
        "Aude",
        "Aveyron",
        "Gard",
        "Haute-Garonne",
        "Gers",
        "Hérault",
        "Lot",
        "Lozère",
        "Hautes-Pyrénées",
        "Pyrénées-Orientales",
        "Tarn",
        "Tarn-et-Garonne"
    ],
    "Pays de la Loire": [
        "Loire-Atlantique",
        "Maine-et-Loire",
        "Mayenne",
        "Sarthe",
        "Vendée"
    ],
    "Provence-Alpes-Côte d'Azur": [
        "Alpes-de-Haute-Provence",
        "Hautes-Alpes",
        "Alpes-Maritimes",
        "Bouches-du-Rhône",
        "Var",
        "Vaucluse"
    ],
    Guadeloupe: [
        "Guadeloupe",
        "Saint-Martin",
        "Saint-Barthélemy"
    ],
    Martinique: [
        "Martinique"
    ],
    Guyane: [
        "Guyane"
    ],
    "La Réunion": [
        "La Réunion"
    ],
    "Saint-Pierre-et-Miquelon": [
        "Saint-Pierre-et-Miquelon"
    ],
    Mayotte: [
        "Mayotte"
    ],
    "Terres australes et antarctiques françaises": [
        "Terres australes et antarctiques françaises"
    ],
    "Wallis-et-Futuna": [
        "Wallis-et-Futuna"
    ],
    "Polynésie française": [
        "Polynésie française"
    ],
    "Nouvelle-Calédonie": [
        "Nouvelle-Calédonie"
    ]
};
$e43d3a0a59b0d290$exports = {
    departmentLookUp: $e43d3a0a59b0d290$var$departmentLookUp,
    departmentList: $e43d3a0a59b0d290$var$departmentList,
    getDepartmentNumber: $e43d3a0a59b0d290$var$getDepartmentNumber,
    regionList: $e43d3a0a59b0d290$var$regionList,
    department2region: $e43d3a0a59b0d290$var$department2region,
    region2department: $e43d3a0a59b0d290$var$region2department,
    putLocation: $e43d3a0a59b0d290$var$putLocation,
    getDepartmentByZip: $e43d3a0a59b0d290$var$getDepartmentByZip,
    getRegionByZip: $e43d3a0a59b0d290$var$getRegionByZip
};


var $fc5f726f71db80a2$exports = {};
const $fc5f726f71db80a2$var$departmentToAcademy = {
    Allier: "Clermont-Ferrand",
    Cantal: "Clermont-Ferrand",
    "Haute-Loire": "Clermont-Ferrand",
    "Puy-de-Dôme": "Clermont-Ferrand",
    Ardèche: "Grenoble",
    Drôme: "Grenoble",
    Isère: "Grenoble",
    Savoie: "Grenoble",
    "Haute-Savoie": "Grenoble",
    Ain: "Lyon",
    Loire: "Lyon",
    Rhône: "Lyon",
    Doubs: "Besançon",
    Jura: "Besançon",
    "Haute-Saône": "Besançon",
    "Territoire de Belfort": "Besançon",
    "Côte-d'Or": "Dijon",
    Nièvre: "Dijon",
    "Saône-et-Loire": "Dijon",
    Yonne: "Dijon",
    "Côtes-d'Armor": "Rennes",
    Finistère: "Rennes",
    "Ille-et-Vilaine": "Rennes",
    Morbihan: "Rennes",
    Cher: "Orléans-Tours",
    "Eure-et-Loir": "Orléans-Tours",
    Indre: "Orléans-Tours",
    "Indre-et-Loire": "Orléans-Tours",
    "Loir-et-Cher": "Orléans-Tours",
    Loiret: "Orléans-Tours",
    "Corse-du-Sud": "Corse",
    "Haute-Corse": "Corse",
    "Meurthe-et-Moselle": "Nancy-Metz",
    Meuse: "Nancy-Metz",
    Moselle: "Nancy-Metz",
    Vosges: "Nancy-Metz",
    Ardennes: "Reims",
    Aube: "Reims",
    Marne: "Reims",
    "Haute-Marne": "Reims",
    "Bas-Rhin": "Strasbourg",
    "Haut-Rhin": "Strasbourg",
    Aisne: "Amiens",
    Oise: "Amiens",
    Somme: "Amiens",
    Nord: "Lille",
    "Pas-de-Calais": "Lille",
    "Seine-et-Marne": "Créteil",
    "Seine-Saint-Denis": "Créteil",
    "Val-de-Marne": "Créteil",
    Paris: "Paris",
    Yvelines: "Versailles",
    Essonne: "Versailles",
    "Hauts-de-Seine": "Versailles",
    "Val-d'Oise": "Versailles",
    Calvados: "Normandie",
    Eure: "Normandie",
    Manche: "Normandie",
    Orne: "Normandie",
    "Seine-Maritime": "Normandie",
    Dordogne: "Bordeaux",
    Gironde: "Bordeaux",
    Landes: "Bordeaux",
    "Lot-et-Garonne": "Bordeaux",
    "Pyrénées-Atlantiques": "Bordeaux",
    Corrèze: "Limoges",
    Creuse: "Limoges",
    "Haute-Vienne": "Limoges",
    Charente: "Poitiers",
    "Charente-Maritime": "Poitiers",
    "Deux-Sèvres": "Poitiers",
    Vienne: "Poitiers",
    Aude: "Montpellier",
    Gard: "Montpellier",
    Hérault: "Montpellier",
    Lozère: "Montpellier",
    "Pyrénées-Orientales": "Montpellier",
    Ariège: "Toulouse",
    Aveyron: "Toulouse",
    "Haute-Garonne": "Toulouse",
    Gers: "Toulouse",
    Lot: "Toulouse",
    "Hautes-Pyrénées": "Toulouse",
    Tarn: "Toulouse",
    "Tarn-et-Garonne": "Toulouse",
    "Loire-Atlantique": "Nantes",
    "Maine-et-Loire": "Nantes",
    Mayenne: "Nantes",
    Sarthe: "Nantes",
    Vendée: "Nantes",
    "Alpes-de-Haute-Provence": "Aix-Marseille",
    "Hautes-Alpes": "Aix-Marseille",
    "Bouches-du-Rhône": "Aix-Marseille",
    Vaucluse: "Aix-Marseille",
    "Alpes-Maritimes": "Nice",
    Var: "Nice",
    Guadeloupe: "Guadeloupe",
    Martinique: "Martinique",
    Mayotte: "Mayotte",
    Guyane: "Guyane",
    "La Réunion": "La Réunion",
    "Nouvelle-Calédonie": "Nouvelle-Calédonie",
    "Polynésie française": "Polynésie française",
    "Wallis-et-Futuna": "Wallis-et-Futuna",
    "Saint-Pierre-et-Miquelon": "Saint-Pierre-et-Miquelon"
};
const $fc5f726f71db80a2$var$academyToDepartments = {
    "Clermont-Ferrand": [
        "Allier",
        "Cantal",
        "Haute-Loire",
        "Puy-de-Dôme"
    ],
    Grenoble: [
        "Ardèche",
        "Drôme",
        "Isère",
        "Savoie",
        "Haute-Savoie"
    ],
    Lyon: [
        "Ain",
        "Loire",
        "Rhône"
    ],
    Besançon: [
        "Doubs",
        "Jura",
        "Haute-Saône",
        "Territoire de Belfort"
    ],
    Dijon: [
        "Côte-d'Or",
        "Nièvre",
        "Saône-et-Loire",
        "Yonne"
    ],
    Rennes: [
        "Côtes-d'Armor",
        "Finistère",
        "Ille-et-Vilaine",
        "Morbihan"
    ],
    "Orléans-Tours": [
        "Cher",
        "Eure-et-Loir",
        "Indre",
        "Indre-et-Loire",
        "Loir-et-Cher",
        "Loiret"
    ],
    Corse: [
        "Corse-du-Sud",
        "Haute-Corse"
    ],
    "Nancy-Metz": [
        "Meurthe-et-Moselle",
        "Meuse",
        "Moselle",
        "Vosges"
    ],
    Reims: [
        "Ardennes",
        "Aube",
        "Marne",
        "Haute-Marne"
    ],
    Strasbourg: [
        "Bas-Rhin",
        "Haut-Rhin"
    ],
    Amiens: [
        "Aisne",
        "Oise",
        "Somme"
    ],
    Lille: [
        "Nord",
        "Pas-de-Calais"
    ],
    Créteil: [
        "Seine-et-Marne",
        "Seine-Saint-Denis",
        "Val-de-Marne"
    ],
    Paris: [
        "Paris"
    ],
    Versailles: [
        "Yvelines",
        "Essonne",
        "Hauts-de-Seine",
        "Val-d'Oise"
    ],
    Normandie: [
        "Calvados",
        "Eure",
        "Manche",
        "Orne",
        "Seine-Maritime"
    ],
    Bordeaux: [
        "Dordogne",
        "Gironde",
        "Landes",
        "Lot-et-Garonne",
        "Pyrénées-Atlantiques"
    ],
    Limoges: [
        "Corrèze",
        "Creuse",
        "Haute-Vienne"
    ],
    Poitiers: [
        "Charente",
        "Charente-Maritime",
        "Deux-Sèvres",
        "Vienne"
    ],
    Montpellier: [
        "Aude",
        "Gard",
        "Hérault",
        "Lozère",
        "Pyrénées-Orientales"
    ],
    Toulouse: [
        "Ariège",
        "Aveyron",
        "Haute-Garonne",
        "Gers",
        "Lot",
        "Hautes-Pyrénées",
        "Tarn",
        "Tarn-et-Garonne"
    ],
    Nantes: [
        "Loire-Atlantique",
        "Maine-et-Loire",
        "Mayenne",
        "Sarthe",
        "Vendée"
    ],
    "Aix-Marseille": [
        "Alpes-de-Haute-Provence",
        "Hautes-Alpes",
        "Bouches-du-Rhône",
        "Vaucluse"
    ],
    Nice: [
        "Alpes-Maritimes",
        "Var"
    ],
    Guadeloupe: "Guadeloupe",
    Martinique: "Martinique",
    Mayotte: "Mayotte",
    Guyane: "Guyane",
    "La Réunion": "La Réunion",
    "Nouvelle-Calédonie": "Nouvelle-Calédonie",
    "Polynésie française": "Polynésie française",
    "Wallis-et-Futuna": "Wallis-et-Futuna",
    "Saint-Pierre-et-Miquelon": "Saint-Pierre-et-Miquelon"
};
const $fc5f726f71db80a2$var$academyList = [
    ...new Set(Object.values($fc5f726f71db80a2$var$departmentToAcademy))
];
$fc5f726f71db80a2$exports = {
    departmentToAcademy: $fc5f726f71db80a2$var$departmentToAcademy,
    academyList: $fc5f726f71db80a2$var$academyList,
    academyToDepartments: $fc5f726f71db80a2$var$academyToDepartments
};



var $9570a7557ec384de$exports = {};
const $9570a7557ec384de$var$ticketStates = {
    1: "new",
    2: "open",
    3: "pending reminder",
    4: "closed",
    7: "pending closure"
};
const $9570a7557ec384de$var$ticketStateNameById = (id)=>$9570a7557ec384de$var$ticketStates[id]
;
const $9570a7557ec384de$var$ticketStateIdByName = (name)=>{
    return Number(Object.keys($9570a7557ec384de$var$ticketStates).reduce((ret, key)=>{
        ret[$9570a7557ec384de$var$ticketStates[key]] = key;
        return ret;
    }, {})[name]);
};
const $9570a7557ec384de$var$totalOpenedTickets = (tickets)=>{
    return (tickets || []).filter((ticket)=>(ticket || {}).status.toLowerCase() === "open"
    ).length;
};
const $9570a7557ec384de$var$totalNewTickets = (tickets)=>{
    return (tickets || []).filter((ticket)=>(ticket || {}).status.toLowerCase() === "new"
    ).length;
};
const $9570a7557ec384de$var$totalClosedTickets = (tickets)=>{
    return (tickets || []).filter((ticket)=>(ticket || {}).status.toLowerCase() === "closed"
    ).length;
};
$9570a7557ec384de$exports = {
    ticketStateIdByName: $9570a7557ec384de$var$ticketStateIdByName,
    totalOpenedTickets: $9570a7557ec384de$var$totalOpenedTickets,
    totalNewTickets: $9570a7557ec384de$var$totalNewTickets,
    totalClosedTickets: $9570a7557ec384de$var$totalClosedTickets,
    ticketStateNameById: $9570a7557ec384de$var$ticketStateNameById
};



var $cf838c15c8b009ba$require$YOUNG_STATUS_PHASE1 = $8618afcb3bea0caa$exports.YOUNG_STATUS_PHASE1;
var $cf838c15c8b009ba$require$COHESION_STAY_START = $8618afcb3bea0caa$exports.COHESION_STAY_START;
const $cf838c15c8b009ba$var$isInRuralArea = (v)=>{
    if (!v.populationDensity) return null;
    return [
        "PEU DENSE",
        "TRES PEU DENSE"
    ].includes(v.populationDensity) ? "true" : "false";
};
console.log("hahaha");
// See: https://trello.com/c/JBS3Jn8I/576-inscription-impact-fin-instruction-dossiers-au-6-mai
function $cf838c15c8b009ba$var$isEndOfInscriptionManagement2021() {
    return new Date() > new Date(2021, 4, 7); // greater than 7 mai 2021 morning
}
function $cf838c15c8b009ba$var$inscriptionModificationOpenForYoungs(cohort) {
    switch(cohort){
        case "2019":
        case "2020":
        case "2021":
            return false;
        case "2022":
            return new Date() < new Date(2022, 4, 5); // before 5 mai 2022 morning
        case "Février 2022":
            return new Date() < new Date(2022, 0, 10); // before 10 janvier 2022 morning
        case "Juin 2022":
            return new Date() < new Date(2022, 3, 27); // before 27 avril 2022 morning
        case "Juillet 2022":
            return new Date() < new Date(2022, 4, 5); // before 5 mai 2022 morning
        default:
            return new Date() < new Date(2022, 4, 5); // before 5 mai 2022 morning
    }
}
function $cf838c15c8b009ba$var$inscriptionCreationOpenForYoungs(cohort) {
    switch(cohort){
        case "Février 2022":
            return new Date() < new Date(2022, 0, 10); // before 10 janvier 2022 morning
        case "Juin 2022":
            return new Date() < new Date(2022, 3, 25); // before 25 avril 2022 morning
        case "2022":
        case "Juillet 2022":
            return new Date() < new Date(2022, 4, 2); // before 2 mai 2022 morning
        default:
            return new Date() < new Date(2022, 4, 2); // before 2 mai 2022 morning
    }
}
const $cf838c15c8b009ba$var$getFilterLabel = (selected, placeholder = "Choisissez un filtre", prelabel = "")=>{
    if (Object.keys(selected).length === 0) return placeholder;
    const translator = (item)=>{
        if (prelabel === "Statut phase 2") return $69f976ffcd86c7ac$exports.translatePhase2(item);
        else if (prelabel === "Statut phase 1") return $69f976ffcd86c7ac$exports.translatePhase1(item);
        else if (prelabel === "Statut mission (candidature)") return $69f976ffcd86c7ac$exports.translateApplication(item);
        else if (prelabel === "Statut contrats") return $69f976ffcd86c7ac$exports.translateEngagement(item);
        else return $69f976ffcd86c7ac$exports.translate(item);
    };
    const translated = Object.keys(selected).map((item)=>{
        return translator(item);
    });
    let value = translated.join(", ");
    if (prelabel) value = prelabel + " : " + value;
    return value;
};
const $cf838c15c8b009ba$var$getResultLabel = (e, pageSize)=>`${pageSize * e.currentPage + 1}-${pageSize * e.currentPage + e.displayedResults} sur ${e.numberOfResults}`
;
const $cf838c15c8b009ba$var$getLabelWithdrawnReason = (value)=>$8618afcb3bea0caa$exports.WITHRAWN_REASONS.find((e)=>e.value === value
    )?.label || value
;
function $cf838c15c8b009ba$var$canUpdateYoungStatus({ body: body , current: current  }) {
    if (!body || !current) return true;
    const allStatus = [
        "status",
        "statusPhase1",
        "statusPhase2",
        "statusPhase3",
        "statusMilitaryPreparationFiles",
        "statusPhase2Contract"
    ];
    if (!allStatus.some((s)=>body[s] !== current[s]
    )) return true;
    const youngStatus = body.status === "VALIDATED" && current.status !== "VALIDATED";
    const youngStatusPhase1 = body.statusPhase1 === "DONE" && current.statusPhase1 !== "DONE";
    const youngStatusPhase2 = body.statusPhase2 === "VALIDATED" && current.statusPhase2 !== "VALIDATED";
    const youngStatusPhase3 = body.statusPhase3 === "VALIDATED" && current.statusPhase3 !== "VALIDATED";
    const youngStatusMilitaryPrepFiles = body.statusMilitaryPreparationFiles === "VALIDATED" && current.statusMilitaryPreparationFiles !== "VALIDATED";
    const youngStatusPhase2Contract = body.statusPhase2Contract === "VALIDATED" && current.statusPhase2Contract !== "VALIDATED";
    const notAuthorized = youngStatus || youngStatusPhase1 || youngStatusPhase2 || youngStatusPhase3 || youngStatusMilitaryPrepFiles || youngStatusPhase2Contract;
    return !notAuthorized;
}
const $cf838c15c8b009ba$var$youngCanChangeSession = ({ cohort: cohort , status: status  })=>{
    if ([
        $cf838c15c8b009ba$require$YOUNG_STATUS_PHASE1.AFFECTED,
        $cf838c15c8b009ba$require$YOUNG_STATUS_PHASE1.NOTDONE,
        $cf838c15c8b009ba$require$YOUNG_STATUS_PHASE1.WAITING_AFFECTATION
    ].includes(status)) {
        const now = Date.now();
        const limit = new Date($cf838c15c8b009ba$require$COHESION_STAY_START[cohort]);
        limit.setDate(limit.getDate() + 1);
        if (now < limit) return true;
    }
    return false;
};
const $cf838c15c8b009ba$var$formatPhoneNumberFR = (tel)=>{
    if (!tel) return "";
    const regex = /^((?:(?:\+|00)33|0)\s*[1-9])((?:[\s.-]*\d{2}){4})$/;
    const global = tel.match(regex);
    if (global?.length !== 3) return tel;
    const rest = global[2].match(/.{1,2}/g);
    const formatted = `${global[1]} ${rest.join(" ")}`;
    return formatted;
};
$cf838c15c8b009ba$exports = {
    isEndOfInscriptionManagement2021: $cf838c15c8b009ba$var$isEndOfInscriptionManagement2021,
    inscriptionModificationOpenForYoungs: $cf838c15c8b009ba$var$inscriptionModificationOpenForYoungs,
    inscriptionCreationOpenForYoungs: $cf838c15c8b009ba$var$inscriptionCreationOpenForYoungs,
    isInRuralArea: $cf838c15c8b009ba$var$isInRuralArea,
    getFilterLabel: $cf838c15c8b009ba$var$getFilterLabel,
    getResultLabel: $cf838c15c8b009ba$var$getResultLabel,
    getLabelWithdrawnReason: $cf838c15c8b009ba$var$getLabelWithdrawnReason,
    canUpdateYoungStatus: $cf838c15c8b009ba$var$canUpdateYoungStatus,
    youngCanChangeSession: $cf838c15c8b009ba$var$youngCanChangeSession,
    formatPhoneNumberFR: $cf838c15c8b009ba$var$formatPhoneNumberFR,
    ...$535cc80e997d96fd$exports,
    ...$e43d3a0a59b0d290$exports,
    ...$fc5f726f71db80a2$exports,
    ...$128713a3f1d64b6d$exports,
    ...$8618afcb3bea0caa$exports,
    ...$54daa7b8922c2588$exports,
    ...$71db770c56d953aa$exports,
    ...$9570a7557ec384de$exports,
    ...$69f976ffcd86c7ac$exports
};


export {$cf838c15c8b009ba$exports as default};
//# sourceMappingURL=module.js.map
