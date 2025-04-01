import { Inject, Injectable, Logger } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";

import { YOUNG_STATUS_PHASE1 } from "snu-lib";

import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";

import { PlanDeTransportGateway } from "../PlanDeTransport/PlanDeTransport.gateway";

import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ClasseGateway } from "../../cle/classe/Classe.gateway";
import { SegmentDeLigneGateway } from "../segmentDeLigne/SegmentDeLigne.gateway";
import { DemandeModificationLigneDeBusGateway } from "../demandeModificationLigneDeBus/DemandeModificationLigneDeBus.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { JeuneModel } from "../../jeune/Jeune.model";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SessionGateway } from "../session/Session.gateway";
import { AffectationService } from "./Affectation.service";

@Injectable()
export class SupprimerLigneDeBus {
    constructor(
        private readonly affectationService: AffectationService,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(PlanDeTransportGateway) private readonly planDeTransportGateway: PlanDeTransportGateway,
        @Inject(SegmentDeLigneGateway) private readonly segmentDeLigneGateway: SegmentDeLigneGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(SejourGateway)
        private readonly sejoursGateway: SejourGateway,
        @Inject(JeuneGateway)
        private readonly jeuneGateway: JeuneGateway,
        @Inject(DemandeModificationLigneDeBusGateway)
        private readonly demandeModificationLigneDeBusGateway: DemandeModificationLigneDeBusGateway,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        private readonly logger: Logger,
    ) {}

    @Transactional()
    async execute(sessionId: string, ligneId: string) {
        const ligneDeBus = await this.ligneDeBusGateway.findById(ligneId);
        if (ligneDeBus.sessionId !== sessionId) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                `ligne de bus non trouvée pour la session ${sessionId}`,
            );
        }
        const sejour = await this.sejoursGateway.findById(ligneDeBus.sejourId);
        if (!sejour) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                `sejour non trouvé pour la session ${sessionId}`,
            );
        }
        const session = await this.sessionGateway.findById(sessionId);
        const segmentDeLigneList = await this.segmentDeLigneGateway.findByLigneDeBusIds([ligneDeBus.id]);
        const classeList = await this.classeGateway.findByLigneDeBusIds([ligneDeBus.id]);
        const demandeDeModifList = await this.demandeModificationLigneDeBusGateway.findByLigneDeBusIds([ligneDeBus.id]);
        const planDeTransport = await this.planDeTransportGateway.findById(ligneDeBus.id);

        this.logger.log(
            `[deleteLigneDeBus] ligneDeBus ${ligneDeBus.numeroLigne}, session: ${session.nom}, LigneToPoint: ${
                segmentDeLigneList.length
            }, classes: ${classeList.length}, DemandeDeModif: ${demandeDeModifList.length}, planDeTransport: ${
                planDeTransport ? "true" : "false"
            }`,
        );

        // controles de base
        if (!planDeTransport) {
            this.logger.warn(`planDeTransport not found, ${ligneDeBus.id}`);
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, `planDeTransport ${ligneDeBus.id}`);
        }

        // gestion des cas particuliers d'une ligne
        if (ligneDeBus.ligneFusionneeNumerosLignes.length > 0) {
            this.logger.warn(`ligneDeBus ${ligneDeBus.id} is linked to other lignes`);
            const ligneFusionnees = await this.ligneDeBusGateway.findByNumerosLignesAndSessionId(
                ligneDeBus.ligneFusionneeNumerosLignes,
                session.id,
            );
            if (ligneFusionnees.length !== ligneDeBus.ligneFusionneeNumerosLignes.length) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_FOUND,
                    `lignes fusionnées ${ligneDeBus.ligneFusionneeNumerosLignes} => ${ligneFusionnees.map(
                        (ligneFusionnee) => ligneFusionnee.id,
                    )}`,
                );
            }
            for (const ligneFusionnee of ligneFusionnees) {
                ligneFusionnee.ligneFusionneeNumerosLignes = ligneFusionnee.ligneFusionneeNumerosLignes.filter(
                    (numeroLigne) => numeroLigne !== ligneDeBus.numeroLigne,
                );
                if (
                    ligneFusionnee.ligneFusionneeNumerosLignes.length === 1 &&
                    ligneFusionnee.ligneFusionneeNumerosLignes[0] === ligneFusionnee.numeroLigne
                ) {
                    ligneFusionnee.ligneFusionneeNumerosLignes = [];
                }
                await this.ligneDeBusGateway.update(ligneFusionnee);
            }
        }

        if (ligneDeBus.ligneMiroirNumeroLigne) {
            this.logger.warn(`ligneDeBus ${ligneDeBus.id} is linked to other lignes`);
            const ligneMirroirs = await this.ligneDeBusGateway.findByNumerosLignesAndSessionId(
                [ligneDeBus.ligneMiroirNumeroLigne],
                session.id,
            );
            if (ligneMirroirs.length !== 1) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_FOUND,
                    `ligne miroir ${ligneDeBus.ligneMiroirNumeroLigne} => ${ligneMirroirs.map((l) => l.id)}`,
                );
            }
            const ligneMirroir = ligneMirroirs[0];
            ligneMirroir.ligneMiroirNumeroLigne = undefined;
            await this.ligneDeBusGateway.update(ligneMirroir);
        }

        /*
         * Gestion des clés étrangères
         */

        // suppression des LigneToPoint
        for (const segmentDeLigne of segmentDeLigneList) {
            this.logger.log(`remove ligne to point ${segmentDeLigne.id}`);
            await this.segmentDeLigneGateway.delete(segmentDeLigne);
        }

        // suppression du plan de transport
        this.logger.log(`remove plan de transport ${planDeTransport.id}`);
        await this.planDeTransportGateway.delete(planDeTransport);

        // suppression des demandes de modification
        for (const demande of demandeDeModifList) {
            this.logger.log(`remove demande de modif ${demande.id}`);
            await this.demandeModificationLigneDeBusGateway.delete(demande);
        }

        // suppression des liens avec les classes
        for (const classe of classeList) {
            this.logger.log(`remove classe ${classe.id} ligneId`);
            classe.ligneId = undefined;
            await this.classeGateway.update(classe);
        }

        /*
         * Désaffectation des jeunes
         */
        const jeunesList = await this.jeuneGateway.findByLigneDeBusIds([ligneDeBus.id]);
        const jeunesUpdatedList: JeuneModel[] = [];
        for (const jeune of jeunesList) {
            if (jeune.statutPhase1 === YOUNG_STATUS_PHASE1.AFFECTED) {
                if (sejour.id !== jeune.sejourId) {
                    this.logger.warn(`🚩 sejour incoherent: ${jeune.sejourId} (jeune: ${jeune.id})`);
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
            await this.affectationService.syncPlacesDisponiblesSejours([sejour]);

            // pas de mise à jour des placesOccupeesJeunes dans les bus car supprimées
        }

        // suppression de la ligne de bus
        this.logger.log(`suppression de la ligne de bus ${ligneDeBus.id}`);
        await this.ligneDeBusGateway.delete(ligneDeBus);

        return {
            ligneBusIdCount: 1,
            planDeTransportCount: 1,
            segmentDeLigneCount: segmentDeLigneList.length,
            classeCount: classeList.length,
            demandeDeModifCount: demandeDeModifList.length,
            jeunesUpdatedCount: jeunesUpdatedList.length,
        };
    }
}
