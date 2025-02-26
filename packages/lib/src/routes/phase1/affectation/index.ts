import { GetAffectation } from "./getAffectation";
import { GetSimulationAnalytics } from "./getSimulationAnalytics";
import { PostSimulationsCLERoute } from "./postSimulationAffectationCLEMetropole";
import { PostSimulationsHTSRoute } from "./postSimulationAffectationHTSMetropole";
import { PostSimulationsCLEDromComRoute } from "./postSimulationsCLEDromCom";
import { PostSyncPlacesLigneDeBusRoute } from "./postSyncPlacesLigneDeBus";
import { PostSyncPlacesCentreRoute } from "./postSyncPlacesSejour";
import { PostValiderAffectationCLEDromComRoute } from "./PostValiderAffectationCLEDromCom";
import { PostValiderAffectationCLERoute } from "./postValiderAffectationCLEMetropole";
import { PostValiderAffectationHTSRoute } from "./postValiderAffectationHTSMetropole";

export type AffectationRoutes = {
  GetAffectation: GetAffectation;
  GetSimulationAnalytics: GetSimulationAnalytics;
  PostSimulationsHTSRoute: PostSimulationsHTSRoute;
  PostSimulationsCLERoute: PostSimulationsCLERoute;
  PostSimulationsCLEDromComRoute: PostSimulationsCLEDromComRoute;
  PostValiderAffectationHTSRoute: PostValiderAffectationHTSRoute;
  PostValiderAffectationCLERoute: PostValiderAffectationCLERoute;
  PostValiderAffectationCLEDromComRoute: PostValiderAffectationCLEDromComRoute;
  PostSyncPlacesLigneDeBus: PostSyncPlacesLigneDeBusRoute;
  PostSyncPlacesCentre: PostSyncPlacesCentreRoute;
};
