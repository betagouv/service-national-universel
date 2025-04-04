import { ImporterAcademies } from "@admin/core/referentiel/academie/useCase/ImporterAcademies/ImporterAcademies";
import { DesisterClasses } from "@admin/core/referentiel/classe/useCase/DesisterClasses";
import { ImporterClasses } from "@admin/core/referentiel/classe/useCase/ImporterClasses";
import { ImporterDepartements } from "@admin/core/referentiel/departement/useCase/ImporterDepartements/ImporterDepartements";
import { ImporterRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImporterRegionsAcademiques/ImporterRegionsAcademiques";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";
import { AnnulerClasseDesistee } from "@admin/core/sejours/cle/classe/useCase/AnnulerClasseDesistee";

export const referentielUseCaseProviders = [
    ImporterRegionsAcademiques,
    ImporterRoutes,
    ImporterClasses,
    DesisterClasses,
    AnnulerClasseDesistee,
    ImporterDepartements,
    ImporterAcademies,
];
