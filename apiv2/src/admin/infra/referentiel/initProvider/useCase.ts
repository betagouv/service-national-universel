import { ImporterAcademies } from "@admin/core/referentiel/academie/useCase/ImporterAcademies/ImporterAcademies";
import { ImporterDepartements } from "@admin/core/referentiel/departement/useCase/ImporterDepartements/ImporterDepartements";
import { ImporterRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImporterRegionsAcademiques/ImporterRegionsAcademiques";

export const referentielUseCaseProviders = [ImporterRegionsAcademiques, ImporterDepartements, ImporterAcademies];
