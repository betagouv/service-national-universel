import { fetchOpenCohortGroups } from "@/services/cohort.service";
import { useQuery } from "@tanstack/react-query";

export default function useCohortGroups() {
  return useQuery({
    queryKey: ["cohortGroups"],
    queryFn: fetchOpenCohortGroups,
  });
}
