import { ReferentielService } from "@admin/core/referentiel/Referentiel.service";
import { ReferentielClasseService } from "@admin/core/referentiel/classe/ReferentielClasse.service";

export const referentielServiceProvider = [ReferentielClasseService, ReferentielService];
