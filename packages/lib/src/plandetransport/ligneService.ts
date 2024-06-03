import { CohortDto, LigneBusDto } from "../dto";
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

export const isSameBusTeam = (ligne1: LigneBusDto, ligne2: LigneBusDto) => {
  const team1 = ligne1?.team?.map(({ _id }) => _id) || [];
  const team2 = ligne2?.team?.map(({ _id }) => _id) || [];
  return team1.sort().toString() == team2.sort().toString();
};
