import { queryClient } from "@/services/react-query";
import { useMutation } from "@tanstack/react-query";
import { CohortDto, CohortGroupType } from "snu-lib";
import { createCohortGroup } from "../../../../services/cohortGroupService";
import { toastr } from "react-redux-toastr";

export default function useCreateCohortGroup(cohort: CohortDto) {
  return useMutation({
    mutationFn: async (name: string) => await createCohortGroup(name, cohort),
    onSuccess: (data) => queryClient.setQueryData(["cohortGroups"], (old: CohortGroupType[]) => [...old, data]),
    onError: () => toastr.error("Erreur", "Impossible de créer le groupe de cohortes."),
  });
}
