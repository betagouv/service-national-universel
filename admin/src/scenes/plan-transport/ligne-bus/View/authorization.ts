import { canEditLigneBusCenter, canEditLigneBusPointDeRassemblement, CohortType, isBusEditionOpen, ROLES, UserDto } from "snu-lib";

export function getAuthorizationToUpdatePdrOnLine(user: UserDto, cohort?: CohortType | null): { isAuthorized: boolean; message: string } {
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

export function getAuthorizationToUpdateCenterOnLine(user: UserDto, cohort?: CohortType | null): { isAuthorized: boolean; message: string } {
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
