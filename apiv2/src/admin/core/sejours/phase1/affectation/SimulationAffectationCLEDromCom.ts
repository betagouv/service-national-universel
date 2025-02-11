import { Inject, Logger } from "@nestjs/common";

import { YOUNG_STATUS_PHASE1, department2region, MIME_TYPES, RegionsDromComEtCorse } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { RapportData, SimulationAffectationCLEService, SimulationResultats } from "./SimulationAffectationCLE.service";

import { FileGateway } from "@shared/core/File.gateway";
import { SimulationAffectationCLEDromComTaskParameters } from "./SimulationAffectationCLEDromComTask.model";

export type SimulationAffectationCLEDromComResult = {
    rapportData: RapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: {
        classes: number;
        jeunesAffected: number;
        erreurs: number;
    };
};

export class SimulationAffectationCLEDromCom implements UseCase<SimulationAffectationCLEDromComResult> {
    constructor(
        @Inject(SimulationAffectationCLEService)
        private readonly simulationAffectationCLEService: SimulationAffectationCLEService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly logger: Logger,
    ) {}
    async execute({
        sessionId,
        departements,
        etranger,
    }: SimulationAffectationCLEDromComTaskParameters): Promise<SimulationAffectationCLEDromComResult> {
        if (departements.some((departement) => !RegionsDromComEtCorse.includes(department2region[departement]))) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_DEPARTEMENT_HORS_METROPOLE);
        }

        const { classeList, etablissementList, referentsList } =
            await this.simulationAffectationCLEService.loadAffectationData(sessionId, departements);

        this.logger.log(`Classes à affecter: ${classeList.length} (etablissements: ${etablissementList.length})`);

        const resultats: SimulationResultats = {
            jeunesList: [],
            jeunesDejaAffectedList: [],
            sejourList: [],
            classeErreurList: [],
        };

        for (const classe of classeList) {
            if (!classe.sessionId) {
                resultats.classeErreurList.push({
                    classe,
                    message: "Pas de session pour la classe",
                });
                continue;
            }

            const { jeunesList, sejour } = await this.simulationAffectationCLEService.loadClasseData(
                sessionId,
                classe,
                Boolean(etranger),
            );

            if (jeunesList.length === 0) {
                resultats.classeErreurList.push({ classe, message: "Aucun volontaire non affecté trouvé" });
                continue;
            }

            if (!sejour || sejour.sessionId !== sessionId) {
                resultats.classeErreurList.push({
                    classe,
                    jeunesNombre: jeunesList.length,
                    message: "Pas de session déclarée pour le centre",
                });
                continue;
            }

            // Gestion place dans le centre (update resultats)
            if (
                !this.simulationAffectationCLEService.checkPlacesRestantesCentre(resultats, jeunesList, classe, sejour)
            ) {
                continue;
            }

            // affectation jeunes
            for (const jeune of jeunesList) {
                resultats.jeunesList.push({
                    ...jeune,
                    sejourId: sejour.id,
                    centreId: sejour.centreId,
                    statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                });
            }
        }

        const rapportData = this.simulationAffectationCLEService.calculRapportAffectation(
            resultats.jeunesList,
            [], // pas de bus pour les dromcom
            resultats.sejourList,
            resultats.classeErreurList,
            classeList,
            etablissementList,
            referentsList,
        );

        const fileBuffer = await this.simulationAffectationCLEService.generateRapportExcel(rapportData, "CLE_DROMCOM");

        const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const fileName = `simulation-affectation-cle-dromcom/affectation_simulation_cle-dromcom_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/affectation/simulation/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        return {
            analytics: {
                classes: classeList.length,
                jeunesAffected: resultats.jeunesList.length,
                erreurs: resultats.classeErreurList.length,
            },
            rapportData,
            rapportFile,
        };
    }
}
