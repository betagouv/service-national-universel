import { CohortState } from "@/redux/cohort/reducer";
import { pdrChoiceExpired, pdrChoiceLimitDate } from "@/scenes/phase1/scenes/affected/utils/steps.utils";
import { cohortAssignmentAnnouncementsIsOpenForYoung, getMeetingPointChoiceLimitDateForCohort, isCohortDone, isCohortNeedJdm } from "@/utils/cohorts";
import { useSelector } from "react-redux";

export default function useCohort() {
  const cohort = useSelector((state: CohortState) => state.Cohort.cohort);
  return {
    cohort,
    cohortAssignmentAnnouncementsIsOpenForYoung: cohortAssignmentAnnouncementsIsOpenForYoung(cohort),
    getMeetingPointChoiceLimitDateForCohort: getMeetingPointChoiceLimitDateForCohort(cohort),
    isCohortDone: isCohortDone(cohort),
    isCohortNeedJdm: isCohortNeedJdm(cohort),
    pdrChoiceLimitDate: pdrChoiceLimitDate(cohort),
    pdrChoiceExpired: pdrChoiceExpired(cohort),
  };
}
