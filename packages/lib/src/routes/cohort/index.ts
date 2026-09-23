import { GetOneCohortRoute } from "./get";
import { PostEligibilityRoute } from "./postEligibility";
import { GetIsIncriptionOpenRoute } from "./getIsIncriptionOpen";

export type CohortsRoutes = {
  GetOne: GetOneCohortRoute;
  PostEligibility: PostEligibilityRoute;
  GetIsIncriptionOpen: GetIsIncriptionOpenRoute;
};
