import { Inject, Injectable, Logger } from "@nestjs/common";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskStatus, YOUNG_STATUS } from "snu-lib";
import { FileGateway } from "@shared/core/File.gateway";
import { ValiderAffectationRapportData } from "../affectation/ValiderAffectationHTS";
import { JeuneModel } from "../../jeune/Jeune.model";
import { Transactional } from "@nestjs-cls/transactional";
import { ClsService } from "nestjs-cls";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { EmailTemplate, EmailWithMessage } from "@notification/core/Notification";

export type StatusDesistement = {
    status: TaskStatus | "NONE";
    lastCompletedAt: Date;
};

@Injectable()
export class DesistementService {
    constructor(
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        private readonly cls: ClsService,
        private readonly logger: Logger,
    ) {}

    async getJeunesIdsFromTask(taskId: string): Promise<string[]> {
        const task = await this.taskGateway.findById(taskId);
        if (!task) throw new Error(`Affectation task not found: ${taskId}`);

        const key = task.metadata?.results.rapportKey;
        if (!key) throw new Error("Rapport key not found in task metadata");

        const file = await this.fileGateway.downloadFile(key);
        if (!file) throw new Error(`Rapport file not found: ${key}`);

        const parsedFile = await this.fileGateway.parseXLS<ValiderAffectationRapportData[0]>(file.Body);
        return parsedFile.map((row) => row.id);
    }

    groupJeunesByCategories(jeunes: JeuneModel[], sessionId: string) {
        return jeunes.reduce(
            (acc, jeune) => {
                if (jeune.sessionId !== sessionId) {
                    acc.jeunesAutreSession.push(jeune);
                } else if (jeune.statut === YOUNG_STATUS.WITHDRAWN) {
                    acc.jeunesDesistes.push(jeune);
                } else if (jeune.youngPhase1Agreement === "true") {
                    acc.jeunesConfirmes.push(jeune);
                } else if (
                    jeune.statut === YOUNG_STATUS.VALIDATED &&
                    (jeune.youngPhase1Agreement === "false" || !jeune.youngPhase1Agreement)
                ) {
                    acc.jeunesNonConfirmes.push(jeune);
                }
                return acc;
            },
            {
                jeunesAutreSession: [] as JeuneModel[],
                jeunesDesistes: [] as JeuneModel[],
                jeunesConfirmes: [] as JeuneModel[],
                jeunesNonConfirmes: [] as JeuneModel[],
            },
        );
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
        console.log("🚀 ~ DesistementService ~ notifierJeunes ~ jeunes:", jeunes.length);
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
}
