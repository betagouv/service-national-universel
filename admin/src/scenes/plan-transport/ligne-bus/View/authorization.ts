import { canEditLigneBusCenter, canEditLigneBusPointDeRassemblement, CohortType, isAdmin, isBusEditionOpen, ROLES, UserDto } from "snu-lib";

export function canUpdatePdrId(user: UserDto): { isAuthorized: boolean; message: string } {
  if (!canEditLigneBusPointDeRassemblement(user)) {
    return { isAuthorized: false, message: "Vous n'avez pas l'autorisation de modifier le point de rassemblement." };
  }
  return { isAuthorized: true, message: "" };
}

export function canUpdatePdrScheduleAndTransportType(user: UserDto, cohort?: CohortType | null): { isAuthorized: boolean; message: string } {
  if (!cohort) return { isAuthorized: false, message: "Impossible de récupérer les informations de la cohorte" };
  if (user.role === ROLES.TRANSPORTER) {
    if (isBusEditionOpen(user, cohort)) return { isAuthorized: true, message: "" };
    return { isAuthorized: false, message: "La modification des lignes de transport est fermée pour ce séjour." };
  }
  if (!canEditLigneBusPointDeRassemblement(user)) {
    return { isAuthorized: false, message: "Vous n'avez pas l'autorisation de modifier le point de rassemblement." };
  }
  return { isAuthorized: true, message: "" };
}

export function canUpdateCenterId(user: UserDto, cohort?: CohortType | null): { isAuthorized: boolean; message: string } {
  if (!cohort) return { isAuthorized: false, message: "Impossible de récupérer les informations de la cohorte" };
  if (user.role === ROLES.TRANSPORTER) {
    if (isBusEditionOpen(user, cohort)) return { isAuthorized: true, message: "" };
    return { isAuthorized: false, message: "La modification des lignes de transport est fermée pour ce séjour." };
  }
  if (!canEditLigneBusCenter(user)) {
    return { isAuthorized: false, message: "Vous n'avez pas l'autorisation de modifier la destination d'une ligne de transport." };
  }
  return { isAuthorized: true, message: "" };
}

export function canUpdateCenterSchedule(user: UserDto, cohort?: CohortType | null): { isAuthorized: boolean; message: string } {
  if (!cohort) return { isAuthorized: false, message: "Impossible de récupérer les informations de la cohorte" };
  if (user.role === ROLES.TRANSPORTER) {
    if (isBusEditionOpen(user, cohort)) return { isAuthorized: true, message: "" };
    return { isAuthorized: false, message: "La modification des lignes de transport est fermée pour ce séjour." };
  }
  if (!canEditLigneBusPointDeRassemblement(user)) {
    return { isAuthorized: false, message: "Vous n'avez pas l'autorisation de modifier les horaires d'une ligne de transport." };
  }
  return { isAuthorized: true, message: "" };
}

export function canNotifyLineWasUpdated(user: UserDto): { isAuthorized: boolean; message: string } {
  if (!isAdmin(user)) {
    return { isAuthorized: false, message: "Vous n'avez pas l'autorisation d'envoyer une notification." };
  }
  return { isAuthorized: true, message: "" };
}
