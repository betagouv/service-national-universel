import { ReferentModel } from "@admin/core/iam/Referent.model";
import { Injectable } from "@nestjs/common";
import { ROLES } from "snu-lib";

export const EXPORT_JEUNE_FOLDER = "file/admin/sejours/phase1/jeune/export";

@Injectable()
export class ExporterJeuneService {
    constructor() {}

    isExportScolariseAllowed(user: Partial<ReferentModel>, departement?: string[], region?: string) {
        if (!departement?.length && !region) {
            return false;
        } else if (departement?.length && region) {
            return false;
        } else if (
            user.role === ROLES.REFERENT_DEPARTMENT ||
            !departement?.length ||
            !user.departement?.includes(departement![0])
        ) {
            return false;
        } else if (user.role === ROLES.REFERENT_REGION && region !== user.region) {
            return false;
        }
        return true;
    }
}
