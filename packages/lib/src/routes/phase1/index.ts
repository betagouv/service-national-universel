import { GetSimulationsRoute } from "./getSimulations";
import { GetTraitementsRoute } from "./getTraitements";
import { DeletePDT } from "./deletePlanDeTransport";
import { GetSimulationRoute } from "./getSimulation";
import { GetManySessionPhase1Route } from "./getManySession";

export type Phase1Routes = {
  GetSimulationRoute: GetSimulationRoute;
  GetSimulationsRoute: GetSimulationsRoute;
  GetTraitementsRoute: GetTraitementsRoute;
  DeletePDT: DeletePDT;
};

export type SessionPhase1Routes = {
  GetMany: GetManySessionPhase1Route;
}

export type { AffectationRoutes } from "./affectation";
export type { InscriptionRoutes } from "./inscription";

