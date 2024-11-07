import { buildRequest } from "@/utils/buildRequest";
import { useQuery } from "@tanstack/react-query";
import { CohortGroupRoutes } from "snu-lib";

export default function useCohortGroups() {
  return useQuery({
    queryFn: async () => {
      const request = buildRequest<CohortGroupRoutes["Get"]>({
        path: "/cohort-group",
        method: "GET",
      });
      const { ok, code, data } = await request();
      if (!ok) throw new Error(code);
      return data;
    },
    queryKey: ["cohortGroups"],
  });
}
