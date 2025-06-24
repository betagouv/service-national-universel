import { Job } from "bullmq";
import { TaskName } from "snu-lib";

import { Injectable } from "@nestjs/common";
import { TaskQueue } from "@shared/infra/Queue";
import { TaskModel } from "@task/core/Task.model";

import { ExporterMissionCanditatures } from "@admin/core/engagement/mission/ExporterMissionCanditatures";
import { ExporterMissions } from "@admin/core/engagement/mission/ExporterMissions";

@Injectable()
export class AdminTaskEngagementSelectorService {
    constructor(
        private readonly exporterMissionCanditatures: ExporterMissionCanditatures,
        private readonly exporterMissions: ExporterMissions,
    ) {}
    async handleEngagement(job: Job<TaskQueue, any, TaskName>, task: TaskModel): Promise<Record<string, any>> {
        let results = {} as Record<string, any>;
        switch (job.name) {
            case TaskName.MISSION_EXPORT_CANDIDATURES:
                const exportResult = await this.exporterMissionCanditatures.execute(task.metadata!.parameters!);
                results = {
                    rapportKey: exportResult.rapportFile.Key,
                    ...exportResult.analytics,
                };
                break;

            case TaskName.MISSION_EXPORT:
                const missionsExportResult = await this.exporterMissions.execute(task.metadata!.parameters!);
                results = {
                    rapportKey: missionsExportResult.rapportFile.Key,
                    ...missionsExportResult.analytics,
                };
                break;

            default:
                throw new Error(`Task of type ${job.name} not handle yet for engagement`);
        }
        return results;
    }
}
