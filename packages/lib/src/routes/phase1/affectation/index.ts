import { GetAffectation } from "./getAffectation";
import { GetSimulationAnalytics } from "./getSimulationAnalytics";
import { PostSimulationsCLERoute } from "./postSimulationAffectationCLEMetropole";
import { PostSimulationsHTSRoute } from "./postSimulationAffectationHTSMetropole";
import { PostSimulationsCLEDromComRoute } from "./postSimulationsCLEDromCom";
import { PostSyncPlacesLignesDeBusRoute } from "./postSyncPlacesLignesDeBus";
import { PostSyncPlacesCentreRoute } from "./postSyncPlacesCentreRoute";
import { PostValiderAffectationCLEDromComRoute } from "./PostValiderAffectationCLEDromCom";
import { PostValiderAffectationCLERoute } from "./postValiderAffectationCLEMetropole";
import { PostValiderAffectationHTSRoute } from "./postValiderAffectationHTSMetropole";
import { PostSyncPlacesCentresRoute } from "./postSyncPlacesCentresRoute";

export type AffectationRoutes = {
  GetAffectation: GetAffectation;
  GetSimulationAnalytics: GetSimulationAnalytics;
  PostSimulationsHTSRoute: PostSimulationsHTSRoute;
  PostSimulationsCLERoute: PostSimulationsCLERoute;
  PostSimulationsCLEDromComRoute: PostSimulationsCLEDromComRoute;
  PostValiderAffectationHTSRoute: PostValiderAffectationHTSRoute;
  PostValiderAffectationCLERoute: PostValiderAffectationCLERoute;
  PostValiderAffectationCLEDromComRoute: PostValiderAffectationCLEDromComRoute;
  PostSyncPlacesLignesDeBus: PostSyncPlacesLignesDeBusRoute;
  PostSyncPlacesCentre: PostSyncPlacesCentreRoute;
  PostSyncPlacesCentres: PostSyncPlacesCentresRoute;
};
