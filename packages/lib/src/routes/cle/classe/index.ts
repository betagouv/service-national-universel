import { GetOneClasseRoute } from "./getOne";
import { CreateClasseRoute } from "./create";
import { UpdateClasseRoute } from "./update";
import { DeleteClasseRoute } from "./delete";
import { ModifierReferentClasseRoute } from "./modifierReferent";
import { InscriptionEnMasseValiderRoute } from "./InscriptionEnMasseValider";
import { InscriptionEnMasseImporterRoute } from "./InscriptionEnMasseImporter";
import { InscriptionEnMasseStatutRoute } from "./InscriptionEnMasseStatut";
import { InscriptionManuelleRoute } from "./InscriptionManuelle";

export type ClassesRoutes = {
  Create: CreateClasseRoute;
  GetOne: GetOneClasseRoute;
  Update: UpdateClasseRoute;
  Delete: DeleteClasseRoute;
  ModifierReferentClasse: ModifierReferentClasseRoute;
  InscriptionEnMasseValider: InscriptionEnMasseValiderRoute;
  InscriptionEnMasseImporter: InscriptionEnMasseImporterRoute;
  InscriptionEnMasseStatut: InscriptionEnMasseStatutRoute;
  InscriptionManuelle: InscriptionManuelleRoute;
};
