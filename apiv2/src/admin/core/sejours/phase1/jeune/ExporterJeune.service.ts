import { ReferentModel } from "@admin/core/iam/Referent.model";
import { Injectable } from "@nestjs/common";
import { getYoungFieldsHiddenFrom, ROLES } from "snu-lib";

export const EXPORT_JEUNE_FOLDER = "file/admin/sejours/phase1/jeune/export";

@Injectable()
export class ExporterJeuneService {
    constructor() {}

    /**
     * Un export « scolarisés » porte sur UN périmètre géographique : soit des départements,
     * soit une région, et uniquement dans le périmètre de l'appelant.
     */
    isExportScolariseAllowed(user: Partial<ReferentModel>, departement?: string[], region?: string): boolean {
        const parDepartement = !!departement?.length;
        const parRegion = !!region;

        // Exactement l'un des deux.
        if (parDepartement === parRegion) {
            return false;
        }

        if (user.role === ROLES.ADMIN) {
            return true;
        }

        if (parDepartement) {
            return (
                user.role === ROLES.REFERENT_DEPARTMENT && departement!.every((dep) => user.departement?.includes(dep))
            );
        }

        return user.role === ROLES.REFERENT_REGION && region === user.region;
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
        // Les champs qu'un rôle ne peut pas voir en colonne ne doivent pas non plus être
        // filtrables : sinon un filtre `handicap=true` révèle la donnée même colonne masquée (PH22).
        const hiddenFields = getYoungFieldsHiddenFrom(user);
        const filters = Object.keys(filtersRaw).reduce(
            (acc, filterKey) => {
                if (allowedFilters.includes(filterKey) && !hiddenFields.includes(filterKey)) {
                    acc[filterKey] = filtersRaw[filterKey];
                }
                return acc;
            },
            {} as Record<string, string | string[]>,
        );
        return filters;
    }
}
