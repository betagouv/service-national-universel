import { useQuery } from "@tanstack/react-query";
import { SessionPhase1Service } from "../../../services/sessionPhase1Service";

export default function useSessionsByCohort(cohortName: string) {
  const filters = { cohort: [cohortName] };
  return useQuery({
    queryKey: ["session", cohortName],
    queryFn: () => SessionPhase1Service.getSessions(filters),
    refetchOnWindowFocus: false,
  });
}
