import { FilterLabelDto } from "src/dto/filterLabelDto";
import { BasicRoute, RouteResponseBody } from "..";

interface GetFilterLabelRoute extends BasicRoute {
  method: "GET";
  path: "/filter-label/{listType}";
  params: { listType: string };
  response: RouteResponseBody<FilterLabelDto>;
}

export type FilterLabelRoutes = {
  Get: GetFilterLabelRoute;
};
