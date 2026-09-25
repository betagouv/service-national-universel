import { GetOneClasseRoute } from "./getOne";
import { CreateClasseRoute } from "./create";
import { UpdateClasseRoute } from "./update";
import { DeleteClasseRoute } from "./delete";
import { ModifierReferentClasseRoute } from "./modifierReferent";
import { InscriptionManuelleRoute } from "./InscriptionManuelle";

export type ClassesRoutes = {
  Create: CreateClasseRoute;
  GetOne: GetOneClasseRoute;
  Update: UpdateClasseRoute;
  Delete: DeleteClasseRoute;
  ModifierReferentClasse: ModifierReferentClasseRoute;
  InscriptionManuelle: InscriptionManuelleRoute;
};
