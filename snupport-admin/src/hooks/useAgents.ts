import { useQuery } from "@tanstack/react-query";
import { getAgents } from "../services/agents";

export default function useAgents() {
  const query = useQuery({
    queryKey: ["agents"],
    queryFn: getAgents,
  });
  return {
    ...query,
    data: {
      agents: query.data?.AGENT ? query.data?.AGENT : [],
      referentsDepartment: query.data?.REFERENT_DEPARTMENT ? query.data?.REFERENT_DEPARTMENT : [],
      referentsRegion: query.data?.REFERENT_REGION ? query.data?.REFERENT_REGION : [],
    },
  };
}
