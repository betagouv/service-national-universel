import { TaskModel } from "@task/core/Task.model";

import { DesisterPostAffectationResult } from "./DesisterPostAffectation";

export interface DesisterPostAffectationTaskParameters {
    sessionId: string;
    affectationTaskId: string;
    dateAffectation: Date;
}

export type DesisterPostAffectationTaskResult = Pick<DesisterPostAffectationResult, "analytics"> & {
    rapportKey: string;
};

export type DesisterPostAffectationTaskModel = TaskModel<
    DesisterPostAffectationTaskParameters,
    DesisterPostAffectationTaskResult
>;
