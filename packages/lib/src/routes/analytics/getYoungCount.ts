import { BasicRoute, RouteResponseBodyV2 } from "..";

export interface GetYoungCountRoute extends BasicRoute {
  method: "POST";
  path: "/analytics/youngs/count";
  payload: {
    searchTerm?: {
      value: string;
      fields: string[];
    };
    filters?: Record<string, string | string[]>;
  };
  response: RouteResponseBodyV2<{ count: number }>;
}
