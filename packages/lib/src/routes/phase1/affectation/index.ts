import { GetAffectation } from "./getAffectation";
import { PostSimulationsCLERoute } from "./postSimulationAffectationCLEMetropole";
import { PostSimulationsHTSRoute } from "./postSimulationAffectationHTSMetropole";
import { PostSimulationsCLEDromComRoute } from "./postSimulationsCLEDromCom";
import { PostValiderAffectationCLEDromComRoute } from "./PostValiderAffectationCLEDromCom";
import { PostValiderAffectationCLERoute } from "./postValiderAffectationCLEMetropole";
import { PostValiderAffectationHTSRoute } from "./postValiderAffectationHTSMetropole";

export type AffectationRoutes = {
  GetAffectation: GetAffectation;
  PostSimulationsHTSRoute: PostSimulationsHTSRoute;
  PostSimulationsCLERoute: PostSimulationsCLERoute;
  PostSimulationsCLEDromComRoute: PostSimulationsCLEDromComRoute;
  PostValiderAffectationHTSRoute: PostValiderAffectationHTSRoute;
  PostValiderAffectationCLERoute: PostValiderAffectationCLERoute;
  PostValiderAffectationCLEDromComRoute: PostValiderAffectationCLEDromComRoute;
};
