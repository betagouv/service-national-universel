import { GetAffectation } from "./getAffectation";
import { PostSimulationsRoute } from "./postSimulationAffectationMetropole";
import { PostValiderAffectationRoute } from "./postValiderAffectationMetropole";

export type AffectationRoutes = {
  GetAffectation: GetAffectation;
  PostSimulationsRoute: PostSimulationsRoute;
  PostValiderAffectationRoute: PostValiderAffectationRoute;
};
