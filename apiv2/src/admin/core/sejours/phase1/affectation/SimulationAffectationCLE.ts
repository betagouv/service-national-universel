import { Inject, Logger } from "@nestjs/common";

import { RegionsHorsMetropoleWithoutCorse, YOUNG_STATUS_PHASE1, department2region, MIME_TYPES } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { RapportData, SimulationAffectationCLEService, SimulationResultats } from "./SimulationAffectationCLE.service";

import { FileGateway } from "@shared/core/File.gateway";
import { SimulationAffectationCLETaskParameters } from "./SimulationAffectationCLETask.model";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";

export type SimulationAffectationCLEResult = {
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

export class SimulationAffectationCLE implements UseCase<SimulationAffectationCLEResult> {
    constructor(
        @Inject(SimulationAffectationCLEService)
        private readonly simulationAffectationCLEService: SimulationAffectationCLEService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(PointDeRassemblementGateway) private readonly pointDeRassemblementGateway: PointDeRassemblementGateway,
        private readonly logger: Logger,
    ) {}
    async execute({
        sessionId,
        departements,
        etranger,
    }: SimulationAffectationCLETaskParameters): Promise<SimulationAffectationCLEResult> {
        if (
            departements.some((departement) =>
                RegionsHorsMetropoleWithoutCorse.includes(department2region[departement]),
            )
        ) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_DEPARTEMENT_HORS_METROPOLE);
        }

        const { classeList, etablissementList, referentsList } =
            await this.simulationAffectationCLEService.loadAffectationData(sessionId, departements);

        this.logger.log(`Classes à affecter: ${classeList.length} (etablissements: ${etablissementList.length})`);

        const resultats: SimulationResultats = {
            jeunesList: [],
            jeunesDejaAffectedList: [],
            sejourList: [],
            ligneDeBusList: [],
            classeErreurList: [],
        };

        for (const classe of classeList) {
            if (!classe.sessionId || !classe.pointDeRassemblementId) {
                resultats.classeErreurList.push({
                    classe,
                    message: "Pas de session ou de point de rassemblement pour la classe",
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

            const ligneBus = await this.ligneDeBusGateway.findBySessionIdAndClasseId(sessionId, classe.id);
            if (!ligneBus) {
                resultats.classeErreurList.push({
                    classe,
                    jeunesNombre: jeunesList.length,
                    message: "Pas de bus trouvé",
                });
                continue;
            }

            if (!sejour || sejour.sessionId !== sessionId) {
                resultats.classeErreurList.push({
                    classe,
                    ligneBus,
                    jeunesNombre: jeunesList.length,
                    message: "Pas de session déclarée pour le centre",
                });
                continue;
            }

            let pointDeRassemblement: PointDeRassemblementModel | null = null;
            if (ligneBus.pointDeRassemblementIds.includes(classe.pointDeRassemblementId)) {
                pointDeRassemblement = await this.pointDeRassemblementGateway.findById(classe.pointDeRassemblementId);
            }
            if (!pointDeRassemblement) {
                resultats.classeErreurList.push({
                    message: "Pas de point de rassemblement déclaré pour la cohort",
                    classe,
                    ligneBus,
                    jeunesNombre: jeunesList.length,
                });
                continue;
            }

            // Gestion place dans le BUS
            if (
                !this.simulationAffectationCLEService.checkPlacesRestantesLigneBus(
                    resultats,
                    jeunesList,
                    classe,
                    sejour,
                    ligneBus,
                    pointDeRassemblement,
                )
            ) {
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
                    pointDeRassemblementId: pointDeRassemblement.id,
                    ligneDeBusId: ligneBus.id,
                    sejourId: sejour.id,
                    centreId: sejour.centreId,
                    statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
                });
            }
        }

        const rapportData = this.simulationAffectationCLEService.calculRapportAffectation(
            resultats.jeunesList,
            resultats.ligneDeBusList!,
            resultats.sejourList,
            resultats.classeErreurList,
            classeList,
            etablissementList,
            referentsList,
        );

        const fileBuffer = await this.simulationAffectationCLEService.generateRapportExcel(rapportData, "CLE");

        const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const fileName = `simulation-affectation-cle/affectation_simulation_cle_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/affectation/${sessionId}/${fileName}`,
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
