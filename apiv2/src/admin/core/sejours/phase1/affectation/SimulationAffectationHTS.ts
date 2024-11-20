import { Inject } from "@nestjs/common";

import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

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
import { JeuneModel } from "../../jeune/Jeune.model";

const NB_MAX_ITERATION = 10;

type SimulationAffectationHTSResult = {
    rapportData: RapportData;
    analytics: Analytics;
    jeuneList: JeuneAffectationModel[];
    sejourList: SejourModel[];
    ligneDeBusList: LigneDeBusModel[];
};

export class SimulationAffectationHTS implements UseCase<SimulationAffectationHTSResult> {
    constructor(
        @Inject(SimulationAffectationHTSService)
        private readonly simulationAffectationHTSService: SimulationAffectationHTSService,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(PointDeRassemblementGateway) private readonly pointDeRassemblementGateway: PointDeRassemblementGateway,
        @Inject(SejourGateway) private readonly sejoursGateway: SejourGateway,
        @Inject(CentreGateway) private readonly centresGateway: CentreGateway,
    ) {}
    async execute({ sessionId }: { sessionId: string }): Promise<SimulationAffectationHTSResult> {
        /***
         * Chargement des données associés à la session
         ***/
        const ligneDeBusList = await this.ligneDeBusGateway.findBySessionId(sessionId);
        if (ligneDeBusList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        const sejoursList = await this.sejoursGateway.findBySessionId(sessionId);
        if (sejoursList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        const pdrList = await this.pointDeRassemblementGateway.findBySessionId(sessionId);
        if (pdrList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        const centreList = await this.centresGateway.findBySessionId(sessionId);
        if (centreList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }
        const allJeunes = await this.jeuneGateway.findBySessionIdAndStatusForDepartementMetropole(
            sessionId,
            YOUNG_STATUS.VALIDATED,
        );
        if (allJeunes.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND);
        }

        // on sépare les jeunes intra dep des autres
        const { jeunesList, jeuneIntraDepartementList } = allJeunes.reduce(
            (acc, jeune) => {
                if (
                    jeune.handicapInSameDepartment === "oui" &&
                    jeune.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION
                ) {
                    acc.jeuneIntraDepartementList.push(jeune);
                } else {
                    acc.jeunesList.push(jeune);
                }
                return acc;
            },
            { jeunesList: [] as JeuneModel[], jeuneIntraDepartementList: [] as JeuneModel[] },
        );

        // On calcul les taux de repartition (garcon/fille, qpv+/qpv-, psh+/psh-) -> voir methode computeRepartitionCohort dans costFunction.py (computeRepartitionCohort)
        const ratioRepartition = this.simulationAffectationHTSService.computeRatioRepartition(jeunesList);

        // on recupere les jeunes que l on va devoir affecter
        const jeuneAttenteAffectationList = jeunesList.filter(
            ({ statusPhase1 }) => statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        );

        /***
         * Calcul des affectations
         ***/
        const distributionJeunes = this.simulationAffectationHTSService.calculDistributionAffectations(
            jeuneAttenteAffectationList,
            pdrList,
            ligneDeBusList,
        );

        let indexes: {
            meeting_points_index: {
                [key: string]: string[];
            };
        } = {
            meeting_points_index: ligneDeBusList.reduce((acc, ligneDeBus) => {
                acc[ligneDeBus.id] = ligneDeBus.pointDeRassemblementIds;
                return acc;
            }, {}),
        };

        const results: Omit<SimulationAffectationHTSResult, "rapportData"> = {
            analytics: {
                selectedCost: [],
                tauxRepartitionCentreList: [],
                centreIdList: [],
                tauxRemplissageCentreList: [],
                tauxOccupationLignesParCentreList: [],
                iterationCostList: [],
            },
            jeuneList: [],
            sejourList: [],
            ligneDeBusList: [],
        };

        let validCostList = [1e3]; // infini
        for (let currentIterationNumber = 0; currentIterationNumber < NB_MAX_ITERATION; currentIterationNumber++) {
            console.log("Iteration : ", currentIterationNumber + 1, " sur ", NB_MAX_ITERATION);

            // coeur du traitement
            const { randomJeuneList, randomSejourList, randomLigneDeBusList } =
                await this.simulationAffectationHTSService.randomAffectation(
                    distributionJeunes,
                    jeunesList,
                    sejoursList,
                    ligneDeBusList,
                    indexes,
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

            const currentCost = this.simulationAffectationHTSService.computeCost(
                tauxRepartitionCentres,
                tauxRemplissageCentres,
                ratioRepartition,
            );

            results.analytics.iterationCostList.push(currentCost);

            const isSafe = this.simulationAffectationHTSService.isRemainingSeatSafe(
                randomLigneDeBusList,
                randomSejourList,
            );

            // si la nouvelle simulation a un meilleur cout que la précedente, on la garde
            if (isSafe && currentCost < validCostList[validCostList.length - 1]) {
                console.log("Better simulation found", currentCost);
                validCostList.push(currentCost);
                results.analytics.selectedCost = [currentCost];
                results.analytics.centreIdList = centreIdTmp;

                // analytics (graphics)
                results.analytics.tauxRepartitionCentreList = tauxRepartitionCentres;
                results.analytics.tauxRemplissageCentreList = tauxRemplissageCentres;
                results.analytics.tauxOccupationLignesParCentreList = tauxOccupationLignesParCentreList;

                results.jeuneList = JSON.parse(JSON.stringify(randomJeuneList));
                results.sejourList = JSON.parse(JSON.stringify(randomSejourList));
                results.ligneDeBusList = JSON.parse(JSON.stringify(randomLigneDeBusList));
            }
        }

        ///
        // Calcul des résultats
        ///
        // const results: Omit<SimulationAffectationHTSResult, "rapportData"> = {
        //     analytics: {
        //         selectedCost: validCostList.slice(1),
        //         validTauxRepartitionCentreList,
        //         centreIdList,
        //         validTauxRemplissageCentreList,
        //         validTauxOccupationLignesParCentreList,
        //         iterationCostList,
        //     },
        //     jeuneList: resulatJeunesList,
        //     sejourList: resultatSejourList,
        //     ligneDeBusList: resultatLigneDeBusList,
        // };

        const rapportData = this.simulationAffectationHTSService.computeRapport(
            results.jeuneList,
            results.sejourList,
            results.ligneDeBusList,
            centreList,
            pdrList,
            jeunesList,
            jeuneIntraDepartementList,
            results.analytics,
        );

        return {
            ...results,
            rapportData,
        };
    }
}
