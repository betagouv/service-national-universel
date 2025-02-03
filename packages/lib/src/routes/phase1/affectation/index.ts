import { GetAffectation } from "./getAffectation";
import { PostSimulationsCLERoute } from "./postSimulationAffectationCLEMetropole";
import { PostSimulationsHTSRoute } from "./postSimulationAffectationHTSMetropole";
import { PostValiderAffectationCLERoute } from "./postValiderAffectationCLEMetropole";
import { PostValiderAffectationHTSRoute } from "./postValiderAffectationHTSMetropole";

export type AffectationRoutes = {
  GetAffectation: GetAffectation;
  PostSimulationsHTSRoute: PostSimulationsHTSRoute;
  PostSimulationsCLERoute: PostSimulationsCLERoute;
  PostValiderAffectationHTSRoute: PostValiderAffectationHTSRoute;
  PostValiderAffectationCLERoute: PostValiderAffectationCLERoute;
};
