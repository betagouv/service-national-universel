import { AnalyticsRoutes } from "snu-lib";

import { buildRequest } from "@/utils/buildRequest";

const AnalyticsService = {
  getYoungCount: async (payload: AnalyticsRoutes["GetYoungCount"]["payload"]) => {
    return await buildRequest<AnalyticsRoutes["GetYoungCount"]>({
      path: "/analytics/youngs/count",
      method: "POST",
      payload: payload,
      target: "API_V2",
    })();
  },
};

export { AnalyticsService };
