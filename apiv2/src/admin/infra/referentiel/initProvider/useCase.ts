import { ImporterClasses } from "@admin/core/referentiel/classe/useCase/ImporterClasses";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";

export const useCaseProvider = [ImporterRoutes, ImporterClasses];
