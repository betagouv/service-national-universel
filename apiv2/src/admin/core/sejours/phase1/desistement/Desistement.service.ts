import { Inject, Injectable, Logger } from "@nestjs/common";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { DesisterTaskResult, TaskStatus, YOUNG_STATUS } from "snu-lib";
import { FileGateway } from "@shared/core/File.gateway";
import { ValiderAffectationRapportData } from "../affectation/ValiderAffectationHTS";
import { JeuneModel } from "../../jeune/Jeune.model";
import { Transactional } from "@nestjs-cls/transactional";
import { ClsService } from "nestjs-cls";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { EmailTemplate, EmailWithMessage } from "@notification/core/Notification";
import { JeuneService } from "../../jeune/Jeune.service";
import { TaskGateway } from "@task/core/Task.gateway";

export type StatusDesistement = {
    status: TaskStatus | "NONE";
    lastCompletedAt: Date;
};

@Injectable()
export class DesistementService {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        private readonly cls: ClsService,
        private readonly jeuneService: JeuneService,
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
    async desisterJeunes(jeunes: JeuneModel[]): Promise<number> {
        const list: JeuneModel[] = [];
        for (const jeune of jeunes) {
            list.push({
                ...jeune,
                statut: YOUNG_STATUS.WITHDRAWN,
                desistementMotif: "Vous n’avez pas confirmé votre participation au séjour",
            });
        }
        this.cls.set("user", { firstName: "Traitement - Désistement après affectation" });
        const res = await this.jeuneGateway.bulkUpdate(list);
        this.cls.set("user", null);
        return res;
    }

    async notifierJeunes(jeunes: JeuneModel[]) {
        const templateId = EmailTemplate.DESISTEMENT_PAR_TIERS;
        const message = "Vous n’avez pas confirmé votre participation au séjour";
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
    }): Promise<DesisterTaskResult> {
        const affectationTask = await this.taskGateway.findById(affectationTaskId);
        if (!affectationTask) {
            throw new Error("Affectation task not found");
        }
        const ids = await this.getJeunesIdsFromRapportKey(affectationTask.metadata?.results.rapportKey);
        const jeunes = await this.jeuneGateway.findByIds(ids);
        const { jeunesAutreSession, jeunesConfirmes, jeunesDesistes, jeunesNonConfirmes } =
            this.jeuneService.groupJeunesByReponseAuxAffectations(jeunes, sessionId);
        return {
            jeunesDesistes: jeunesDesistes.length,
            jeunesAutreSession: jeunesAutreSession.length,
            jeunesConfirmes: jeunesConfirmes.length,
            jeunesNonConfirmes: jeunesNonConfirmes.length,
        };
    }
}
