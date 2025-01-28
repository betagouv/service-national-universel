import { GetSimulationsRoute } from "./getSimulations";
import { GetTraitementsRoute } from "./getTraitements";
import { DeletePDT } from "./deletePlanDeTransport";

export type Phase1Routes = {
  GetSimulationsRoute: GetSimulationsRoute;
  GetTraitementsRoute: GetTraitementsRoute;
  DeletePDT: DeletePDT;
};

export type { AffectationRoutes } from "./affectation";
