import { DesisterClasses } from "@admin/core/referentiel/classe/useCase/DesisterClasses";
import { ImporterClasses } from "@admin/core/referentiel/classe/useCase/ImporterClasses";
import { ImporterRoutes } from "@admin/core/referentiel/routes/useCase/ImporterRoutes";
import { AnnulerClasseDesistee } from "@admin/core/sejours/cle/classe/useCase/AnnulerClasseDesistee";

export const useCaseProvider = [ImporterRoutes, ImporterClasses, DesisterClasses, AnnulerClasseDesistee];
