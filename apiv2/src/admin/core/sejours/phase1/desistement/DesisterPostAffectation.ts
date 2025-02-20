import { Transactional } from "@nestjs-cls/transactional";
import { Inject, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { TaskGateway } from "@task/core/Task.gateway";

export type DesisterPostAffectationResult = {
    // rapportData: DesisterPostAffectationRapportData;
    // rapportFile: {
    //     Location: string;
    //     ETag: string;
    //     Bucket: string;
    //     Key: string;
    // };
    analytics: {
        jeunesDesistes: number;
        errors: number;
    };
};

export class DesisterPostAffectation implements UseCase<DesisterPostAffectationResult> {
    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly logger: Logger,
    ) {}
    @Transactional()
    async execute({
        sessionId,
        affectationTaskId,
    }: {
        sessionId: string;
        affectationTaskId: string;
    }): Promise<DesisterPostAffectationResult> {
        this.logger.debug(`DesisterPostAffectation: sessionId=${sessionId}, affectationTaskId=${affectationTaskId}`);
        // throw new Error("Method not implemented.");
        // Chercher le rapport de l'affectation
        const affectationTask = await this.taskGateway.findById(affectationTaskId);
        if (!affectationTask) {
            throw new Error(`Affectation task not found: ${affectationTaskId}`);
        }
        const rapportKey = affectationTask.metadata?.parameters.rapportKey;
        if (!rapportKey) {
            throw new Error("Rapport key not found in task metadata");
        }
        const rapportFile = await this.fileGateway.downloadFile(rapportKey);
        if (!rapportFile) {
            throw new Error(`Rapport file not found: ${rapportKey}`);
        }
        // Préparer la query basée sur les ids du rapport et le statut phase 1

        // Modifier le statut

        // Persister les modifications (ajouter un booléan pour toggle preview/confirm)

        // Préparer les données pour le rapport
        const analytics = {
            jeunesDesistes: 0,
            errors: 0,
        };
        return { analytics };
    }
}
