import { Inject, Injectable, Logger } from "@nestjs/common";

import { getDepartmentForEligibility, getRegionForEligibility, TaskName, TaskStatus } from "snu-lib";
import { TaskGateway } from "@task/core/Task.gateway";
import { JeuneModel } from "../../jeune/Jeune.model";
import { SessionModel } from "../session/Session.model";
import { SessionGateway } from "../session/Session.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";

@Injectable()
export class InscriptionService {
    constructor(
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        private readonly logger: Logger,
    ) {}

    async getStatusSimulation(sessionId: string, taskName: TaskName) {
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

    async getStatusValidation(sessionId: string, taskName: TaskName) {
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

    async getSessionsEligible(jeune: JeuneModel): Promise<SessionModel[]> {
        if (!jeune.sessionId) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_IMPLEMENTED_YET);
        }
        const session = await this.sessionGateway.findById(jeune.sessionId);

        // TODO: reprendre la fonction getFilteredSessions de l'api v1
        // const cohorts = await this.sessionGateway.find({
        //     status: COHORT_STATUS.PUBLISHED
        //     cohortGroupId: session.cohortGroupId,
        //     _id: { $ne: session.id },
        // });
        // const region = getRegionForEligibility(young);
        // const department = getDepartmentForEligibility(young);
        return [];
    }
}
