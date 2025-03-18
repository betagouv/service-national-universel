import { Inject, Injectable } from "@nestjs/common";
import { TaskGateway } from "@task/core/Task.gateway";

import { TaskName, TaskStatus } from "snu-lib";

export type StatusSimulation = {
    status: TaskStatus | "NONE";
};

export type StatusValidation = {
    status: TaskStatus | "NONE";
    lastCompletedAt: Date;
};

@Injectable()
export class Phase1Service {
    constructor(@Inject(TaskGateway) private readonly taskGateway: TaskGateway) {}

    async getStatusSimulation(sessionId: string, taskName: TaskName): Promise<StatusSimulation> {
        const simulations = await this.taskGateway.findByNames(
            [taskName],
            {
                "metadata.parameters.sessionId": sessionId,
            },
            "DESC",
            1,
        );
        return {
            status: simulations?.[0]?.status || "NONE",
        };
    }

    async getStatusValidation(sessionId: string, taskName: TaskName): Promise<StatusValidation> {
        const lastTraitement = (
            await this.taskGateway.findByNames(
                [taskName],
                {
                    "metadata.parameters.sessionId": sessionId,
                },
                "DESC",
                1,
            )
        )?.[0];
        const lastTraitementCompleted = (
            await this.taskGateway.findByNames(
                [taskName],
                {
                    status: TaskStatus.COMPLETED,
                    "metadata.parameters.sessionId": sessionId,
                },
                "DESC",
                1,
            )
        )?.[0];
        return {
            status: lastTraitement?.status || "NONE",
            lastCompletedAt: lastTraitementCompleted?.updatedAt,
        };
    }
}
