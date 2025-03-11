import { TaskModel } from "@task/core/Task.model";
import { DesisterValiderTaskResult } from "snu-lib";

export interface ValiderDesisterPostAffectationTaskParameters {
    sessionId: string;
    desistementTaskId: string;
}

export type ValiderDesisterPostAffectationTaskModel = TaskModel<
    ValiderDesisterPostAffectationTaskParameters,
    DesisterValiderTaskResult
>;
