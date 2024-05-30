import { CohortDto, BusDto } from "../dto";
import { ROLES } from "../roles";

export const isTeamLeaderOrSupervisorEditable = (actor, cohort: CohortDto) => {
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

export const isSameBusTeam = (ligne1: BusDto, ligne2: BusDto) => {
  const currentChef = ligne1?.team?.find((item) => item.role === "leader")?._id;
  const newChef = ligne2?.team?.find((item) => item.role === "leader")?._id;
  return currentChef !== newChef;
};
