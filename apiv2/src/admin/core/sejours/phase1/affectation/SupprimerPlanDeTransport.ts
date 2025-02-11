import { Inject, Injectable, Logger } from "@nestjs/common";

import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";

import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ClasseGateway } from "../../cle/classe/Classe.gateway";
import { Transactional } from "@nestjs-cls/transactional";
import { SegmentDeLigneGateway } from "../segmentDeLigne/SegmentDeLigne.gateway";
import { DemandeModificationLigneDeBusGateway } from "../demandeModificationLigneDeBus/DemandeModificationLigneDeBus.gateway";
import { ClsService } from "nestjs-cls";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { YOUNG_STATUS_PHASE1 } from "snu-lib";
import { JeuneModel } from "../../jeune/Jeune.model";
import { AffectationService } from "./Affectation.service";
import { SejourGateway } from "../sejour/Sejour.gateway";

@Injectable()
export class SupprimerPlanDeTransport {
    constructor(
        @Inject(PlanDeTransportGateway) private readonly planDeTransportGateway: PlanDeTransportGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(SegmentDeLigneGateway) private readonly segmentDeLigneGateway: SegmentDeLigneGateway,
        @Inject(AffectationService)
        private readonly affectationService: AffectationService,
        @Inject(SejourGateway)
        private readonly sejoursGateway: SejourGateway,
        @Inject(JeuneGateway)
        private readonly jeuneGateway: JeuneGateway,
        @Inject(DemandeModificationLigneDeBusGateway)
        private readonly demandeModificationLigneDeBusGateway: DemandeModificationLigneDeBusGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        private readonly cls: ClsService,
        private readonly logger: Logger,
    ) {}

    @Transactional()
    async execute(sessionId: string) {
        const { session, ligneDeBusList, sejoursList } = await this.affectationService.loadAffectationData(sessionId);

        const ligneBusIdList = ligneDeBusList.map((bus) => bus.id);

        const segmentDeLigneList = await this.segmentDeLigneGateway.findByLigneDeBusIds(ligneBusIdList);
        const classeList = await this.classeGateway.findByLigneDeBusIds(ligneBusIdList);
        const demandeDeModifList = await this.demandeModificationLigneDeBusGateway.findBySessionNom(session.nom);
        const planDeTransportList = await this.planDeTransportGateway.findBySessionNom(session.nom);

        this.logger.log(
            `[deletePlanDeTransport] ligneDeBus: ${ligneDeBusList.length}, LigneToPoint: ${segmentDeLigneList.length}, classes: ${classeList.length}, DemandeDeModif: ${demandeDeModifList.length}, planDeTransport: ${planDeTransportList.length}`,
        );

        if (planDeTransportList.length !== ligneDeBusList.length) {
            this.logger.warn(`LigneBus not found, ${planDeTransportList.length} !== ${ligneDeBusList.length}`);
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "planDeTransport");
        }

        this.cls.set("user", { firstName: `Suppression PDT ${session.nom}` });

        //remove all LigneToPoint
        for (const segmentDeLigne of segmentDeLigneList) {
            this.logger.log(`remove ligne to point ${segmentDeLigne.id}`);
            await this.segmentDeLigneGateway.delete(segmentDeLigne);
        }

        //remove all link with classes
        for (const classe of classeList) {
            this.logger.log(`remove classe ${classe.id} ligneId`);
            classe.ligneId = undefined;
            await this.classeGateway.update(classe);
        }

        //remove all LigneBus
        for (const ligneBus of ligneDeBusList) {
            this.logger.log(`remove ligne bus ${ligneBus.id}`);
            await this.ligneDeBusGateway.delete(ligneBus);
        }

        // remove all PlanDeTransport
        for (const plan of planDeTransportList) {
            this.logger.log(`remove plan de transport ${plan.id}`);
            await this.planDeTransportGateway.delete(plan);
        }

        // //remove all DemandeDeModif
        for (const demande of demandeDeModifList) {
            this.logger.log(`remove demande de modif ${demande.id}`);
            await this.demandeModificationLigneDeBusGateway.delete(demande);
        }

        const jeunesList = await this.jeuneGateway.findBySessionId(session.id);
        const jeunesUpdatedList: JeuneModel[] = [];
        for (const jeune of jeunesList) {
            if (jeune.statutPhase1 === YOUNG_STATUS_PHASE1.AFFECTED) {
                const sejour = sejoursList.find((sejour) => sejour.id === jeune.sejourId);
                if (!sejour) {
                    this.logger.warn(`🚩 sejour introuvable: ${jeune.sejourId} (jeune: ${jeune.id})`);
                    throw new FunctionalException(
                        FunctionalExceptionCode.NOT_ENOUGH_DATA,
                        `sejour non trouvé ${jeune.sejourId} (jeune: ${jeune.id})`,
                    );
                }

                jeune.statutPhase1 = YOUNG_STATUS_PHASE1.WAITING_AFFECTATION;
                jeune.pointDeRassemblementId = undefined;
                jeune.ligneDeBusId = undefined;
                jeune.hasPDR = undefined;
                jeune.centreId = undefined;
                jeune.sejourId = undefined;
                jeune.transportInfoGivenByLocal = undefined;
                jeune.deplacementPhase1Autonomous = undefined;
                jeune.presenceArrivee = undefined;
                jeune.presenceJDM = undefined;
                jeune.departInform = undefined;
                jeune.departSejourAt = undefined;
                jeune.departSejourMotif = undefined;
                jeune.departSejourMotifComment = undefined;
                jeune.youngPhase1Agreement = "false";

                jeunesUpdatedList.push(jeune);

                sejour.placesRestantes = (sejour.placesRestantes || 0) + 1;
            }
        }
        if (jeunesUpdatedList.length > 0) {
            this.logger.log(`Désaffectation des jeunes ${jeunesUpdatedList.length}`);
            await this.jeuneGateway.bulkUpdate(jeunesUpdatedList);

            // mise à jour des placesRestantes dans les centres
            this.logger.log(`Mise à jour des places dans les séjours`);
            await this.sejoursGateway.bulkUpdate(sejoursList);

            // pas de mise à jour des placesOccupeesJeunes dans les bus car supprimées
        }

        this.cls.set("user", null);

        return {
            ligneBusIdCount: ligneBusIdList.length,
            segmentDeLigneCount: segmentDeLigneList.length,
            classeCount: classeList.length,
            demandeDeModifCount: demandeDeModifList.length,
            planDeTransportCount: planDeTransportList.length,
            jeunesUpdatedCount: jeunesUpdatedList.length,
        };
    }
}
