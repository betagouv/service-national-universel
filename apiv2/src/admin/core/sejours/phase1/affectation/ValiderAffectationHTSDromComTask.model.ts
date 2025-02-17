import { TaskModel } from "@task/core/Task.model";

import { ValiderAffectationHTSDromComResult } from "./ValiderAffectationHTSDromCom";

export interface ValiderAffectationHTSDromComTaskParameters {
    sessionId: string;
    simulationTaskId: string;
    dateAffectation: Date;
}

export type ValiderAffectationHTSDromComTaskResult = Pick<ValiderAffectationHTSDromComResult, "analytics"> & {
    rapportKey: string;
};

export type ValiderAffectationHTSDromComTaskModel = TaskModel<
    ValiderAffectationHTSDromComTaskParameters,
    ValiderAffectationHTSDromComTaskResult
>;
