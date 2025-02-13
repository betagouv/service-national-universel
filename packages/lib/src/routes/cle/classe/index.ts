import { GetOneClasseRoute } from "./getOne";
import { CreateClasseRoute } from "./create";
import { UpdateClasseRoute } from "./update";
import { DeleteClasseRoute } from "./delete";
import { ModifierReferentClasseRoute } from "./modifierReferent";
import { GetManyClassesRoute } from "./getMany";

export type ClassesRoutes = {
  // Get: GetClasseRoute;
  Create: CreateClasseRoute;
  GetOne: GetOneClasseRoute;
  GetMany: GetManyClassesRoute;
  Update: UpdateClasseRoute;
  Delete: DeleteClasseRoute;
  ModifierReferentClasse: ModifierReferentClasseRoute;

};
