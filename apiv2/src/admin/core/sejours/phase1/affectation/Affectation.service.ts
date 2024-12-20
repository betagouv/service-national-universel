import { Inject, Injectable, Logger } from "@nestjs/common";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

import { JeuneModel } from "../../jeune/Jeune.model";
import { PointDeRassemblementGateway } from "../pointDeRassemblement/PointDeRassemblement.gateway";
import { SessionGateway } from "../session/Session.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { TaskName, TaskStatus, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { SejourModel } from "../sejour/Sejour.model";
import { TaskGateway } from "@task/core/Task.gateway";
import { LigneDeBusModel } from "../ligneDeBus/LigneDeBus.model";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";

@Injectable()
export class AffectationService {
    constructor(
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(PlanDeTransportGateway) private readonly planDeTransportGateway: PlanDeTransportGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(PointDeRassemblementGateway) private readonly pointDeRassemblementGateway: PointDeRassemblementGateway,
        @Inject(SejourGateway) private readonly sejoursGateway: SejourGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly logger: Logger,
    ) {}

    async getStatusSimulation(sessionId: string) {
        const simulations = await this.taskGateway.findByNames(
            [TaskName.AFFECTATION_HTS_SIMULATION],
            {
                "metadata.parameters.sessionId": sessionId,
            },
            "DESC",
            1,
        );
        return {
            status: simulations?.[0]?.status || "NONE",
        };
    }

    async getStatusValidation(sessionId: string) {
        const lastTraitement = (
            await this.taskGateway.findByNames(
                [TaskName.AFFECTATION_HTS_SIMULATION_VALIDER],
                {
                    "metadata.parameters.sessionId": sessionId,
                },
                "DESC",
                1,
            )
        )?.[0];
        const lastTraitementCompleted = (
            await this.taskGateway.findByNames(
                [TaskName.AFFECTATION_HTS_SIMULATION_VALIDER],
                {
                    status: TaskStatus.COMPLETED,
                    "metadata.parameters.sessionId": sessionId,
                },
                "DESC",
                1,
            )
        )?.[0];
        return {
            status: lastTraitement?.status || "NONE",
            lastCompletedAt: lastTraitementCompleted?.updatedAt,
        };
    }

    // Chargement des données associés à la session
    async loadAffectationData(sessionId: string) {
        const session = await this.sessionGateway.findById(sessionId);
        if (!session) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "sessionId");
        }

        // TODO: utiliser cohortId (actuellement non présent en base sur les ligne de bus)
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
        return {
            session,
            ligneDeBusList,
            sejoursList,
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
            cohesionStayPresence: undefined,
            presenceJDM: undefined,
            departInform: undefined,
            departSejourAt: undefined,
            departSejourMotif: undefined,
            departSejourMotifComment: undefined,
            youngPhase1Agreement: "false",
        };
    }

    async syncPlaceDisponiblesLigneDeBus(ligneDeBus: LigneDeBusModel): Promise<LigneDeBusModel> {
        const placesOccupeesJeunes = await this.jeuneGateway.countAffectedByLigneDeBus(ligneDeBus.id);

        if (ligneDeBus.placesOccupeesJeunes !== placesOccupeesJeunes) {
            ligneDeBus.placesOccupeesJeunes = placesOccupeesJeunes;
            this.ligneDeBusGateway.update(ligneDeBus);

            // Do the same update with planTransport
            const pdt = await this.planDeTransportGateway.findById(ligneDeBus.id);
            pdt.placesOccupeesJeunes = placesOccupeesJeunes;
            if (pdt.capaciteJeunes) {
                pdt.lineFillingRate = Math.floor((placesOccupeesJeunes / pdt.capaciteJeunes) * 100);
            }
            await this.planDeTransportGateway.update(pdt);
        }
        return ligneDeBus;
    }
}
