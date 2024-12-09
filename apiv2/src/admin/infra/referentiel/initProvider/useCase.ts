import { ImportRegionsAcademiques } from "@admin/core/referentiel/regionAcademique/useCase/ImportRegionsAcademiques";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";

export const referentielUseCaseProviders = [
    ImportRegionsAcademiques,
    ImporterRoutes,
];
