import { GetSimulationsRoute } from "./getSimulations";
import { GetTraitementsRoute } from "./getTraitements";
import { DeletePDT } from "./deletePlanDeTransport";
import { GetSimulationRoute } from "./getSimulation";
import { DeleteLigneBus } from "./deleteLigneBus";

export type Phase1Routes = {
  GetSimulationRoute: GetSimulationRoute;
  GetSimulationsRoute: GetSimulationsRoute;
  GetTraitementsRoute: GetTraitementsRoute;
  DeletePDT: DeletePDT;
  DeleteLigneBus: DeleteLigneBus;
};

export type { AffectationRoutes } from "./affectation";
export type { InscriptionRoutes } from "./inscription";
export type { DesistementRoutes } from "./desistement";
