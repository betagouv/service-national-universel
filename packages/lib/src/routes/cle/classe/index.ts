import { GetOneClasseRoute } from "./getOne";
import { CreateClasseRoute } from "./create";
import { UpdateClasseRoute } from "./update";
import { DeleteClasseRoute } from "./delete";
import { ModifierReferentClasseRoute } from "./modifierReferent";
import { InscriptionEnMasseValiderRoute } from "./InscriptionEnMasseValider";
import { InscriptionEnMasseImporterRoute } from "./InscriptionEnMasseImporter";

export type ClassesRoutes = {
  Create: CreateClasseRoute;
  GetOne: GetOneClasseRoute;
  Update: UpdateClasseRoute;
  Delete: DeleteClasseRoute;
  ModifierReferentClasse: ModifierReferentClasseRoute;
  InscriptionEnMasseValider: InscriptionEnMasseValiderRoute;
  InscriptionEnMasseImporter: InscriptionEnMasseImporterRoute;
};
