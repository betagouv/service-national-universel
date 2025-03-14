import { Inject, Injectable, Logger } from "@nestjs/common";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { PreviewDesisterTaskResult, TaskStatus, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { FileGateway } from "@shared/core/File.gateway";
import { ValiderAffectationRapportData } from "../affectation/ValiderAffectationHTS";
import { JeuneModel } from "../../jeune/Jeune.model";
import { Transactional } from "@nestjs-cls/transactional";
import { ClsService } from "nestjs-cls";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { EmailTemplate, EmailWithMessage } from "@notification/core/Notification";
import { JeuneService } from "../../jeune/Jeune.service";
import { TaskGateway } from "@task/core/Task.gateway";
import { AffectationService } from "../affectation/Affectation.service";
import { LigneDeBusGateway } from "../ligneDeBus/LigneDeBus.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";

export type StatusDesistement = {
    status: TaskStatus | "NONE";
    lastCompletedAt: Date;
};

export type JeuneFilteredForDesistementExport = Pick<
    JeuneModel,
    | "id"
    | "email"
    | "prenom"
    | "nom"
    | "statut"
    | "statutPhase1"
    | "sessionNom"
    | "region"
    | "departement"
    | "sessionId"
    | "youngPhase1Agreement"
>;

@Injectable()
export class DesistementService {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        private readonly cls: ClsService,
        private readonly jeuneService: JeuneService,
        private readonly affectationService: AffectationService,
    ) {}

    async getJeunesIdsFromRapportKey(key: string): Promise<string[]> {
        const affectationFile = await this.fileGateway.downloadFile(key);
        if (!affectationFile) throw new Error(`Rapport file not found: ${key}`);

        const parsedAffectationFile = await this.fileGateway.parseXLS<ValiderAffectationRapportData[0]>(
            affectationFile.Body,
        );
        return parsedAffectationFile.map((row) => row.id);
    }

    @Transactional()
    async desisterJeunes(jeunes: JeuneModel[], sessionId: string): Promise<number> {
        const list: JeuneModel[] = [];
        for (const jeune of jeunes) {
            list.push({
                ...jeune,
                statut: YOUNG_STATUS.WITHDRAWN,
                statutPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
                desistementMotif: "Non confirmation de la participation au séjour",
                // reset des informations d'affectation
                centreId: undefined,
                sejourId: undefined,
                pointDeRassemblementId: undefined,
                ligneDeBusId: undefined,
                hasPDR: undefined,
                transportInfoGivenByLocal: undefined,
                deplacementPhase1Autonomous: undefined,
                presenceArrivee: undefined,
                presenceJDM: undefined,
                departInform: undefined,
                departSejourAt: undefined,
                departSejourMotif: undefined,
                departSejourMotifComment: undefined,
            });
        }
        this.cls.set("user", { firstName: "Traitement - Désistement après affectation" });
        const res = await this.jeuneGateway.bulkUpdate(list);
        this.cls.set("user", null);

        const lignesDeBusIds = [
            ...new Set(jeunes.map((jeune) => jeune.ligneDeBusId).filter((id): id is string => !!id)),
        ];
        if (lignesDeBusIds.length > 0) {
            const lignesDeBus = await this.ligneDeBusGateway.findByIds(lignesDeBusIds);
            await this.affectationService.syncPlacesDisponiblesLignesDeBus(lignesDeBus);
        }

        const sejours = await this.sejourGateway.findBySessionId(sessionId);
        await this.affectationService.syncPlacesDisponiblesSejours(sejours);

        return res;
    }

    async notifierJeunes(jeunes: JeuneModel[]) {
        const templateId = EmailTemplate.DESISTEMENT_PAR_TIERS;
        const message = "Non confirmation de la participation au séjour";
        for await (const jeune of jeunes) {
            // jeune
            await this.notificationGateway.sendEmail<EmailWithMessage>(
                {
                    to: [{ email: jeune.email, name: `${jeune.prenom} ${jeune.nom}` }],
                    message,
                },
                templateId,
            );
            // RL 1
            if (jeune.parent1Email) {
                await this.notificationGateway.sendEmail<EmailWithMessage>(
                    {
                        to: [{ email: jeune.parent1Email, name: `${jeune.prenom} ${jeune.nom}` }],
                        message,
                    },
                    templateId,
                );
            }
            // RL 2
            if (jeune.parent2Email) {
                await this.notificationGateway.sendEmail<EmailWithMessage>(
                    {
                        to: [{ email: jeune.parent2Email, name: `${jeune.prenom} ${jeune.nom}` }],
                        message,
                    },
                    templateId,
                );
            }
        }
    }

    async preview({
        sessionId,
        affectationTaskId,
    }: {
        sessionId: string;
        affectationTaskId: string;
    }): Promise<PreviewDesisterTaskResult> {
        const affectationTask = await this.taskGateway.findById(affectationTaskId);
        if (!affectationTask) {
            throw new Error("Affectation task not found");
        }
        const ids = await this.getJeunesIdsFromRapportKey(affectationTask.metadata?.results.rapportKey);
        const jeunes = await this.jeuneGateway.findByIds(ids);
        const groups = this.jeuneService.groupJeunesByReponseAuxAffectations(jeunes, sessionId);
        return Object.entries(groups).reduce(
            (acc, [key, value]) => {
                acc[key] = this.filterFields(value);
                return acc;
            },
            {
                jeunesNonConfirmes: [] as JeuneFilteredForDesistementExport[],
                jeunesConfirmes: [] as JeuneFilteredForDesistementExport[],
                jeunesAutreSession: [] as JeuneFilteredForDesistementExport[],
                jeunesDesistes: [] as JeuneFilteredForDesistementExport[],
            },
        );
    }

    filterFields(jeunes: JeuneModel[]): JeuneFilteredForDesistementExport[] {
        return jeunes.map((jeune) => ({
            id: jeune.id,
            email: jeune.email,
            prenom: jeune.prenom,
            nom: jeune.nom,
            statut: jeune.statut,
            statutPhase1: jeune.statutPhase1,
            sejour: jeune.sessionNom,
            region: jeune.region,
            departement: jeune.departement,
            sessionId: jeune.sessionId,
            youngPhase1Agreement: jeune.youngPhase1Agreement,
        }));
    }
}
