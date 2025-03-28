import { Inject, Injectable, Logger } from "@nestjs/common";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { JeuneModel } from "../../jeune/Jeune.model";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SessionGateway } from "../session/Session.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { SejourModel } from "../sejour/Sejour.model";
import { TaskGateway } from "@task/core/Task.gateway";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";
import { PlanDeTransportModel } from "../PlanDeTransport/PlanDeTransport.model";
import { PointDeRassemblementModel } from "../pointDeRassemblement/PointDeRassemblement.model";

@Injectable()
export class AffectationService {
    constructor(
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(PlanDeTransportGateway) private readonly planDeTransportGateway: PlanDeTransportGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(PointDeRassemblementGateway) private readonly pointDeRassemblementGateway: PointDeRassemblementGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly logger: Logger,
    ) {}

    // Chargement des données associés à la session
    async loadAffectationData(sessionId: string, withTransport = true) {
        const session = await this.sessionGateway.findById(sessionId);
        if (!session) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "sessionId");
        }

        const sejoursList = await this.sejourGateway.findBySessionId(sessionId);
        if (sejoursList.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucun sejours !");
        }
        let ligneDeBusList: LigneDeBusModel[] = [];
        let pdrList: PointDeRassemblementModel[] = [];
        if (withTransport) {
            // TODO: utiliser cohortId (actuellement non présent en base sur les ligne de bus)
            ligneDeBusList = await this.ligneDeBusGateway.findBySessionNom(session.nom);
            if (ligneDeBusList.length === 0) {
                throw new FunctionalException(
                    FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA,
                    "Aucune ligne de bus !",
                );
            }

            // Les PDR ne sont plus rattachés à une session
            const pdrIds = [...new Set(ligneDeBusList.flatMap((ligne) => ligne.pointDeRassemblementIds))];
            pdrList = await this.pointDeRassemblementGateway.findByIds(pdrIds);
            if (pdrList.length === 0) {
                throw new FunctionalException(FunctionalExceptionCode.AFFECTATION_NOT_ENOUGH_DATA, "Aucun PDRs !");
            }
        }

        return {
            session,
            sejoursList,
            ligneDeBusList,
            pdrList,
        };
    }

    mapAffectationJeune(
        jeune: JeuneModel,
        sejour: SejourModel,
        donneesComplementaire: Partial<JeuneModel> = {},
    ): JeuneModel {
        return {
            ...jeune,
            centreId: sejour.centreId,
            sejourId: sejour.id,
            statutPhase1: YOUNG_STATUS_PHASE1.AFFECTED,
            statut: YOUNG_STATUS.VALIDATED,
            // specific (DOM/TOM, metropole, ...)
            ...donneesComplementaire,
            //Clean le reste
            deplacementPhase1Autonomous: undefined,
            presenceArrivee: undefined,
            presenceJDM: undefined,
            departInform: undefined,
            departSejourAt: undefined,
            departSejourMotif: undefined,
            departSejourMotifComment: undefined,
            youngPhase1Agreement: "false",
        };
    }

    async syncPlacesDisponiblesLignesDeBus(ligneDeBusList: LigneDeBusModel[]) {
        const lignesDeBusUpdatedList: LigneDeBusModel[] = [];
        const pdtUpdatedList: PlanDeTransportModel[] = [];

        const ligneDeBusIds = ligneDeBusList.map((ligne) => ligne.id);
        const pdtList = await this.planDeTransportGateway.findByIds(ligneDeBusIds);
        const ligneDeBusPlacesOccupeesJeunesList =
            await this.ligneDeBusGateway.countPlaceOccupeesByLigneDeBusIds(ligneDeBusIds);

        for (const ligneDeBus of ligneDeBusList) {
            const placesOccupeesJeunes = ligneDeBusPlacesOccupeesJeunesList.find(({ id }) => id === ligneDeBus.id)
                ?.placesOccupeesJeunes;
            if (placesOccupeesJeunes === undefined) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_ENOUGH_DATA,
                    `Calcul du nombre de places occupées impossible pour la ligne de bus ${ligneDeBus.id} !`,
                );
            }
            const pdt = pdtList.find((pdt) => pdt.id === ligneDeBus.id);

            if (
                placesOccupeesJeunes &&
                (ligneDeBus.placesOccupeesJeunes !== placesOccupeesJeunes || !pdt?.tauxRemplissageLigne)
            ) {
                this.logger.log(
                    `Updating ligneDeBus ${ligneDeBus.numeroLigne} ${ligneDeBus.id} (${placesOccupeesJeunes} => ${ligneDeBus.placesOccupeesJeunes} | ${pdt?.tauxRemplissageLigne})`,
                );
                ligneDeBus.placesOccupeesJeunes = placesOccupeesJeunes;
                lignesDeBusUpdatedList.push(ligneDeBus);

                // Do the same update with planTransport
                if (pdt) {
                    pdt.placesOccupeesJeunes = placesOccupeesJeunes;
                    if (pdt.capaciteJeunes) {
                        pdt.tauxRemplissageLigne = Math.floor((placesOccupeesJeunes / pdt.capaciteJeunes) * 100);
                    } else {
                        this.logger.error(`No capaciteJeunes for pdtId ${pdt.id} ${pdt.capaciteJeunes}`);
                    }
                    pdtUpdatedList.push(pdt);
                } else {
                    this.logger.error(`PDT does not exist for ligneDeBusId ${ligneDeBus.id}`);
                }
            } else {
                this.logger.warn(
                    `No update needed for ligneDeBus ${ligneDeBus.numeroLigne} ${ligneDeBus.id} (${placesOccupeesJeunes} == ${ligneDeBus.placesOccupeesJeunes})`,
                );
            }
        }

        await this.ligneDeBusGateway.bulkUpdate(lignesDeBusUpdatedList);
        await this.planDeTransportGateway.bulkUpdate(pdtUpdatedList);
    }

    async syncPlacesDisponiblesSejours(sejourList: SejourModel[]) {
        const sejourUpdatedList: SejourModel[] = [];

        const sejourIds = sejourList.map((sejour) => sejour.id);
        const sejourPlacesOccupeesJeunesList = await this.sejourGateway.countPlaceOccupeesBySejourIds(sejourIds);
        for (const sejour of sejourList) {
            const placesOccupeesJeunes = sejourPlacesOccupeesJeunesList.find(({ id }) => id === sejour.id)
                ?.placesOccupeesJeunes;
            if (placesOccupeesJeunes === undefined) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_ENOUGH_DATA,
                    `Calcul du nombre de places occupées impossible pour le sejour ${sejour.id} ${sejour.centreNom} !`,
                );
            }
            const placesRestantes = (sejour.placesTotal || 0) - placesOccupeesJeunes;
            if (placesRestantes >= 0) {
                this.logger.log(`Updating sejour ${sejour.id} ${sejour.centreNom} (${placesRestantes})`);
                sejour.placesRestantes = placesRestantes;
                sejourUpdatedList.push(sejour);
            } else {
                this.logger.warn(
                    `No update needed for sejour ${sejour.id} ${sejour.centreNom} (${placesRestantes} == ${sejour.placesRestantes})`,
                );
            }
        }

        await this.sejourGateway.bulkUpdate(sejourUpdatedList);
    }

    formatPourcent(value: number): string {
        if (!value && value !== 0) {
            return "";
        }
        return (value * 100).toFixed(2) + "%";
    }

    parsePourcent(value: string): number | null {
        if (!value) {
            return null;
        }
        const pourcent = parseFloat(value.replaceAll("%", ""));
        return Math.floor(pourcent * 100) / 10000;
    }
}
