/**
 * Liste blanche des filtres de l'export jeunes (PH22, volet oracle).
 *
 * GOO-11 retire les champs de santé et de pièce d'identité des réponses données aux
 * structures d'accueil (RESPONSIBLE, SUPERVISOR). Retirer la seule colonne ne suffit pas :
 * `getAllowedFilters` laissait ces rôles filtrer sur `handicap=true`, ce qui révèle la donnée
 * même quand la colonne est masquée.
 */
import { ROLES } from "snu-lib";

import { ExporterJeuneService } from "./ExporterJeune.service";

describe("ExporterJeuneService.getAllowedFilters", () => {
    const service = new ExporterJeuneService();

    const filtresSensibles = {
        handicap: "true",
        allergies: "true",
        ppsBeneficiary: "true",
        paiBeneficiary: "true",
        specificAmenagment: "true",
        reducedMobilityAccess: "true",
        handicapInSameDepartment: "true",
        CNIFileNotValidOnStart: "true",
        cohort: "2023",
    };

    it.each([[ROLES.RESPONSIBLE], [ROLES.SUPERVISOR]])(
        "retire les filtres de santé et d'identité pour %s",
        (role) => {
            const filtres = service.getAllowedFilters(filtresSensibles, { role });

            expect(filtres).toEqual({ cohort: "2023" });
        },
    );

    it.each([[ROLES.ADMIN], [ROLES.REFERENT_DEPARTMENT], [ROLES.REFERENT_REGION]])(
        "conserve les filtres de santé et d'identité pour %s",
        (role) => {
            const filtres = service.getAllowedFilters(filtresSensibles, { role });

            expect(filtres).toEqual(filtresSensibles);
        },
    );
});
