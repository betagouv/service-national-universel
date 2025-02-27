import API from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { CohesionCenterType, SessionPhase1Type } from "snu-lib";

export type SessionPhase1PopulatedWithCenter = SessionPhase1Type & { cohesionCenter: CohesionCenterType };

async function fetchSessions(filters: Record<string, string[]>): Promise<SessionPhase1PopulatedWithCenter[]> {
  const body = { filters, size: 100 };
  const { responses } = await API.post("/elasticsearch/sessionphase1/search?needCohesionCenterInfo=true", body);
  const options = responses[0].hits.hits.map((hit) => ({ _id: hit._id, ...hit._source }));
  return options;
}

export default function useSessions(cohortName: string) {
  const filters = { cohort: [cohortName] };
  return useQuery({
    queryKey: ["centre", cohortName],
    queryFn: () => fetchSessions(filters),
    refetchOnWindowFocus: false,
  });
}
