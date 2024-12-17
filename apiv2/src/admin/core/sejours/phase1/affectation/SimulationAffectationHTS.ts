import { Inject, Logger } from "@nestjs/common";

import { RegionsHorsMetropole, YOUNG_STATUS, YOUNG_STATUS_PHASE1, GRADES, department2region } from "snu-lib";

import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { JeuneGateway } from "../../jeune/Jeune.gateway";
import {
    Analytics,
    JeuneAffectationModel,
    RapportData,
    SimulationAffectationHTSService,
} from "./SimulationAffectationHTS.service";

import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SejourModel } from "../sejour/Sejour.model";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { CentreGateway } from "../centre/Centre.gateway";
import { SessionGateway } from "../session/Session.gateway";
import { FileGateway } from "@shared/core/File.gateway";
import { SimulationAffectationHTSTaskParameters } from "./SimulationAffectationHTSTask.model";

const NB_MAX_ITERATION = 100;

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
        @Inject(SimulationAffectationHTSService)
        private readonly simulationAffectationHTSService: SimulationAffectationHTSService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(PointDeRassemblementGateway) private readonly pointDeRassemblementGateway: PointDeRassemblementGateway,
        @Inject(SejourGateway) private readonly sejoursGateway: SejourGateway,
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

        const session = await this.sessionGateway.findById(sessionId);
        if (!session) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "sessionId");
        }

        // Chargement des données associés à la session
        // TODO: utiliser cohortId (actuellement non présent en base sur les lige de bus)
        const ligneDeBusList = await this.ligneDeBusGateway.findBySessionNom(session.nom);
        if (ligneDeBusList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucune ligne de bus !");
        }
        const sejoursList = await this.sejoursGateway.findBySessionId(sessionId);
        if (sejoursList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucun sejours !");
        }
        // Les PDR ne sont plus rattachés à une session
        const pdrIds = [...new Set(ligneDeBusList.flatMap((ligne) => ligne.pointDeRassemblementIds))];
        const pdrList = await this.pointDeRassemblementGateway.findByIds(pdrIds);
        if (pdrList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucun PDRs !");
        }
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

        const changementDepartements = await this.simulationAffectationHTSService.getChangementsDepartements(
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

            // si la nouvelle simulation a un meilleur cout que la précedente, on la garde
            if (isCoherent && coutSimulation < coutSimulationList[coutSimulationList.length - 1]) {
                this.logger.log(`Better simulation found ${coutSimulation}`);
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
            }
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
            changementDepartements,
            results.analytics,
        );

        const fileBuffer = await this.simulationAffectationHTSService.generateRapportExcel(rapportData);

        const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
        const fileName = `simulation-affectation-hts/affectation_simulation_${sessionId}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/affectation/simulation/${sessionId}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
