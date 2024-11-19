import { useQuery } from "@tanstack/react-query";
import { getCohortGroups } from "./cohortGroupRepository";

export default function useCohortGroups() {
  return useQuery({
    queryFn: getCohortGroups,
    queryKey: ["cohortGroups"],
    meta: { errorMessage: "Impossible de charger les groupes de cohortes." },
  });
}
