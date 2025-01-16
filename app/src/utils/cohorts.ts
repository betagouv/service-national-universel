import { CohortType } from "snu-lib";
import { apiURL } from "@/config";

export function cohortAssignmentAnnouncementsIsOpenForYoung(cohort: CohortType): boolean {
  return cohort?.isAssignmentAnnouncementsOpenForYoung === true;
}

export function getMeetingPointChoiceLimitDateForCohort(cohort: CohortType): Date | null {
  if (cohort?.pdrChoiceLimitDate) {
    return cohort.pdrChoiceLimitDate;
  } else {
    return null;
  }
}

// start of the cohort's last day
export function isCohortDone(cohort: CohortType, extraDays = 0): boolean {
  if (!cohort?.dateEnd) return false;
  const dateEnd = new Date(cohort.dateEnd);
  const endDateDayStart = new Date(dateEnd.getUTCFullYear(), dateEnd.getUTCMonth(), dateEnd.getUTCDate(), 0, 0, 0);
  endDateDayStart.setDate(dateEnd.getUTCDate() + extraDays);
  return endDateDayStart.valueOf() < Date.now();
}

export function isCohortNeedJdm(cohort: CohortType): boolean {
  const needTheJDMPresenceTrue = ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Février 2022", "2021", "2022", "2020"];
  if (needTheJDMPresenceTrue.includes(cohort?.name)) {
    return true;
  } else {
    return false;
  }
}

export async function fetchCohort(cohortId: string): Promise<CohortType> {
  return fetch(`${apiURL}/cohort/${cohortId}/public`)
    .then((res) => res.json())
    .catch((error) => {
      throw new Error(error);
    })
    .then((res) => {
      if (!res.ok) throw new Error("Unable to fetch cohort");
      return res.data;
    });
}
