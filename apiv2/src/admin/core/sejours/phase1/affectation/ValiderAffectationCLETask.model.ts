import { TaskModel } from "@task/core/Task.model";

import { ValiderAffectationCLEResult } from "./ValiderAffectationCLE";

export interface ValiderAffectationCLETaskParameters {
    sessionId: string;
    simulationTaskId: string;
    dateAffectation: Date;
}

export type ValiderAffectationCLETaskResult = Pick<ValiderAffectationCLEResult, "analytics"> & {
    rapportKey: string;
};

export type ValiderAffectationCLETaskModel = TaskModel<
    ValiderAffectationCLETaskParameters,
    ValiderAffectationCLETaskResult
>;
