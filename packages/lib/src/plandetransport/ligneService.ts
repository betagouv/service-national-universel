import { CohortDto, UserDto } from "../dto";
import { ROLES } from "../roles";

export const isTeamLeaderOrSupervisorEditable = (actor: Pick<UserDto, "role">, cohort?: Pick<CohortDto, "busEditionOpenForTransporter" | "informationsConvoyage"> | null) => {
  switch (actor?.role) {
    case ROLES.ADMIN:
      return true;
    case ROLES.TRANSPORTER:
      return !!cohort?.busEditionOpenForTransporter;
    case ROLES.REFERENT_REGION:
      return !!cohort?.informationsConvoyage?.editionOpenForReferentRegion;
    case ROLES.REFERENT_DEPARTMENT:
      return !!cohort?.informationsConvoyage?.editionOpenForReferentDepartment;
    case ROLES.HEAD_CENTER:
      return !!cohort?.informationsConvoyage?.editionOpenForHeadOfCenter;
    default:
      return false;
  }
};
