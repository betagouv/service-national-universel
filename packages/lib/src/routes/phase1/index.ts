import { GetSimulationsRoute } from "./getSimulations";
import { GetTraitementsRoute } from "./getTraitements";
import { DeletePDT } from "./deletePlanDeTransport";
import { GetSimulationRoute } from "./getSimulation";

export type Phase1Routes = {
  GetSimulationRoute: GetSimulationRoute;
  GetSimulationsRoute: GetSimulationsRoute;
  GetTraitementsRoute: GetTraitementsRoute;
  DeletePDT: DeletePDT;
};

export type { AffectationRoutes } from "./affectation";
export type { InscriptionRoutes } from "./inscription";
