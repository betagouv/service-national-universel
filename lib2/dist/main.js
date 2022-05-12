var $7d4f411db05a06b1$exports = {};
const $7d4f411db05a06b1$var$colors = {
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
const $7d4f411db05a06b1$var$PHASE_STATUS_COLOR = {
    VALIDATED: $7d4f411db05a06b1$var$colors.green,
    DONE: $7d4f411db05a06b1$var$colors.green,
    CANCEL: $7d4f411db05a06b1$var$colors.orange,
    EXEMPTED: $7d4f411db05a06b1$var$colors.orange,
    IN_PROGRESS: $7d4f411db05a06b1$var$colors.purple,
    AFFECTED: $7d4f411db05a06b1$var$colors.purple,
    WITHDRAWN: $7d4f411db05a06b1$var$colors.red,
    WAITING_ACCEPTATION: $7d4f411db05a06b1$var$colors.yellow
};
const $7d4f411db05a06b1$var$APPLICATION_STATUS_COLORS = {
    WAITING_VALIDATION: $7d4f411db05a06b1$var$colors.orange,
    WAITING_VERIFICATION: $7d4f411db05a06b1$var$colors.orange,
    WAITING_ACCEPTATION: $7d4f411db05a06b1$var$colors.yellow,
    VALIDATED: $7d4f411db05a06b1$var$colors.green,
    DONE: $7d4f411db05a06b1$var$colors.darkGreen,
    REFUSED: $7d4f411db05a06b1$var$colors.pink,
    CANCEL: $7d4f411db05a06b1$var$colors.lightOrange,
    IN_PROGRESS: $7d4f411db05a06b1$var$colors.darkPurple,
    ABANDON: $7d4f411db05a06b1$var$colors.red
};
const $7d4f411db05a06b1$var$YOUNG_STATUS_COLORS = {
    WAITING_VALIDATION: $7d4f411db05a06b1$var$colors.orange,
    WAITING_CORRECTION: $7d4f411db05a06b1$var$colors.yellow,
    VALIDATED: $7d4f411db05a06b1$var$colors.green,
    REFUSED: $7d4f411db05a06b1$var$colors.pink,
    IN_PROGRESS: $7d4f411db05a06b1$var$colors.darkPurple,
    WITHDRAWN: $7d4f411db05a06b1$var$colors.lightGrey,
    WAITING_REALISATION: $7d4f411db05a06b1$var$colors.orange,
    AFFECTED: $7d4f411db05a06b1$var$colors.darkPurple,
    WAITING_AFFECTATION: $7d4f411db05a06b1$var$colors.yellow,
    WAITING_ACCEPTATION: $7d4f411db05a06b1$var$colors.yellow,
    NOT_ELIGIBLE: $7d4f411db05a06b1$var$colors.orange,
    CANCEL: $7d4f411db05a06b1$var$colors.orange,
    EXEMPTED: $7d4f411db05a06b1$var$colors.orange,
    DONE: $7d4f411db05a06b1$var$colors.green,
    NOT_DONE: $7d4f411db05a06b1$var$colors.red,
    WAITING_LIST: $7d4f411db05a06b1$var$colors.lightOrange,
    DELETED: $7d4f411db05a06b1$var$colors.lightGrey,
    ABANDONED: $7d4f411db05a06b1$var$colors.red
};
const $7d4f411db05a06b1$var$MISSION_STATUS_COLORS = {
    WAITING_VALIDATION: $7d4f411db05a06b1$var$colors.orange,
    WAITING_CORRECTION: $7d4f411db05a06b1$var$colors.yellow,
    VALIDATED: $7d4f411db05a06b1$var$colors.green,
    DRAFT: $7d4f411db05a06b1$var$colors.lightGold,
    REFUSED: $7d4f411db05a06b1$var$colors.pink,
    CANCEL: $7d4f411db05a06b1$var$colors.lightOrange,
    ARCHIVED: $7d4f411db05a06b1$var$colors.lightGrey
};
const $7d4f411db05a06b1$var$STRUCTURE_STATUS_COLORS = {
    WAITING_VALIDATION: $7d4f411db05a06b1$var$colors.orange,
    WAITING_CORRECTION: $7d4f411db05a06b1$var$colors.yellow,
    VALIDATED: $7d4f411db05a06b1$var$colors.green,
    DRAFT: $7d4f411db05a06b1$var$colors.lightGold
};
const $7d4f411db05a06b1$var$CONTRACT_STATUS_COLORS = {
    DRAFT: $7d4f411db05a06b1$var$colors.yellow,
    SENT: $7d4f411db05a06b1$var$colors.orange,
    VALIDATED: $7d4f411db05a06b1$var$colors.green
};
$7d4f411db05a06b1$exports = {
    PHASE_STATUS_COLOR: $7d4f411db05a06b1$var$PHASE_STATUS_COLOR,
    APPLICATION_STATUS_COLORS: $7d4f411db05a06b1$var$APPLICATION_STATUS_COLORS,
    YOUNG_STATUS_COLORS: $7d4f411db05a06b1$var$YOUNG_STATUS_COLORS,
    MISSION_STATUS_COLORS: $7d4f411db05a06b1$var$MISSION_STATUS_COLORS,
    STRUCTURE_STATUS_COLORS: $7d4f411db05a06b1$var$STRUCTURE_STATUS_COLORS,
    CONTRACT_STATUS_COLORS: $7d4f411db05a06b1$var$CONTRACT_STATUS_COLORS,
    colors: $7d4f411db05a06b1$var$colors
};


var $d33dec175518dfc8$exports = {};
const $d33dec175518dfc8$var$formatDay = (date)=>{
    if (!date) return "-";
    return new Date(date).toISOString().split("T")[0];
};
const $d33dec175518dfc8$var$formatDateFR = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR");
};
const $d33dec175518dfc8$var$formatLongDateFR = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
    });
};
const $d33dec175518dfc8$var$formatDateFRTimezoneUTC = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", {
        timeZone: "UTC"
    });
};
const $d33dec175518dfc8$var$formatLongDateUTC = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC"
    });
};
const $d33dec175518dfc8$var$formatLongDateUTCWithoutTime = (d)=>{
    if (!d) return "-";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", {
        timeZone: "UTC"
    });
};
const $d33dec175518dfc8$var$formatStringLongDate = (date)=>{
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
const $d33dec175518dfc8$var$formatStringDate = (date)=>{
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};
const $d33dec175518dfc8$var$formatStringDateTimezoneUTC = (date)=>{
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
    });
};
function $d33dec175518dfc8$var$dateForDatePicker(d) {
    return new Date(d).toISOString().split("T")[0];
}
function $d33dec175518dfc8$var$getAge(d) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(date - now);
    const age = Math.floor(diffTime / 31557600000);
    if (!age || isNaN(age)) return "?";
    return age;
}
const $d33dec175518dfc8$var$getLimitDateForPhase2 = (cohort)=>{
    if (cohort === "2019") return "23 mars 2021";
    if (cohort === "2020") return "31 décembre 2021 ";
    return "30 juin 2022";
};
$d33dec175518dfc8$exports = {
    formatDay: $d33dec175518dfc8$var$formatDay,
    formatDateFR: $d33dec175518dfc8$var$formatDateFR,
    formatLongDateFR: $d33dec175518dfc8$var$formatLongDateFR,
    formatDateFRTimezoneUTC: $d33dec175518dfc8$var$formatDateFRTimezoneUTC,
    formatLongDateUTC: $d33dec175518dfc8$var$formatLongDateUTC,
    formatStringLongDate: $d33dec175518dfc8$var$formatStringLongDate,
    formatStringDate: $d33dec175518dfc8$var$formatStringDate,
    formatStringDateTimezoneUTC: $d33dec175518dfc8$var$formatStringDateTimezoneUTC,
    dateForDatePicker: $d33dec175518dfc8$var$dateForDatePicker,
    getAge: $d33dec175518dfc8$var$getAge,
    getLimitDateForPhase2: $d33dec175518dfc8$var$getLimitDateForPhase2,
    formatLongDateUTCWithoutTime: $d33dec175518dfc8$var$formatLongDateUTCWithoutTime
};


var $be6f0e84320366a7$exports = {};
var $f75b8525f71fe92f$exports = {};
const $f75b8525f71fe92f$var$ROLES = {
    ADMIN: "admin",
    REFERENT_DEPARTMENT: "referent_department",
    REFERENT_REGION: "referent_region",
    RESPONSIBLE: "responsible",
    SUPERVISOR: "supervisor",
    HEAD_CENTER: "head_center",
    VISITOR: "visitor"
};
const $f75b8525f71fe92f$var$SUB_ROLES = {
    manager_department: "manager_department",
    assistant_manager_department: "assistant_manager_department",
    manager_phase2: "manager_phase2",
    secretariat: "secretariat",
    coordinator: "coordinator",
    assistant_coordinator: "assistant_coordinator",
    none: ""
};
const $f75b8525f71fe92f$var$SUPPORT_ROLES = {
    admin: "Modérateur",
    referent: "Référent",
    structure: "Structure",
    head_center: "Chef de Centre",
    young: "Volontaire",
    public: "Public",
    visitor: "Visiteur"
};
const $f75b8525f71fe92f$var$VISITOR_SUBROLES = {
    recteur_region: "Recteur de région académique",
    recteur: "Recteur d’académie",
    vice_recteur: "Vice-recteur d'académie",
    dasen: "Directeur académique des services de l’éducation nationale (DASEN)",
    sgra: "Secrétaire général de région académique (SGRA)",
    sga: "Secrétaire général d’académie (SGA)",
    drajes: "Délégué régional académique à la jeunesse, à l’engagement et aux sports (DRAJES)",
    other: "Autre"
};
const $f75b8525f71fe92f$var$CENTER_ROLES = {
    chef: "Chef de centre",
    adjoint: "Chef de centre adjoint",
    cadre_specialise: "Cadre spécialisé",
    cadre_compagnie: "Cadre de compagnie",
    tuteur: "Tuteur de maisonnée"
};
const $f75b8525f71fe92f$var$ROLES_LIST = Object.values($f75b8525f71fe92f$var$ROLES);
const $f75b8525f71fe92f$var$SUB_ROLES_LIST = Object.values($f75b8525f71fe92f$var$SUB_ROLES);
const $f75b8525f71fe92f$var$SUPPORT_ROLES_LIST = Object.keys($f75b8525f71fe92f$var$SUPPORT_ROLES);
const $f75b8525f71fe92f$var$VISITOR_SUB_ROLES_LIST = Object.keys($f75b8525f71fe92f$var$VISITOR_SUBROLES);
function $f75b8525f71fe92f$var$canInviteUser(actorRole, targetRole) {
    // Admins can invite any user
    if (actorRole === $f75b8525f71fe92f$var$ROLES.ADMIN) return true;
    // REFERENT_DEPARTMENT can invite REFERENT_DEPARTMENT, RESPONSIBLE, SUPERVISOR, HEAD_CENTER
    if (actorRole === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT) return [
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(targetRole);
    // REFERENT_REGION can invite REFERENT_DEPARTMENT, REFERENT_REGION, RESPONSIBLE, SUPERVISOR, HEAD_CENTER, VISITOR
    if (actorRole === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION) return [
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR,
        $f75b8525f71fe92f$var$ROLES.VISITOR
    ].includes(targetRole);
    // RESPONSIBLE and SUPERVISOR can invite only RESPONSIBLE and SUPERVISOR.
    if (actorRole === $f75b8525f71fe92f$var$ROLES.RESPONSIBLE || actorRole === $f75b8525f71fe92f$var$ROLES.SUPERVISOR) return targetRole === $f75b8525f71fe92f$var$ROLES.RESPONSIBLE || targetRole === $f75b8525f71fe92f$var$ROLES.SUPERVISOR;
    return false;
}
function $f75b8525f71fe92f$var$canDeleteStructure(actor) {
    return actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
}
function $f75b8525f71fe92f$var$canDeleteYoung(actor, target) {
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const actorAndTargetInTheSameRegion = actor.region === target.region;
    const actorAndTargetInTheSameDepartment = actor.department === target.department;
    const referentRegionFromTheSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && actorAndTargetInTheSameRegion;
    const referentDepartmentFromTheSameDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && actorAndTargetInTheSameDepartment;
    const authorized = isAdmin || referentRegionFromTheSameRegion || referentDepartmentFromTheSameDepartment;
    return authorized;
}
function $f75b8525f71fe92f$var$canEditYoung(actor, target) {
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const isHeadCenter = actor.role === $f75b8525f71fe92f$var$ROLES.HEAD_CENTER;
    const actorAndTargetInTheSameRegion = actor.region === target.region;
    const actorAndTargetInTheSameDepartment = actor.department === target.department;
    const referentRegionFromTheSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && actorAndTargetInTheSameRegion;
    const referentDepartmentFromTheSameDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && actorAndTargetInTheSameDepartment;
    const authorized = isAdmin || isHeadCenter || referentRegionFromTheSameRegion || referentDepartmentFromTheSameDepartment;
    return authorized;
}
function $f75b8525f71fe92f$var$canDeleteReferent({ actor: actor , originalTarget: originalTarget , structure: structure  }) {
    // TODO: we must handle rights more precisely.
    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    const isMe = actor._id === originalTarget._id;
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const isSupervisor = actor.role === $f75b8525f71fe92f$var$ROLES.SUPERVISOR;
    const actorAndTargetInTheSameRegion = actor.region === (originalTarget.region || structure && structure.region);
    const actorAndTargetInTheSameDepartment = actor.department === (originalTarget.department || structure && structure.department);
    const targetIsReferentRegion = originalTarget.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION;
    const targetIsReferentDepartment = originalTarget.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT;
    const targetIsSupervisor = originalTarget.role === $f75b8525f71fe92f$var$ROLES.SUPERVISOR;
    const targetIsResponsible = originalTarget.role === $f75b8525f71fe92f$var$ROLES.RESPONSIBLE;
    const targetIsVisitor = originalTarget.role === $f75b8525f71fe92f$var$ROLES.VISITOR;
    const targetIsHeadCenter = originalTarget.role === $f75b8525f71fe92f$var$ROLES.HEAD_CENTER;
    // actor is referent region
    const referentRegionFromTheSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && targetIsReferentRegion && actorAndTargetInTheSameRegion;
    const referentDepartmentFromTheSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && targetIsReferentDepartment && actorAndTargetInTheSameRegion;
    const referentResponsibleFromTheSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && targetIsResponsible && actorAndTargetInTheSameRegion;
    const responsibleFromTheSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && targetIsResponsible && actorAndTargetInTheSameRegion;
    const visitorFromTheSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && targetIsVisitor && actorAndTargetInTheSameRegion;
    const headCenterFromTheSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && targetIsHeadCenter && actorAndTargetInTheSameRegion;
    // actor is referent department
    const referentDepartmentFromTheSameDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && targetIsReferentDepartment && actorAndTargetInTheSameDepartment;
    const responsibleFromTheSameDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && targetIsResponsible && actorAndTargetInTheSameDepartment;
    const headCenterFromTheSameDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && targetIsHeadCenter && actorAndTargetInTheSameDepartment;
    // same substructure
    const responsibleFromSameStructure = (targetIsResponsible || targetIsSupervisor) && actor.structureId === originalTarget.structureId;
    const supervisorOfMainStructure = structure && isSupervisor && actor.structureId === structure.networkId;
    const authorized = isAdmin || referentRegionFromTheSameRegion || referentDepartmentFromTheSameRegion || referentResponsibleFromTheSameRegion || responsibleFromTheSameRegion || visitorFromTheSameRegion || headCenterFromTheSameRegion || referentDepartmentFromTheSameDepartment || responsibleFromTheSameDepartment || headCenterFromTheSameDepartment || responsibleFromSameStructure && !isMe || supervisorOfMainStructure;
    return authorized;
}
function $f75b8525f71fe92f$var$canViewPatchesHistory(actor) {
    const isAdminOrReferent = [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    return isAdminOrReferent;
}
function $f75b8525f71fe92f$var$canViewEmailHistory(actor) {
    const isAdminOrReferent = [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    return isAdminOrReferent;
}
function $f75b8525f71fe92f$var$canViewReferent(actor, target) {
    const isMe = actor.id === target.id;
    const isAdminOrReferent = [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    const isResponsibleModifyingResponsible = [
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role) && [
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(target.role);
    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    return isMe || isAdminOrReferent || isResponsibleModifyingResponsible;
}
function $f75b8525f71fe92f$var$canUpdateReferent({ actor: actor , originalTarget: originalTarget , modifiedTarget: modifiedTarget = null , structure: structure  }) {
    const isMe = actor.id === originalTarget.id;
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const withoutChangingRole = modifiedTarget === null || !("role" in modifiedTarget) || modifiedTarget.role === originalTarget.role;
    const isResponsibleModifyingResponsibleWithoutChangingRole = // Is responsible...
    [
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role) && // ... modifying responsible ...
    [
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(originalTarget.role) && withoutChangingRole;
    const isMeWithoutChangingRole = // Is me ...
    isMe && // ... without changing its role.
    withoutChangingRole;
    // TODO: we must handle rights more precisely.
    // See: https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
    const isReferentModifyingReferentWithoutChangingRole = // Is referent...
    [
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(actor.role) && // ... modifying referent ...
    [
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE
    ].includes(originalTarget.role) && (modifiedTarget === null || [
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE
    ].includes(modifiedTarget.role));
    const isReferentModifyingHeadCenterWithoutChangingRole = // Is referent...
    [
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(actor.role) && // ... modifying referent ...
    originalTarget.role === $f75b8525f71fe92f$var$ROLES.HEAD_CENTER && (modifiedTarget === null || [
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(modifiedTarget.role));
    const isActorAndTargetInTheSameRegion = actor.region === (originalTarget.region || structure && structure.region);
    const isActorAndTargetInTheSameDepartment = actor.department === (originalTarget.department || structure && structure.department);
    const authorized = (isMeWithoutChangingRole || isAdmin || isResponsibleModifyingResponsibleWithoutChangingRole || isReferentModifyingReferentWithoutChangingRole || isReferentModifyingHeadCenterWithoutChangingRole) && (actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION ? isActorAndTargetInTheSameRegion : true) && (actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT ? isActorAndTargetInTheSameDepartment : true);
    return authorized;
}
function $f75b8525f71fe92f$var$canViewYoungMilitaryPreparationFile(actor, target) {
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const isReferentDepartmentFromTargetDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    const isReferentRegionFromTargetRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
    return authorized;
}
function $f75b8525f71fe92f$var$canRefuseMilitaryPreparation(actor, target) {
    return $f75b8525f71fe92f$var$canViewYoungMilitaryPreparationFile(actor, target) || [
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canViewYoungFile(actor, target) {
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const isReferentDepartmentFromTargetDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    const isReferentRegionFromTargetRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
    return authorized;
}
function $f75b8525f71fe92f$var$canCreateOrUpdateCohesionCenter(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canCreateEvent(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canCreateOrUpdateSessionPhase1(actor, target) {
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const isReferent = [
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    const isHeadCenter = actor.role === $f75b8525f71fe92f$var$ROLES.HEAD_CENTER && actor.id === target.headCenterId;
    return isAdmin || isReferent || isHeadCenter;
}
function $f75b8525f71fe92f$var$canSearchSessionPhase1(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canViewSessionPhase1(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canCreateOrModifyMission(user, mission) {
    return !(user.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && user.department !== mission.department || user.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && user.region !== mission.region) && user.role !== $f75b8525f71fe92f$var$ROLES.VISITOR;
}
function $f75b8525f71fe92f$var$canCreateOrUpdateProgram(user, program) {
    const isAdminOrReferent = [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(user.role);
    return isAdminOrReferent && !(user.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && user.department !== program.department || user.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && user.region !== program.region);
}
function $f75b8525f71fe92f$var$canModifyStructure(user, structure) {
    const isAdmin = user.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const isReferentRegionFromSameRegion = user.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && user.region === structure.region;
    const isReferentDepartmentFromSameDepartment = user.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && user.department === structure.department;
    const isResponsibleModifyingOwnStructure = [
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(user.role) && structure._id.equals(user.structureId);
    const isSupervisorModifyingChild = user.role === $f75b8525f71fe92f$var$ROLES.SUPERVISOR && user.structureId === structure.networkId;
    return isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment || isResponsibleModifyingOwnStructure || isSupervisorModifyingChild;
}
function $f75b8525f71fe92f$var$canCreateStructure(user) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(user.role);
}
function $f75b8525f71fe92f$var$isReferentOrAdmin(user) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(user.role);
}
function $f75b8525f71fe92f$var$isAdmin(user) {
    return $f75b8525f71fe92f$var$ROLES.ADMIN === user.role;
}
const $f75b8525f71fe92f$var$FORCE_DISABLED_ASSIGN_COHESION_CENTER = false;
const $f75b8525f71fe92f$var$canAssignCohesionCenter = (user)=>!$f75b8525f71fe92f$var$FORCE_DISABLED_ASSIGN_COHESION_CENTER && $f75b8525f71fe92f$var$isAdmin(user)
;
const $f75b8525f71fe92f$var$FORCE_DISABLED_ASSIGN_MEETING_POINT = false;
const $f75b8525f71fe92f$var$canAssignMeetingPoint = (user)=>!$f75b8525f71fe92f$var$FORCE_DISABLED_ASSIGN_MEETING_POINT && $f75b8525f71fe92f$var$isReferentOrAdmin(user)
;
const $f75b8525f71fe92f$var$canEditPresenceYoung = (actor)=>{
    // todo affiner les droits
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
};
const $f75b8525f71fe92f$var$canSigninAs = (actor, target)=>{
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const isReferentRegionFromSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const isReferentDepartmentFromSameDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    return target.constructor.modelName === "referent" && isAdmin || target.constructor.modelName === "young" && (isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment);
};
const $f75b8525f71fe92f$var$canSendFileByMail = (actor, target)=>{
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const isReferentRegionFromSameRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const isReferentDepartmentFromSameDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    return isAdmin || isReferentRegionFromSameRegion || isReferentDepartmentFromSameDepartment;
};
function $f75b8525f71fe92f$var$canSearchAssociation(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canViewCohesionCenter(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canGetReferentByEmail(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canViewMeetingPoints(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canSearchMeetingPoints(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canUpdateInscriptionGoals(actor) {
    return actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
}
function $f75b8525f71fe92f$var$canViewInscriptionGoals(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER,
        $f75b8525f71fe92f$var$ROLES.VISITOR
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canViewTicketTags(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canGetYoungByEmail(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canViewYoung(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canViewBus(actor) {
    return actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
}
function $f75b8525f71fe92f$var$canViewMission(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canViewStructures(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canModifyMissionStructureId(actor) {
    return actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
}
function $f75b8525f71fe92f$var$canViewStructureChildren(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canDownloadYoungDocuments(actor, target) {
    return $f75b8525f71fe92f$var$canEditYoung(actor, target);
}
function $f75b8525f71fe92f$var$canInviteYoung(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canSendTemplateToYoung(actor, target) {
    return $f75b8525f71fe92f$var$canEditYoung(actor, target);
}
function $f75b8525f71fe92f$var$canViewYoungApplications(actor, target) {
    return $f75b8525f71fe92f$var$canEditYoung(actor, target) || [
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canCreateYoungApplication(actor, target) {
    return $f75b8525f71fe92f$var$canEditYoung(actor, target) || [
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canCreateOrUpdateContract(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canViewContract(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canCreateOrUpdateDepartmentService(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canChangeYoungCohort(actor, target) {
    const isAdmin = actor.role === $f75b8525f71fe92f$var$ROLES.ADMIN;
    const isReferentDepartmentFromTargetDepartment = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT && actor.department === target.department;
    const isReferentRegionFromTargetRegion = actor.role === $f75b8525f71fe92f$var$ROLES.REFERENT_REGION && actor.region === target.region;
    const authorized = isAdmin || isReferentDepartmentFromTargetDepartment || isReferentRegionFromTargetRegion;
    return authorized;
}
function $f75b8525f71fe92f$var$canViewDepartmentService(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
}
function $f75b8525f71fe92f$var$canSearchInElasticSearch(actor, index) {
    if (index === "mission") return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
    else if (index === "school") return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
    else if (index === "young-having-school-in-department") return [
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
    else if (index === "young-having-school-in-region") return [
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION
    ].includes(actor.role);
    else if (index === "cohesionyoung") return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
    else if (index === "sessionphase1young") return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
    else if (index === "structure") return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
    else if (index === "referent") return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR,
        $f75b8525f71fe92f$var$ROLES.HEAD_CENTER
    ].includes(actor.role);
    else if (index === "application") return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
    else if (index === "cohesioncenter") return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
    else if (index === "team") return [
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT
    ].includes(actor.role);
    return false;
}
function $f75b8525f71fe92f$var$canSendTutorTemplate(actor) {
    return [
        $f75b8525f71fe92f$var$ROLES.ADMIN,
        $f75b8525f71fe92f$var$ROLES.REFERENT_REGION,
        $f75b8525f71fe92f$var$ROLES.REFERENT_DEPARTMENT,
        $f75b8525f71fe92f$var$ROLES.RESPONSIBLE,
        $f75b8525f71fe92f$var$ROLES.SUPERVISOR
    ].includes(actor.role);
}
$f75b8525f71fe92f$exports = {
    ROLES: $f75b8525f71fe92f$var$ROLES,
    SUB_ROLES: $f75b8525f71fe92f$var$SUB_ROLES,
    ROLES_LIST: $f75b8525f71fe92f$var$ROLES_LIST,
    SUB_ROLES_LIST: $f75b8525f71fe92f$var$SUB_ROLES_LIST,
    SUPPORT_ROLES: $f75b8525f71fe92f$var$SUPPORT_ROLES,
    SUPPORT_ROLES_LIST: $f75b8525f71fe92f$var$SUPPORT_ROLES_LIST,
    VISITOR_SUBROLES: $f75b8525f71fe92f$var$VISITOR_SUBROLES,
    VISITOR_SUB_ROLES_LIST: $f75b8525f71fe92f$var$VISITOR_SUB_ROLES_LIST,
    CENTER_ROLES: $f75b8525f71fe92f$var$CENTER_ROLES,
    canInviteUser: $f75b8525f71fe92f$var$canInviteUser,
    canDeleteYoung: $f75b8525f71fe92f$var$canDeleteYoung,
    canEditYoung: $f75b8525f71fe92f$var$canEditYoung,
    canDownloadYoungDocuments: $f75b8525f71fe92f$var$canDownloadYoungDocuments,
    canDeleteReferent: $f75b8525f71fe92f$var$canDeleteReferent,
    canViewPatchesHistory: $f75b8525f71fe92f$var$canViewPatchesHistory,
    canViewEmailHistory: $f75b8525f71fe92f$var$canViewEmailHistory,
    canViewReferent: $f75b8525f71fe92f$var$canViewReferent,
    canUpdateReferent: $f75b8525f71fe92f$var$canUpdateReferent,
    canViewYoungMilitaryPreparationFile: $f75b8525f71fe92f$var$canViewYoungMilitaryPreparationFile,
    canCreateOrUpdateCohesionCenter: $f75b8525f71fe92f$var$canCreateOrUpdateCohesionCenter,
    canCreateOrUpdateSessionPhase1: $f75b8525f71fe92f$var$canCreateOrUpdateSessionPhase1,
    canViewSessionPhase1: $f75b8525f71fe92f$var$canViewSessionPhase1,
    canCreateOrModifyMission: $f75b8525f71fe92f$var$canCreateOrModifyMission,
    canCreateOrUpdateProgram: $f75b8525f71fe92f$var$canCreateOrUpdateProgram,
    canInviteYoung: $f75b8525f71fe92f$var$canInviteYoung,
    isReferentOrAdmin: $f75b8525f71fe92f$var$isReferentOrAdmin,
    FORCE_DISABLED_ASSIGN_COHESION_CENTER: $f75b8525f71fe92f$var$FORCE_DISABLED_ASSIGN_COHESION_CENTER,
    FORCE_DISABLED_ASSIGN_MEETING_POINT: $f75b8525f71fe92f$var$FORCE_DISABLED_ASSIGN_MEETING_POINT,
    canAssignCohesionCenter: $f75b8525f71fe92f$var$canAssignCohesionCenter,
    canAssignMeetingPoint: $f75b8525f71fe92f$var$canAssignMeetingPoint,
    canModifyStructure: $f75b8525f71fe92f$var$canModifyStructure,
    canDeleteStructure: $f75b8525f71fe92f$var$canDeleteStructure,
    canSigninAs: $f75b8525f71fe92f$var$canSigninAs,
    canSendFileByMail: $f75b8525f71fe92f$var$canSendFileByMail,
    canCreateEvent: $f75b8525f71fe92f$var$canCreateEvent,
    canSearchAssociation: $f75b8525f71fe92f$var$canSearchAssociation,
    canCreateStructure: $f75b8525f71fe92f$var$canCreateStructure,
    canViewCohesionCenter: $f75b8525f71fe92f$var$canViewCohesionCenter,
    canSearchSessionPhase1: $f75b8525f71fe92f$var$canSearchSessionPhase1,
    canGetReferentByEmail: $f75b8525f71fe92f$var$canGetReferentByEmail,
    canViewMeetingPoints: $f75b8525f71fe92f$var$canViewMeetingPoints,
    canSearchMeetingPoints: $f75b8525f71fe92f$var$canSearchMeetingPoints,
    canUpdateInscriptionGoals: $f75b8525f71fe92f$var$canUpdateInscriptionGoals,
    canViewInscriptionGoals: $f75b8525f71fe92f$var$canViewInscriptionGoals,
    canViewTicketTags: $f75b8525f71fe92f$var$canViewTicketTags,
    canGetYoungByEmail: $f75b8525f71fe92f$var$canGetYoungByEmail,
    canViewYoung: $f75b8525f71fe92f$var$canViewYoung,
    canViewYoungFile: $f75b8525f71fe92f$var$canViewYoungFile,
    canViewBus: $f75b8525f71fe92f$var$canViewBus,
    canViewMission: $f75b8525f71fe92f$var$canViewMission,
    canViewStructures: $f75b8525f71fe92f$var$canViewStructures,
    canModifyMissionStructureId: $f75b8525f71fe92f$var$canModifyMissionStructureId,
    canViewStructureChildren: $f75b8525f71fe92f$var$canViewStructureChildren,
    canSendTemplateToYoung: $f75b8525f71fe92f$var$canSendTemplateToYoung,
    canViewYoungApplications: $f75b8525f71fe92f$var$canViewYoungApplications,
    canCreateYoungApplication: $f75b8525f71fe92f$var$canCreateYoungApplication,
    canCreateOrUpdateContract: $f75b8525f71fe92f$var$canCreateOrUpdateContract,
    canViewContract: $f75b8525f71fe92f$var$canViewContract,
    canCreateOrUpdateDepartmentService: $f75b8525f71fe92f$var$canCreateOrUpdateDepartmentService,
    canViewDepartmentService: $f75b8525f71fe92f$var$canViewDepartmentService,
    canSearchInElasticSearch: $f75b8525f71fe92f$var$canSearchInElasticSearch,
    canRefuseMilitaryPreparation: $f75b8525f71fe92f$var$canRefuseMilitaryPreparation,
    canChangeYoungCohort: $f75b8525f71fe92f$var$canChangeYoungCohort,
    canSendTutorTemplate: $f75b8525f71fe92f$var$canSendTutorTemplate,
    canEditPresenceYoung: $f75b8525f71fe92f$var$canEditPresenceYoung
};


var $be6f0e84320366a7$require$ROLES = $f75b8525f71fe92f$exports.ROLES;
var $be6f0e84320366a7$require$SUB_ROLES = $f75b8525f71fe92f$exports.SUB_ROLES;
const $be6f0e84320366a7$var$YOUNG_STATUS = {
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
const $be6f0e84320366a7$var$YOUNG_STATUS_PHASE1 = {
    WAITING_AFFECTATION: "WAITING_AFFECTATION",
    AFFECTED: "AFFECTED",
    EXEMPTED: "EXEMPTED",
    DONE: "DONE",
    NOT_DONE: "NOT_DONE",
    WITHDRAWN: "WITHDRAWN",
    WAITING_LIST: "WAITING_LIST"
};
const $be6f0e84320366a7$var$YOUNG_STATUS_PHASE1_MOTIF = {
    ILLNESS: "ILLNESS",
    DEATH: "DEATH",
    ADMINISTRATION_CANCEL: "ADMINISTRATION_CANCEL",
    OTHER: "OTHER"
};
const $be6f0e84320366a7$var$YOUNG_STATUS_PHASE2 = {
    WAITING_REALISATION: "WAITING_REALISATION",
    IN_PROGRESS: "IN_PROGRESS",
    VALIDATED: "VALIDATED",
    WITHDRAWN: "WITHDRAWN"
};
const $be6f0e84320366a7$var$CONTRACT_STATUS = {
    DRAFT: "DRAFT",
    SENT: "SENT",
    VALIDATED: "VALIDATED"
};
const $be6f0e84320366a7$var$YOUNG_STATUS_PHASE3 = {
    WAITING_REALISATION: "WAITING_REALISATION",
    WAITING_VALIDATION: "WAITING_VALIDATION",
    VALIDATED: "VALIDATED",
    WITHDRAWN: "WITHDRAWN"
};
const $be6f0e84320366a7$var$YOUNG_PHASE = {
    INSCRIPTION: "INSCRIPTION",
    COHESION_STAY: "COHESION_STAY",
    INTEREST_MISSION: "INTEREST_MISSION",
    CONTINUE: "CONTINUE"
};
const $be6f0e84320366a7$var$PHASE_STATUS = {
    IN_PROGRESS: "IN_PROGRESS",
    IN_COMING: "IN_COMING",
    VALIDATED: "VALIDATED",
    CANCEL: "CANCEL",
    WAITING_AFFECTATION: "WAITING_AFFECTATION"
};
const $be6f0e84320366a7$var$SESSION_STATUS = {
    VALIDATED: "VALIDATED",
    DRAFT: "DRAFT"
};
const $be6f0e84320366a7$var$APPLICATION_STATUS = {
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
const $be6f0e84320366a7$var$PROFESSIONNAL_PROJECT = {
    UNIFORM: "UNIFORM",
    OTHER: "OTHER",
    UNKNOWN: "UNKNOWN"
};
const $be6f0e84320366a7$var$PROFESSIONNAL_PROJECT_PRECISION = {
    FIREFIGHTER: "FIREFIGHTER",
    POLICE: "POLICE",
    ARMY: "ARMY"
};
const $be6f0e84320366a7$var$MISSION_DOMAINS = {
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
const $be6f0e84320366a7$var$YOUNG_SITUATIONS = {
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
const $be6f0e84320366a7$var$FORMAT = {
    CONTINUOUS: "CONTINUOUS",
    DISCONTINUOUS: "DISCONTINUOUS",
    AUTONOMOUS: "AUTONOMOUS"
};
const $be6f0e84320366a7$var$REFERENT_ROLES = $be6f0e84320366a7$require$ROLES;
const $be6f0e84320366a7$var$REFERENT_DEPARTMENT_SUBROLE = {
    manager_department: $be6f0e84320366a7$require$SUB_ROLES.manager_department,
    assistant_manager_department: $be6f0e84320366a7$require$SUB_ROLES.assistant_manager_department,
    manager_phase2: $be6f0e84320366a7$require$SUB_ROLES.manager_phase2,
    secretariat: $be6f0e84320366a7$require$SUB_ROLES.secretariat
};
const $be6f0e84320366a7$var$REFERENT_REGION_SUBROLE = {
    coordinator: $be6f0e84320366a7$require$SUB_ROLES.coordinator,
    assistant_coordinator: $be6f0e84320366a7$require$SUB_ROLES.assistant_coordinator,
    manager_phase2: $be6f0e84320366a7$require$SUB_ROLES.manager_phase2
};
const $be6f0e84320366a7$var$MISSION_STATUS = {
    WAITING_VALIDATION: "WAITING_VALIDATION",
    WAITING_CORRECTION: "WAITING_CORRECTION",
    VALIDATED: "VALIDATED",
    DRAFT: "DRAFT",
    REFUSED: "REFUSED",
    CANCEL: "CANCEL",
    ARCHIVED: "ARCHIVED"
};
const $be6f0e84320366a7$var$PERIOD = {
    DURING_HOLIDAYS: "DURING_HOLIDAYS",
    DURING_SCHOOL: "DURING_SCHOOL"
};
const $be6f0e84320366a7$var$TRANSPORT = {
    PUBLIC_TRANSPORT: "PUBLIC_TRANSPORT",
    BIKE: "BIKE",
    MOTOR: "MOTOR",
    CARPOOLING: "CARPOOLING",
    OTHER: "OTHER"
};
const $be6f0e84320366a7$var$MISSION_PERIOD_DURING_HOLIDAYS = {
    SUMMER: "SUMMER",
    AUTUMN: "AUTUMN",
    DECEMBER: "DECEMBER",
    WINTER: "WINTER",
    SPRING: "SPRING"
};
const $be6f0e84320366a7$var$MISSION_PERIOD_DURING_SCHOOL = {
    EVENING: "EVENING",
    END_DAY: "END_DAY",
    WEEKEND: "WEEKEND"
};
const $be6f0e84320366a7$var$STRUCTURE_STATUS = {
    WAITING_VALIDATION: "WAITING_VALIDATION",
    WAITING_CORRECTION: "WAITING_CORRECTION",
    VALIDATED: "VALIDATED",
    DRAFT: "DRAFT"
};
const $be6f0e84320366a7$var$DEFAULT_STRUCTURE_NAME = "Ma nouvelle Structure";
const $be6f0e84320366a7$var$COHORTS = [
    "2019",
    "2020",
    "2021",
    "2022",
    "Février 2022",
    "Juin 2022",
    "Juillet 2022"
];
const $be6f0e84320366a7$var$INTEREST_MISSION_LIMIT_DATE = {
    2019: "23 mars 2021",
    2020: "31 décembre 2021",
    2021: "30 juin 2022"
};
const $be6f0e84320366a7$var$ES_NO_LIMIT = 10_000;
const $be6f0e84320366a7$var$SENDINBLUE_TEMPLATES = {
    FORGOT_PASSWORD: "157",
    invitationReferent: {
        [$be6f0e84320366a7$require$ROLES.REFERENT_DEPARTMENT]: "158",
        [$be6f0e84320366a7$require$ROLES.REFERENT_REGION]: "159",
        [$be6f0e84320366a7$require$ROLES.RESPONSIBLE]: "160",
        [$be6f0e84320366a7$require$ROLES.SUPERVISOR]: "160",
        [$be6f0e84320366a7$require$ROLES.ADMIN]: "161",
        [$be6f0e84320366a7$require$ROLES.HEAD_CENTER]: "162",
        [$be6f0e84320366a7$require$ROLES.VISITOR]: "286",
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
const $be6f0e84320366a7$var$ZAMMAD_GROUP = {
    YOUNG: "Jeunes",
    VOLONTAIRE: "Volontaires",
    REFERENT: "Référents",
    STRUCTURE: "Structures",
    CONTACT: "Contact",
    ADMIN: "Admin",
    VISITOR: "Visiteurs",
    HEAD_CENTER: "Chefs de centre"
};
const $be6f0e84320366a7$var$WITHRAWN_REASONS = [
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
const $be6f0e84320366a7$var$COHESION_STAY_LIMIT_DATE = {
    2019: "du 16 au 28 juin 2019",
    2020: "du 21 juin au 2 juillet 2021",
    2021: "du 21 juin au 2 juillet 2021",
    "Février 2022": "du 13 au 25 Février 2022",
    "Juin 2022": "du 12 au 24 Juin 2022",
    "Juillet 2022": "du 3 au 15 Juillet 2022"
};
const $be6f0e84320366a7$var$COHESION_STAY_START = {
    2019: new Date("06/16/2019"),
    2020: new Date("06/21/2021"),
    2021: new Date("06/21/2021"),
    "Février 2022": new Date("02/13/2022"),
    "Juin 2022": new Date("06/12/2022"),
    "Juillet 2022": new Date("07/03/2022")
};
const $be6f0e84320366a7$var$COHESION_STAY_END = {
    2019: new Date("06/28/2019"),
    2020: new Date("07/02/2021"),
    2021: new Date("07/02/2021"),
    "Février 2022": new Date("02/25/2022"),
    "Juin 2022": new Date("06/24/2022"),
    "Juillet 2022": new Date("07/15/2022")
};
const $be6f0e84320366a7$var$PHASE1_HEADCENTER_ACCESS_LIMIT = {
    "Février 2022": new Date("05/25/2022"),
    "Juin 2022": new Date("09/24/2022"),
    "Juillet 2022": new Date("10/15/2022")
};
const $be6f0e84320366a7$var$PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE = {
    "Février 2022": new Date("02/13/2022"),
    "Juin 2022": new Date("06/12/2022"),
    "Juillet 2022": new Date("07/03/2022"),
    2021: new Date("01/01/2021")
};
const $be6f0e84320366a7$var$START_DATE_SESSION_PHASE1 = {
    "Février 2022": new Date("03/13/2022"),
    "Juin 2022": new Date("06/12/2022"),
    "Juillet 2022": new Date("07/03/2022")
};
const $be6f0e84320366a7$var$CONSENTMENT_TEXTS = {
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
const $be6f0e84320366a7$var$FILE_STATUS_PHASE1 = {
    TO_UPLOAD: "TO_UPLOAD",
    WAITING_VERIFICATION: "WAITING_VERIFICATION",
    WAITING_CORRECTION: "WAITING_CORRECTION",
    VALIDATED: "VALIDATED"
};
$be6f0e84320366a7$exports = {
    YOUNG_STATUS: $be6f0e84320366a7$var$YOUNG_STATUS,
    YOUNG_STATUS_PHASE1: $be6f0e84320366a7$var$YOUNG_STATUS_PHASE1,
    YOUNG_STATUS_PHASE1_MOTIF: $be6f0e84320366a7$var$YOUNG_STATUS_PHASE1_MOTIF,
    YOUNG_STATUS_PHASE2: $be6f0e84320366a7$var$YOUNG_STATUS_PHASE2,
    CONTRACT_STATUS: $be6f0e84320366a7$var$CONTRACT_STATUS,
    YOUNG_STATUS_PHASE3: $be6f0e84320366a7$var$YOUNG_STATUS_PHASE3,
    YOUNG_PHASE: $be6f0e84320366a7$var$YOUNG_PHASE,
    PHASE_STATUS: $be6f0e84320366a7$var$PHASE_STATUS,
    SESSION_STATUS: $be6f0e84320366a7$var$SESSION_STATUS,
    APPLICATION_STATUS: $be6f0e84320366a7$var$APPLICATION_STATUS,
    PROFESSIONNAL_PROJECT: $be6f0e84320366a7$var$PROFESSIONNAL_PROJECT,
    PROFESSIONNAL_PROJECT_PRECISION: $be6f0e84320366a7$var$PROFESSIONNAL_PROJECT_PRECISION,
    MISSION_DOMAINS: $be6f0e84320366a7$var$MISSION_DOMAINS,
    YOUNG_SITUATIONS: $be6f0e84320366a7$var$YOUNG_SITUATIONS,
    FORMAT: $be6f0e84320366a7$var$FORMAT,
    ROLES: $be6f0e84320366a7$require$ROLES,
    REFERENT_ROLES: $be6f0e84320366a7$var$REFERENT_ROLES,
    REFERENT_DEPARTMENT_SUBROLE: $be6f0e84320366a7$var$REFERENT_DEPARTMENT_SUBROLE,
    REFERENT_REGION_SUBROLE: $be6f0e84320366a7$var$REFERENT_REGION_SUBROLE,
    MISSION_STATUS: $be6f0e84320366a7$var$MISSION_STATUS,
    PERIOD: $be6f0e84320366a7$var$PERIOD,
    TRANSPORT: $be6f0e84320366a7$var$TRANSPORT,
    MISSION_PERIOD_DURING_HOLIDAYS: $be6f0e84320366a7$var$MISSION_PERIOD_DURING_HOLIDAYS,
    MISSION_PERIOD_DURING_SCHOOL: $be6f0e84320366a7$var$MISSION_PERIOD_DURING_SCHOOL,
    STRUCTURE_STATUS: $be6f0e84320366a7$var$STRUCTURE_STATUS,
    DEFAULT_STRUCTURE_NAME: $be6f0e84320366a7$var$DEFAULT_STRUCTURE_NAME,
    COHESION_STAY_LIMIT_DATE: $be6f0e84320366a7$var$COHESION_STAY_LIMIT_DATE,
    INTEREST_MISSION_LIMIT_DATE: $be6f0e84320366a7$var$INTEREST_MISSION_LIMIT_DATE,
    ES_NO_LIMIT: $be6f0e84320366a7$var$ES_NO_LIMIT,
    SENDINBLUE_TEMPLATES: $be6f0e84320366a7$var$SENDINBLUE_TEMPLATES,
    ZAMMAD_GROUP: $be6f0e84320366a7$var$ZAMMAD_GROUP,
    WITHRAWN_REASONS: $be6f0e84320366a7$var$WITHRAWN_REASONS,
    CONSENTMENT_TEXTS: $be6f0e84320366a7$var$CONSENTMENT_TEXTS,
    COHORTS: $be6f0e84320366a7$var$COHORTS,
    PHASE1_HEADCENTER_ACCESS_LIMIT: $be6f0e84320366a7$var$PHASE1_HEADCENTER_ACCESS_LIMIT,
    PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE: $be6f0e84320366a7$var$PHASE1_HEADCENTER_OPEN_ACCESS_CHECK_PRESENCE,
    START_DATE_SESSION_PHASE1: $be6f0e84320366a7$var$START_DATE_SESSION_PHASE1,
    COHESION_STAY_START: $be6f0e84320366a7$var$COHESION_STAY_START,
    COHESION_STAY_END: $be6f0e84320366a7$var$COHESION_STAY_END,
    FILE_STATUS_PHASE1: $be6f0e84320366a7$var$FILE_STATUS_PHASE1
};


var $901a5ac8d7be8883$exports = {};
/* eslint-disable no-undef */ function $901a5ac8d7be8883$var$download(file, fileName) {
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
$901a5ac8d7be8883$exports = {
    download: $901a5ac8d7be8883$var$download
};


var $91b908f7b5aa0fce$exports = {};
const $91b908f7b5aa0fce$var$translate = (value)=>{
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
const $91b908f7b5aa0fce$var$translateState = (state)=>{
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
const $91b908f7b5aa0fce$var$translateCohort = (cohort)=>{
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
const $91b908f7b5aa0fce$var$translateSessionStatus = (statut)=>{
    switch(statut){
        case "VALIDATED":
            return "Validé";
        case "DRAFT":
            return "Brouillon";
        default:
            return statut;
    }
};
const $91b908f7b5aa0fce$var$translatePhase1 = (phase1)=>{
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
const $91b908f7b5aa0fce$var$translatePhase2 = (phase2)=>{
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
const $91b908f7b5aa0fce$var$translateApplication = (candidature)=>{
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
const $91b908f7b5aa0fce$var$translateEngagement = (engagement)=>{
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
const $91b908f7b5aa0fce$var$translateFileStatusPhase1 = (status)=>{
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
$91b908f7b5aa0fce$exports = {
    translate: $91b908f7b5aa0fce$var$translate,
    translateState: $91b908f7b5aa0fce$var$translateState,
    translateCohort: $91b908f7b5aa0fce$var$translateCohort,
    translateSessionStatus: $91b908f7b5aa0fce$var$translateSessionStatus,
    translatePhase1: $91b908f7b5aa0fce$var$translatePhase1,
    translatePhase2: $91b908f7b5aa0fce$var$translatePhase2,
    translateApplication: $91b908f7b5aa0fce$var$translateApplication,
    translateEngagement: $91b908f7b5aa0fce$var$translateEngagement,
    translateFileStatusPhase1: $91b908f7b5aa0fce$var$translateFileStatusPhase1
};


var $41bb6c866aa5d546$exports = {};
const $41bb6c866aa5d546$var$putLocation = async (city, zip)=>{
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
const $41bb6c866aa5d546$var$departmentLookUp = {
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
const $41bb6c866aa5d546$var$departmentList = Object.values($41bb6c866aa5d546$var$departmentLookUp);
const $41bb6c866aa5d546$var$getDepartmentNumber = (d)=>Object.keys($41bb6c866aa5d546$var$departmentLookUp).find((key)=>$41bb6c866aa5d546$var$departmentLookUp[key] === d
    )
;
const $41bb6c866aa5d546$var$getDepartmentByZip = (zip)=>{
    if (!zip) return;
    if (zip.length !== 5) return;
    const departmentCode = zip.substr(0, 2);
    return $41bb6c866aa5d546$var$departmentLookUp[departmentCode];
};
const $41bb6c866aa5d546$var$getRegionByZip = (zip)=>{
    if (!zip) return;
    if (zip.length !== 5) return;
    const departmentCode = zip.substr(0, 2);
    const department = $41bb6c866aa5d546$var$departmentLookUp[departmentCode];
    return $41bb6c866aa5d546$var$department2region[department];
};
const $41bb6c866aa5d546$var$regionList = [
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
const $41bb6c866aa5d546$var$department2region = {
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
const $41bb6c866aa5d546$var$region2department = {
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
$41bb6c866aa5d546$exports = {
    departmentLookUp: $41bb6c866aa5d546$var$departmentLookUp,
    departmentList: $41bb6c866aa5d546$var$departmentList,
    getDepartmentNumber: $41bb6c866aa5d546$var$getDepartmentNumber,
    regionList: $41bb6c866aa5d546$var$regionList,
    department2region: $41bb6c866aa5d546$var$department2region,
    region2department: $41bb6c866aa5d546$var$region2department,
    putLocation: $41bb6c866aa5d546$var$putLocation,
    getDepartmentByZip: $41bb6c866aa5d546$var$getDepartmentByZip,
    getRegionByZip: $41bb6c866aa5d546$var$getRegionByZip
};


var $a1f0d55c1041172b$exports = {};
const $a1f0d55c1041172b$var$departmentToAcademy = {
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
const $a1f0d55c1041172b$var$academyToDepartments = {
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
const $a1f0d55c1041172b$var$academyList = [
    ...new Set(Object.values($a1f0d55c1041172b$var$departmentToAcademy))
];
$a1f0d55c1041172b$exports = {
    departmentToAcademy: $a1f0d55c1041172b$var$departmentToAcademy,
    academyList: $a1f0d55c1041172b$var$academyList,
    academyToDepartments: $a1f0d55c1041172b$var$academyToDepartments
};



var $8db084a05e52a2e3$exports = {};
const $8db084a05e52a2e3$var$ticketStates = {
    1: "new",
    2: "open",
    3: "pending reminder",
    4: "closed",
    7: "pending closure"
};
const $8db084a05e52a2e3$var$ticketStateNameById = (id)=>$8db084a05e52a2e3$var$ticketStates[id]
;
const $8db084a05e52a2e3$var$ticketStateIdByName = (name)=>{
    return Number(Object.keys($8db084a05e52a2e3$var$ticketStates).reduce((ret, key)=>{
        ret[$8db084a05e52a2e3$var$ticketStates[key]] = key;
        return ret;
    }, {})[name]);
};
const $8db084a05e52a2e3$var$totalOpenedTickets = (tickets)=>{
    return (tickets || []).filter((ticket)=>(ticket || {}).status.toLowerCase() === "open"
    ).length;
};
const $8db084a05e52a2e3$var$totalNewTickets = (tickets)=>{
    return (tickets || []).filter((ticket)=>(ticket || {}).status.toLowerCase() === "new"
    ).length;
};
const $8db084a05e52a2e3$var$totalClosedTickets = (tickets)=>{
    return (tickets || []).filter((ticket)=>(ticket || {}).status.toLowerCase() === "closed"
    ).length;
};
$8db084a05e52a2e3$exports = {
    ticketStateIdByName: $8db084a05e52a2e3$var$ticketStateIdByName,
    totalOpenedTickets: $8db084a05e52a2e3$var$totalOpenedTickets,
    totalNewTickets: $8db084a05e52a2e3$var$totalNewTickets,
    totalClosedTickets: $8db084a05e52a2e3$var$totalClosedTickets,
    ticketStateNameById: $8db084a05e52a2e3$var$ticketStateNameById
};



var $4fa36e821943b400$require$YOUNG_STATUS_PHASE1 = $be6f0e84320366a7$exports.YOUNG_STATUS_PHASE1;
var $4fa36e821943b400$require$COHESION_STAY_START = $be6f0e84320366a7$exports.COHESION_STAY_START;
const $4fa36e821943b400$var$isInRuralArea = (v)=>{
    if (!v.populationDensity) return null;
    return [
        "PEU DENSE",
        "TRES PEU DENSE"
    ].includes(v.populationDensity) ? "true" : "false";
};
console.log("hahaha");
// See: https://trello.com/c/JBS3Jn8I/576-inscription-impact-fin-instruction-dossiers-au-6-mai
function $4fa36e821943b400$var$isEndOfInscriptionManagement2021() {
    return new Date() > new Date(2021, 4, 7); // greater than 7 mai 2021 morning
}
function $4fa36e821943b400$var$inscriptionModificationOpenForYoungs(cohort) {
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
function $4fa36e821943b400$var$inscriptionCreationOpenForYoungs(cohort) {
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
const $4fa36e821943b400$var$getFilterLabel = (selected, placeholder = "Choisissez un filtre", prelabel = "")=>{
    if (Object.keys(selected).length === 0) return placeholder;
    const translator = (item)=>{
        if (prelabel === "Statut phase 2") return $91b908f7b5aa0fce$exports.translatePhase2(item);
        else if (prelabel === "Statut phase 1") return $91b908f7b5aa0fce$exports.translatePhase1(item);
        else if (prelabel === "Statut mission (candidature)") return $91b908f7b5aa0fce$exports.translateApplication(item);
        else if (prelabel === "Statut contrats") return $91b908f7b5aa0fce$exports.translateEngagement(item);
        else return $91b908f7b5aa0fce$exports.translate(item);
    };
    const translated = Object.keys(selected).map((item)=>{
        return translator(item);
    });
    let value = translated.join(", ");
    if (prelabel) value = prelabel + " : " + value;
    return value;
};
const $4fa36e821943b400$var$getResultLabel = (e, pageSize)=>`${pageSize * e.currentPage + 1}-${pageSize * e.currentPage + e.displayedResults} sur ${e.numberOfResults}`
;
const $4fa36e821943b400$var$getLabelWithdrawnReason = (value)=>$be6f0e84320366a7$exports.WITHRAWN_REASONS.find((e)=>e.value === value
    )?.label || value
;
function $4fa36e821943b400$var$canUpdateYoungStatus({ body: body , current: current  }) {
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
const $4fa36e821943b400$var$youngCanChangeSession = ({ cohort: cohort , status: status  })=>{
    if ([
        $4fa36e821943b400$require$YOUNG_STATUS_PHASE1.AFFECTED,
        $4fa36e821943b400$require$YOUNG_STATUS_PHASE1.NOTDONE,
        $4fa36e821943b400$require$YOUNG_STATUS_PHASE1.WAITING_AFFECTATION
    ].includes(status)) {
        const now = Date.now();
        const limit = new Date($4fa36e821943b400$require$COHESION_STAY_START[cohort]);
        limit.setDate(limit.getDate() + 1);
        if (now < limit) return true;
    }
    return false;
};
const $4fa36e821943b400$var$formatPhoneNumberFR = (tel)=>{
    if (!tel) return "";
    const regex = /^((?:(?:\+|00)33|0)\s*[1-9])((?:[\s.-]*\d{2}){4})$/;
    const global = tel.match(regex);
    if (global?.length !== 3) return tel;
    const rest = global[2].match(/.{1,2}/g);
    const formatted = `${global[1]} ${rest.join(" ")}`;
    return formatted;
};
module.exports = {
    isEndOfInscriptionManagement2021: $4fa36e821943b400$var$isEndOfInscriptionManagement2021,
    inscriptionModificationOpenForYoungs: $4fa36e821943b400$var$inscriptionModificationOpenForYoungs,
    inscriptionCreationOpenForYoungs: $4fa36e821943b400$var$inscriptionCreationOpenForYoungs,
    isInRuralArea: $4fa36e821943b400$var$isInRuralArea,
    getFilterLabel: $4fa36e821943b400$var$getFilterLabel,
    getResultLabel: $4fa36e821943b400$var$getResultLabel,
    getLabelWithdrawnReason: $4fa36e821943b400$var$getLabelWithdrawnReason,
    canUpdateYoungStatus: $4fa36e821943b400$var$canUpdateYoungStatus,
    youngCanChangeSession: $4fa36e821943b400$var$youngCanChangeSession,
    formatPhoneNumberFR: $4fa36e821943b400$var$formatPhoneNumberFR,
    ...$7d4f411db05a06b1$exports,
    ...$41bb6c866aa5d546$exports,
    ...$a1f0d55c1041172b$exports,
    ...$d33dec175518dfc8$exports,
    ...$be6f0e84320366a7$exports,
    ...$901a5ac8d7be8883$exports,
    ...$f75b8525f71fe92f$exports,
    ...$8db084a05e52a2e3$exports,
    ...$91b908f7b5aa0fce$exports
};


//# sourceMappingURL=main.js.map
