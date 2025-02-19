import { PlanMarketingRoutes, ReferentsRoutes } from "snu-lib";
import { buildRequest } from "@/utils/buildRequest";
import api from "../services/api";

export type FiltersYoungsForExport = Record<string, string[]>;


const BrevoRecipientsService = {
  getFilteredYoungsForExport: async (filtersSelected: FiltersYoungsForExport, tab: "volontaire" | "inscription"): Promise<any> => {
    const route = `/elasticsearch/young/export${tab === "volontaire" ? "?tab=volontaire" : ""}`;
    const fieldsToExport = [
      "firstName",
      "lastName",
      "cohort",
      "email",
      "etablissementId",
      "classeId",
      "parent1Status",
      "parent1FirstName",
      "parent1LastName",
      "parent1Email",
      "parent2Status",
      "parent2FirstName",
      "parent2LastName",
      "parent2Email",
      "status",
      "phase",
      "statusPhase1",
      "statusPhase2",
      "statusPhase3",
      "lastStatusAt",
      "cohesionCenterId",
      "sessionPhase1Id",
      "meetingPointId",
      "ligneId",
    ];

    const formattedFilters = Object.entries(filtersSelected).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.filter,
      }),
      {},
    );

    const { data: filteredYoungs } = await api.post(route, {
      filters: formattedFilters,
      exportFields: fieldsToExport,
    });

    return filteredYoungs || [];
  },

  getReferentsByIds: async (referentIds: string[]) => {
    return await buildRequest<ReferentsRoutes["GetMany"]>({
      path: "/cle/referent/getMany",
      method: "POST",
      payload: { ids: referentIds },
      target: "API",
    })();
  },

  importRecipients: async (file: File) => {
    const res = await api.uploadFiles(`/plan-marketing/import`, [file], {}, 0);
    if (!res.ok) {
      throw new Error(res.code + (res.message || ""));
    }
    return res.data;
  },

  createDistributionList: async (payload: PlanMarketingRoutes["CreateDistributionList"]["payload"]) => {
    return await buildRequest<PlanMarketingRoutes["CreateDistributionList"]>({
      path: "/plan-marketing/liste-diffusion",
      method: "POST",
      payload,
      target: "API_V2",
    })();
  },
};

export { BrevoRecipientsService };
