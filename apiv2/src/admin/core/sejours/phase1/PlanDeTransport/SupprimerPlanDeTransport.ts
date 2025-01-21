import { Inject, Injectable, Logger } from "@nestjs/common";

import { SessionGateway } from "../session/Session.gateway";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";

import { PlanDeTransportGateway } from "./PlanDeTransport.gateway";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ClasseGateway } from "../../cle/classe/Classe.gateway";
import { Transactional } from "@nestjs-cls/transactional";
import { SegmentDeLigneGateway } from "../segmentDeLigne/SegmentDeLigne.gateway";
import { DemandeModificationLigneDeBusGateway } from "../demandeModificationLigneDeBus/DemandeModificationLigneDeBus.gateway";
import { ClsService } from "nestjs-cls";

@Injectable()
export class SupprimerPlanDeTransport {
    constructor(
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(PlanDeTransportGateway) private readonly planDeTransportGateway: PlanDeTransportGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(SegmentDeLigneGateway) private readonly segmentDeLigneGateway: SegmentDeLigneGateway,
        @Inject(DemandeModificationLigneDeBusGateway)
        private readonly demandeModificationLigneDeBusGateway: DemandeModificationLigneDeBusGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        private readonly cls: ClsService,
        private readonly logger: Logger,
    ) {}

    @Transactional()
    async execute(sessionId: string) {
        const session = await this.sessionGateway.findById(sessionId);
        if (!session) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "sessionId");
        }
        const ligneBusList = await this.ligneDeBusGateway.findBySessionNom(session.nom);
        const ligneBusIdList = ligneBusList.map((bus) => bus.id);

        const segmentDeLigneList = await this.segmentDeLigneGateway.findByLigneDeBusIds(ligneBusIdList);
        const classeList = await this.classeGateway.findByLigneDeBusIds(ligneBusIdList);
        const demandeDeModifList = await this.demandeModificationLigneDeBusGateway.findBySessionNom(session.nom);
        const planDeTransportList = await this.planDeTransportGateway.findBySessionNom(session.nom);

        this.logger.log(
            `[deletePlanDeTransport] ligneDeBus: ${ligneBusList.length}, LigneToPoint: ${segmentDeLigneList.length}, classes: ${classeList.length}, DemandeDeModif: ${demandeDeModifList.length}, planDeTransport: ${planDeTransportList.length}`,
        );

        if (planDeTransportList.length !== ligneBusList.length) {
            this.logger.warn(`LigneBus not found, ${planDeTransportList.length} !== ${ligneBusList.length}`);
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
        for (const ligneBus of ligneBusList) {
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

        this.cls.set("user", null);
    }
}
