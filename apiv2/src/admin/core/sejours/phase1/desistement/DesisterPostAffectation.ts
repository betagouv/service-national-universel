import { Inject, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { DesistementService } from "./Desistement.service";

export type DesisterPostAffectationResult = {
    // TODO: Rapport
    // rapportData: DesisterPostAffectationRapportData;
    // rapportFile: {
    //     Location: string;
    //     ETag: string;
    //     Bucket: string;
    //     Key: string;
    // };
    analytics: {
        jeunesDesistes: number;
    };
};

export class DesisterPostAffectation implements UseCase<DesisterPostAffectationResult> {
    constructor(
        private readonly DesistementService: DesistementService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(JeuneGateway) private readonly jeuneGateway: JeuneGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        private readonly logger: Logger,
    ) {}
    async execute({
        sessionId,
        affectationTaskId,
    }: {
        sessionId: string;
        affectationTaskId: string;
    }): Promise<DesisterPostAffectationResult> {
        const ids = await this.DesistementService.getJeunesADesisterIdsFromTask(affectationTaskId);
        const jeunesADesister = await this.DesistementService.getJeunesADesister(sessionId, ids);
        const jeunesDesistes = await this.DesistementService.desisterJeunes(jeunesADesister);
        // TODO: Rapport
        const analytics = { jeunesDesistes };
        return { analytics };
    }
}
