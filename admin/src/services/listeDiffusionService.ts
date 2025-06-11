import { buildRequest } from "@/utils/buildRequest";
import { PlanMarketingRoutes } from "snu-lib";

const ListeDiffusionService = {
  create: async (payload: PlanMarketingRoutes["ListeDiffusionRoutes"]["CreateListeDiffusionRoute"]["payload"]) => {
    return await buildRequest<PlanMarketingRoutes["ListeDiffusionRoutes"]["CreateListeDiffusionRoute"]>({
      path: "/liste-diffusion",
      method: "POST",
      payload: payload,
      target: "API_V2",
    })();
  },
  update: async (id: string, payload: PlanMarketingRoutes["ListeDiffusionRoutes"]["UpdateListeDiffusionRoute"]["payload"]) => {
    return await buildRequest<PlanMarketingRoutes["ListeDiffusionRoutes"]["UpdateListeDiffusionRoute"]>({
      path: `/liste-diffusion/{id}`,
      params: { id },
      method: "PUT",
      payload: payload,
      target: "API_V2",
    })();
  },
  search: async (query?: PlanMarketingRoutes["ListeDiffusionRoutes"]["SearchListeDiffusionRoute"]["query"]) => {
    return await buildRequest<PlanMarketingRoutes["ListeDiffusionRoutes"]["SearchListeDiffusionRoute"]>({
      path: "/liste-diffusion",
      method: "GET",
      target: "API_V2",
      query,
    })();
  },
  toggleArchivage: async (id: string) => {
    return await buildRequest<PlanMarketingRoutes["ListeDiffusionRoutes"]["ToggleArchivageListeDiffusionRoute"]>({
      path: `/liste-diffusion/{id}/toggle-archivage`,
      params: { id },
      method: "POST",
      target: "API_V2",
    })();
  },
};

export default ListeDiffusionService;
