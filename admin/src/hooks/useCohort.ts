import { CohortState } from "@/redux/cohorts/reducer";
import { useSelector } from "react-redux";
import { CohortDto } from "snu-lib";

export default function useCohort(cohortId: string): CohortDto | undefined {
  const cohort = useSelector((state: CohortState) => state.Cohorts.find((cohort) => cohort._id === cohortId));
  return cohort;
}
