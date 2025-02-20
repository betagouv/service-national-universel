import { Inject, Injectable, Logger } from "@nestjs/common";
import { SessionGateway } from "../session/Session.gateway";
import { JeuneGateway } from "../../jeune/Jeune.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { TaskGateway } from "@task/core/Task.gateway";
import { TaskStatus, YOUNG_STATUS_PHASE1 } from "snu-lib";
import { FileGateway } from "@shared/core/File.gateway";
import { ValiderAffectationRapportData } from "../affectation/ValiderAffectationHTS";
import { JeuneModel } from "../../jeune/Jeune.model";
import { Transactional } from "@nestjs-cls/transactional";
import { ClsService } from "nestjs-cls";

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
        private readonly cls: ClsService,
        private readonly logger: Logger,
    ) {}

    async getJeunesADesisterIdsFromTask(affectationTaskId: string): Promise<string[]> {
        const affectationTask = await this.taskGateway.findById(affectationTaskId);
        if (!affectationTask) {
            throw new Error(`Affectation task not found: ${affectationTaskId}`);
        }
        const rapportKey = affectationTask.metadata?.results.rapportKey;
        if (!rapportKey) {
            throw new Error("Rapport key not found in task metadata");
        }
        const rapportFile = await this.fileGateway.downloadFile(rapportKey);
        if (!rapportFile) {
            throw new Error(`Rapport file not found: ${rapportKey}`);
        }
        const rapportXLSX = await this.fileGateway.parseXLS<ValiderAffectationRapportData[0]>(rapportFile.Body);
        return rapportXLSX.map((row) => row.id);
    }

    async getJeunesADesister(sessionId: string, arrayOfIds: string[]): Promise<JeuneModel[]> {
        return this.jeuneGateway.findByIdsSessionIdStatutPhase1AndConfirmationDeLaParticipation(
            arrayOfIds,
            sessionId,
            YOUNG_STATUS_PHASE1.AFFECTED,
            false,
        );
    }

    @Transactional()
    async desisterJeunes(jeunesADesister: JeuneModel[]): Promise<number> {
        const jeunesToDesisterList: JeuneModel[] = [];
        for (const jeune of jeunesADesister) {
            jeunesToDesisterList.push({
                ...jeune,
                statutPhase1: YOUNG_STATUS_PHASE1.WITHDRAWN,
            });
        }
        this.cls.set("user", { firstName: "Script de désistement automatique des volontaires" });
        const jeunesDesistes = await this.jeuneGateway.bulkUpdate(jeunesToDesisterList);
        this.cls.set("user", null);
        return jeunesDesistes;
    }
}
