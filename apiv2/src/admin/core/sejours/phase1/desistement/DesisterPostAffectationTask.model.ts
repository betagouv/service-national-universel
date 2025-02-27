import { TaskModel } from "@task/core/Task.model";
import { DesisterTaskResult } from "snu-lib";

export interface DesisterPostAffectationTaskParameters {
    sessionId: string;
    affectationTaskId: string;
    dateAffectation: Date;
}

export type DesisterPostAffectationTaskModel = TaskModel<DesisterPostAffectationTaskParameters, DesisterTaskResult>;
