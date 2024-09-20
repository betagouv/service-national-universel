import { GetOneCohortRoute } from "./get";
import { PostEligibilityRoute } from "./getEligibility";
import { GetIsIncriptionOpenRoute } from "./getIsIncriptionOpen";
import { GetIsReincriptionOpenRoute } from "./getIsReIncriptionOpen";

export type CohortsRoutes = {
  GetOne: GetOneCohortRoute;
  PostEligibility: PostEligibilityRoute;
  GetIsIncriptionOpen: GetIsIncriptionOpenRoute;
  GetIsReincriptionOpen: GetIsReincriptionOpenRoute;
};
