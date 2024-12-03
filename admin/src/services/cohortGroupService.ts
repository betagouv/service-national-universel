import { buildRequest } from "@/utils/buildRequest";
import { CohortDto, CohortGroupRoutes } from "snu-lib";

export async function getCohortGroups() {
  const request = buildRequest<CohortGroupRoutes["Get"]>({
    path: "/cohort-group",
    method: "GET",
  });
  const { ok, code, data } = await request();
  if (!ok) throw new Error(code);
  if (!data) throw new Error("No data returned");
  return data;
}

export async function createCohortGroup(name: string, cohort: CohortDto) {
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
}
