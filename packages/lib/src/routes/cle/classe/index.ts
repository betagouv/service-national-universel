import { GetOneClasseRoute } from "./getOne";
import { CreateClasseRoute } from "./create";
import { UpdateClasseRoute } from "./update";
import { DeleteClasseRoute } from "./delete";
import { ModifierReferentClasseRoute } from "./modifierReferent";

export type ClassesRoutes = {
  // Get: GetClasseRoute;
  Create: CreateClasseRoute;
  GetOne: GetOneClasseRoute;
  Update: UpdateClasseRoute;
  Delete: DeleteClasseRoute;
  ModifierReferentClasse: ModifierReferentClasseRoute;
};
