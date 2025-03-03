import { GetAffectation } from "./getAffectation";
import { GetSimulationAnalytics } from "./getSimulationAnalytics";

import { PostSyncPlacesLignesDeBusRoute } from "./postSyncPlacesLignesDeBus";
import { PostSyncPlacesCentreRoute } from "./postSyncPlacesCentreRoute";
import { PostSyncPlacesCentresRoute } from "./postSyncPlacesCentresRoute";

import { PostSimulationAffectationHTSMetropole } from "./postSimulationAffectationHTSMetropole";
import { PostValiderAffectationHTSRoute } from "./postValiderAffectationHTSMetropole";

import { PostSimulationAffectationHTSDromComRoute } from "./postSimulationAffectationHTSDromCom";
import { PostValiderAffectationHTSDromComRoute } from "./postValiderAffectationHTSDromCom";

import { PostSimulationAffectationCLEMetropole } from "./postSimulationAffectationCLEMetropole";
import { PostValiderAffectationCLERoute } from "./postValiderAffectationCLEMetropole";

import { PostSimulationAffectationCLEDromComRoute } from "./postSimulationAffectationCLEDromCom";
import { PostValiderAffectationCLEDromComRoute } from "./postValiderAffectationCLEDromCom_";

export type AffectationRoutes = {
  GetAffectation: GetAffectation;
  GetSimulationAnalytics: GetSimulationAnalytics;
  PostSimulationsHTSRoute: PostSimulationAffectationHTSMetropole;
  PostSimulationsHTSDromComRoute: PostSimulationAffectationHTSDromComRoute;
  PostSimulationsCLERoute: PostSimulationAffectationCLEMetropole;
  PostSimulationsCLEDromComRoute: PostSimulationAffectationCLEDromComRoute;
  PostValiderAffectationHTSRoute: PostValiderAffectationHTSRoute;
  PostValiderAffectationHTSDromComRoute: PostValiderAffectationHTSDromComRoute;
  PostValiderAffectationCLERoute: PostValiderAffectationCLERoute;
  PostValiderAffectationCLEDromComRoute: PostValiderAffectationCLEDromComRoute;
  PostSyncPlacesLignesDeBus: PostSyncPlacesLignesDeBusRoute;
  PostSyncPlacesCentre: PostSyncPlacesCentreRoute;
  PostSyncPlacesCentres: PostSyncPlacesCentresRoute;
};
