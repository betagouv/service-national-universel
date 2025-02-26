import API from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { CohesionCenterType } from "snu-lib";

async function fetchCenters(filters: Record<string, string[]>): Promise<CohesionCenterType[]> {
  const body = { filters, size: 100 };
  const { responses } = await API.post("/elasticsearch/cohesioncenter/search", body);
  const options = responses[0].hits.hits.map((hit) => hit._source);
  return options;
}

export default function useCentres(cohortName: string) {
  const filters = { cohorts: [cohortName] };
  return useQuery({
    queryKey: ["centre", cohortName],
    queryFn: () => fetchCenters(filters),
  });
}
