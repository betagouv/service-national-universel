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
};

export default PlanMarketingService;
