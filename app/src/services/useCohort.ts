import { CohortState } from "@/redux/cohort/reducer";
import { cohortAssignmentAnnouncementsIsOpenForYoung, isCohortDone, isCohortNeedJdm } from "@/utils/cohorts";
import { useSelector } from "react-redux";
import { getCohortPeriod } from "snu-lib";

export default function useCohort() {
  const { cohort } = useSelector((state: CohortState) => state.Cohort);
  return {
    cohort,
    cohortAssignmentAnnouncementsIsOpenForYoung: cohortAssignmentAnnouncementsIsOpenForYoung(cohort),
    isCohortDone: isCohortDone(cohort),
    isCohortNeedJdm: isCohortNeedJdm(cohort),
    cohortDateString: getCohortPeriod(cohort) as string,
  };
}
