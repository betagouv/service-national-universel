import { GetOneCohortRoute } from "./get";
import { GetEligibilityRoute } from "./getEligibility";
import { GetIsIncriptionOpenRoute } from "./getIsIncriptionOpen";
import { GetIsReincriptionOpenRoute } from "./getIsReIncriptionOpen";

export type CohortsRoutes = {
  GetOne: GetOneCohortRoute;
  GetEligibility: GetEligibilityRoute;
  GetIsIncriptionOpen: GetIsIncriptionOpenRoute;
  GetIsReincriptionOpen: GetIsReincriptionOpenRoute;
};
