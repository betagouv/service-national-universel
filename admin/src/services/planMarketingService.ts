import { buildRequest } from "@/utils/buildRequest";
import { PlanMarketingRoutes } from "snu-lib";

const PlanMarketingService = {
  create: async (payload: PlanMarketingRoutes["CreatePlanMarketingRoute"]["payload"]) => {
    return await buildRequest<PlanMarketingRoutes["CreatePlanMarketingRoute"]>({
      path: "/campagne",
      method: "POST",
      payload: payload,
      target: "API_V2",
    })();
  },

  update: async (id: string, payload: PlanMarketingRoutes["UpdatePlanMarketingRoute"]["payload"]) => {
    return await buildRequest<PlanMarketingRoutes["UpdatePlanMarketingRoute"]>({
      path: "/campagne/{id}",
      params: { id: id },
      method: "PUT",
      payload: payload,
      target: "API_V2",
    })();
  },

  search: async (query?: PlanMarketingRoutes["SearchPlanMarketingRoute"]["query"]) => {
    return await buildRequest<PlanMarketingRoutes["SearchPlanMarketingRoute"]>({
      path: "/campagne",
      method: "GET",
      target: "API_V2",
      query,
    })();
  },

  getCampagneSpecifiques: async (id: string) => {
    return await buildRequest<PlanMarketingRoutes["GetCampagneSpecifiquesByCampagneGeneriqueIdRoute"]>({
      path: "/campagne/{id}/campagnes-specifiques",
      params: { id },
      method: "GET",
      target: "API_V2",
    })();
  },

  envoyer: async (id: string, isProgrammationActive?: boolean) => {
    return await buildRequest<PlanMarketingRoutes["EnvoyerPlanMarketingRoute"]>({
      path: "/campagne/{id}/envoyer",
      params: { id },
      method: "POST",
      target: "API_V2",
      payload: { isProgrammationActive },
    })();
  },

  toggleArchivage: async (id: string) => {
    return await buildRequest<PlanMarketingRoutes["ToggleArchivagePlanMarketingRoute"]>({
      path: "/campagne/{id}/toggle-archivage",
      params: { id },
      method: "POST",
      target: "API_V2",
    })();
  },

  envoyerEmailTest: async (id: string) => {
    return await buildRequest<PlanMarketingRoutes["EnvoyerEmailTestPlanMarketingRoute"]>({
      path: "/campagne/{id}/envoyer-email-test",
      params: { id },
      method: "POST",
      target: "API_V2",
    })();
  },
};

export default PlanMarketingService;
