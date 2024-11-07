import { queryClient } from "@/services/react-query";
import { useMutation } from "@tanstack/react-query";
import { CohortDto, CohortGroupType } from "snu-lib";
import { createCohortGroup } from "./cohortGroupService";

export default function useCreateCohortGroup(cohort: CohortDto) {
  return useMutation({
    mutationFn: async (name: string) => await createCohortGroup(name, cohort),
    onSuccess: (data) => queryClient.setQueryData(["cohortGroups"], (old: CohortGroupType[]) => [...old, data]),
  });
}
