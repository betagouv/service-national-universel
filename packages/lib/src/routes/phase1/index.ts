import { GetSimulationsRoute } from "./getSimulations";
import { GetTraitementsRoute } from "./getTraitements";
import { DeletePDT } from "./deletePlanDeTransport";
import { ChangeYoungSessionRoute } from "./bascule";

export type Phase1Routes = {
  GetSimulationsRoute: GetSimulationsRoute;
  GetTraitementsRoute: GetTraitementsRoute;
  DeletePDT: DeletePDT;
  ChangeYoungSessionRoute: ChangeYoungSessionRoute;
};

export type { AffectationRoutes } from "./affectation";
