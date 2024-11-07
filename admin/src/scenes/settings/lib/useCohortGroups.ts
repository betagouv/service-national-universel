import { useQuery } from "@tanstack/react-query";
import { getCohortGroups } from "./cohortGroupService";

export default function useCohortGroups() {
  return useQuery({ queryFn: getCohortGroups, queryKey: ["cohortGroups"] });
}
