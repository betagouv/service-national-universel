import { TaskModel } from "@task/core/Task.model";

import { ValiderAffectationHTSResult } from "./ValiderAffectationHTS";

export interface ValiderAffectationHTSTaskParameters {
    sessionId: string;
    simulationTaskId: string;
    affecterPDR: boolean;
    dateAffectation: Date;
}

export type ValiderAffectationHTSTaskResult = Pick<ValiderAffectationHTSResult, "analytics"> & {
    rapportKey: string;
};

export type ValiderAffectationHTSTaskModel = TaskModel<
    ValiderAffectationHTSTaskParameters,
    ValiderAffectationHTSTaskResult
>;
