import { GetAffectation } from "./getAffectation";
import { PostSimulationsCLERoute } from "./postSimulationAffectationCLEMetropole";
import { PostSimulationsHTSRoute } from "./postSimulationAffectationHTSMetropole";
import { PostValiderAffectationRoute } from "./postValiderAffectationMetropole";

export type AffectationRoutes = {
  GetAffectation: GetAffectation;
  PostSimulationsHTSRoute: PostSimulationsHTSRoute;
  PostSimulationsCLERoute: PostSimulationsCLERoute;
  PostValiderAffectationRoute: PostValiderAffectationRoute;
};
