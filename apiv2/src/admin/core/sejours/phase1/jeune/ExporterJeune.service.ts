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

    getAllowedFilters(filtersRaw, user: Partial<ReferentModel>) {
        const allowedFilters = [
            "cohort",
            "originalCohort",
            "status",
            "country",
            "academy",
            "region",
            "department",
            "hasNotes",
            "grade",
            "gender",
            "situation",
            "ppsBeneficiary",
            "paiBeneficiary",
            "isRegionRural",
            "qpv",
            "handicap",
            "allergies",
            "specificAmenagment",
            "reducedMobilityAccess",
            "imageRight",
            "CNIFileNotValidOnStart",
            "statusPhase1",
            "hasMeetingInformation",
            "handicapInSameDepartment",
            "youngPhase1Agreement",
            "cohesionStayPresence",
            "presenceJDM",
            "departInform",
            "departSejourMotif",
            "cohesionStayMedicalFileReceived",
            "ligneId",
            "isTravelingByPlane",
            "statusPhase2",
            "phase2ApplicationStatus",
            "statusPhase2Contract",
            "statusMilitaryPreparationFiles",
            "phase2ApplicationFilesType",
            "status_equivalence",
            "statusPhase3",
            "schoolDepartment",
            "parentAllowSNU",
            "sessionPhase1Id",
            "source",
            "classeId",
            "etablissementId",
            "psc1Info",
            "roadCodeRefund",
            "frenchNationality",
            ...(user.role === ROLES.REFERENT_DEPARTMENT ? ["schoolName"] : []),
        ];
        const filters = Object.keys(filtersRaw).reduce(
            (acc, filterKey) => {
                if (allowedFilters.includes(filterKey)) {
                    acc[filterKey] = filtersRaw[filterKey];
                }
                return acc;
            },
            {} as Record<string, string | string[]>,
        );
        return filters;
    }
}
