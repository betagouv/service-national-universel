import { Inject, Logger } from "@nestjs/common";

import { RegionsHorsMetropole, YOUNG_STATUS, YOUNG_STATUS_PHASE1, department2region, MIME_TYPES } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import {
    Analytics,
    JeuneAffectationModel,
    RapportData,
    SimulationAffectationHTSService,
} from "./SimulationAffectationHTS.service";

import { SejourModel } from "../sejour/Sejour.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { CentreGateway } from "../centre/Centre.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { SimulationAffectationHTSTaskParameters } from "./SimulationAffectationHTSTask.model";
import { AffectationService } from "./Affectation.service";

// TODO: déplacer dans un paramétrage dynamique
const NB_MAX_ITERATION = 300;

export type SimulationAffectationHTSResult = {
    rapportData: RapportData;
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: Analytics;
    jeuneList: JeuneAffectationModel[];
    sejourList: SejourModel[];
    ligneDeBusList: LigneDeBusModel[];
};

export class SimulationAffectationHTS implements UseCase<SimulationAffectationHTSResult> {
    constructor(
        @Inject(AffectationService)
        private readonly affectationService: AffectationService,
        @Inject(SimulationAffectationHTSService)
        private readonly simulationAffectationHTSService: SimulationAffectationHTSService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(CentreGateway) private readonly centresGateway: CentreGateway,
        private readonly logger: Logger,
    ) {}
    async execute({
        sessionId,
        departements,
        niveauScolaires,
        sdrImportId,
        etranger,
    }: SimulationAffectationHTSTaskParameters): Promise<SimulationAffectationHTSResult> {
        if (departements.some((departement) => RegionsHorsMetropole.includes(department2region[departement]))) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_DEPARTEMENT_HORS_METROPOLE);
        }

        const { ligneDeBusList, sejoursList, pdrList } = await this.affectationService.loadAffectationData(sessionId);

        const centreList = await this.centresGateway.findBySessionId(sessionId);
        if (centreList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucun centres !");
        }
        let allJeunes = await this.jeuneGateway.findBySessionIdStatusNiveauScolairesAndDepartements(
            sessionId,
            YOUNG_STATUS.VALIDATED,
            niveauScolaires,
            departements,
        );
        if (!etranger) {
            allJeunes = allJeunes.filter((jeune) => jeune.paysScolarite === "FRANCE");
        }
        if (allJeunes.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucun jeune !");
        }

        const { changementDepartements, changementDepartementsErreurs } =
            await this.simulationAffectationHTSService.getChangementsDepartements(
                sdrImportId,
                centreList,
                pdrList,
                ligneDeBusList,
            );

        // on sépare les jeunes intra dep des autres
        const { jeunesList, jeuneIntraDepartementList } = allJeunes.reduce(
            (acc, jeune) => {
                if (
                    ["oui", "true"].includes(jeune.handicapMemeDepartement!) &&
                    jeune.statutPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION
                ) {
                    acc.jeuneIntraDepartementList.push(jeune as JeuneAffectationModel);
                } else {
                    const jeuneAaffecter = jeune as JeuneAffectationModel;
                    acc.jeunesList.push(jeuneAaffecter);
                }
                return acc;
            },
            { jeunesList: [] as JeuneAffectationModel[], jeuneIntraDepartementList: [] as JeuneAffectationModel[] },
        );

        this.logger.log(
            `Jeunes à affecter : ${allJeunes.length} (jeunes: ${jeunesList.length}, intradep: ${jeuneIntraDepartementList.length})`,
        );

        // On calcul les taux de repartition (garcon/fille, qpv+/qpv-, psh+/psh-)
        const ratioRepartition = this.simulationAffectationHTSService.computeRatioRepartition(jeunesList);

        // on recupere les jeunes que l on va devoir affecter
        const jeuneAttenteAffectationList = jeunesList.filter(
            ({ statutPhase1 }) => statutPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        );

        // on sépare pour chaque departement : les jeunes / pdr / lignes de bus / centre
        const distributionJeunesDepartement = this.simulationAffectationHTSService.calculDistributionAffectations(
            jeuneAttenteAffectationList,
            pdrList,
            ligneDeBusList,
            changementDepartements,
        );

        const results: Omit<SimulationAffectationHTSResult, "rapportData" | "rapportFile"> = {
            jeuneList: [],
            sejourList: [],
            ligneDeBusList: [],
            analytics: {
                selectedCost: 1e3,
                tauxRepartitionCentreList: [],
                centreIdList: [],
                tauxRemplissageCentreList: [],
                tauxOccupationLignesParCentreList: [],
                iterationCostList: [],
                jeunesNouvellementAffected: 0,
                jeuneAttenteAffectation: 0,
                jeunesDejaAffected: 0,
            },
        };

        const coutSimulationList = [1e3]; // infini
        for (let currentIterationNumber = 0; currentIterationNumber < NB_MAX_ITERATION; currentIterationNumber++) {
            this.logger.log(`Iteration : ${currentIterationNumber + 1} sur ${NB_MAX_ITERATION}`);

            /***
             * Calcul des affectations
             ***/
            const { randomJeuneList, randomSejourList, randomLigneDeBusList } =
                await this.simulationAffectationHTSService.affectationAleatoireDesJeunes(
                    distributionJeunesDepartement,
                    jeunesList,
                    sejoursList,
                    ligneDeBusList,
                    pdrList,
                );

            const tauxRepartitionCentres = this.simulationAffectationHTSService.calculTauxRepartitionParCentre(
                randomSejourList,
                randomJeuneList,
            );

            const {
                tauxRemplissageCentres,
                tauxOccupationLignesParCentreList,
                centreIdList: centreIdTmp,
            } = this.simulationAffectationHTSService.calculTauxRemplissageParCentre(
                randomSejourList,
                randomLigneDeBusList,
            );

            const coutSimulation = this.simulationAffectationHTSService.calculCoutSimulation(
                tauxRepartitionCentres,
                tauxRemplissageCentres,
                ratioRepartition,
            );

            results.analytics.iterationCostList.push(coutSimulation);

            const isCoherent = this.simulationAffectationHTSService.isPlacesRestantesCoherentes(
                randomLigneDeBusList,
                randomSejourList,
            );

            const jeunesAffectedCount = randomJeuneList.filter(
                (jeune) => jeune.statutPhase1 === YOUNG_STATUS_PHASE1.AFFECTED,
            ).length;
            // si la nouvelle simulation a un meilleur cout que la précedente, on la garde
            if (isCoherent && coutSimulation < coutSimulationList[coutSimulationList.length - 1]) {
                this.logger.log(`Better simulation found ${coutSimulation} (${jeunesAffectedCount} affectés)`);
                coutSimulationList.push(coutSimulation);

                // résultats de l'affectation
                results.jeuneList = JSON.parse(JSON.stringify(randomJeuneList));
                results.sejourList = JSON.parse(JSON.stringify(randomSejourList));
                results.ligneDeBusList = JSON.parse(JSON.stringify(randomLigneDeBusList));

                // statistiques (graphics)
                results.analytics.selectedCost = coutSimulation;
                results.analytics.centreIdList = centreIdTmp;
                results.analytics.tauxRepartitionCentreList = tauxRepartitionCentres;
                results.analytics.tauxRemplissageCentreList = tauxRemplissageCentres;
                results.analytics.tauxOccupationLignesParCentreList = tauxOccupationLignesParCentreList;
            } else {
                this.logger.debug(`Worth simulation cost ${coutSimulation} (${jeunesAffectedCount} affectés)`);
            }
        }

        if (results.analytics.selectedCost === 1e3) {
            throw new FunctionalException(
                FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                `Aucune simulation valide sur les ${NB_MAX_ITERATION} itérations`,
            );
        }

        // Calcul des données pour le rapport excel
        const rapportData = this.simulationAffectationHTSService.calculRapportAffectation(
            results.jeuneList,
            results.sejourList,
            results.ligneDeBusList,
            centreList,
            pdrList,
            jeunesList,
            jeuneIntraDepartementList,
            distributionJeunesDepartement,
            changementDepartements,
            changementDepartementsErreurs,
            results.analytics,
        );

        const fileBuffer = await this.simulationAffectationHTSService.generateRapportExcel(rapportData);

        const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const fileName = `simulation-affectation-hts/affectation_simulation_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/affectation/simulation/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
        );

        return {
            ...results,
            analytics: {
                ...results.analytics,
                jeunesNouvellementAffected: rapportData.jeunesNouvellementAffectedList.length,
                jeuneAttenteAffectation: rapportData.jeuneAttenteAffectationList.length,
                jeunesDejaAffected: rapportData.jeunesDejaAffectedList.length,
            },
            rapportData,
            rapportFile,
        };
    }
}
