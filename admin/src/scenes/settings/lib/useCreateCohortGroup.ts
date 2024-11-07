import { queryClient } from "@/services/react-query";
import { buildRequest } from "@/utils/buildRequest";
import { useMutation } from "@tanstack/react-query";
import { CohortDto, CohortGroupRoutes, CohortGroupType } from "snu-lib";

export default function useCreateCohortGroup(cohort: CohortDto) {
  return useMutation({
    mutationFn: async (name: string): Promise<CohortGroupType> => {
      const request = buildRequest<CohortGroupRoutes["Post"]>({
        payload: {
          name: name,
          type: cohort.type,
          year: new Date(cohort.dateStart).getFullYear(),
        },
        method: "POST",
        path: "/cohort-group",
      });
      const { ok, code, data } = await request();
      if (!ok) throw new Error(code);
      if (!data) throw new Error("No data returned");
      return data;
    },
    onSuccess: (data) => queryClient.setQueryData(["cohortGroups"], (old: CohortGroupType[]) => [...old, data]),
  });
}
