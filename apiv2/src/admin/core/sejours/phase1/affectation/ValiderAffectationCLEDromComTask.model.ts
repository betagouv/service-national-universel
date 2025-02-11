import { TaskModel } from "@task/core/Task.model";

import { ValiderAffectationCLEDromComResult } from "./ValiderAffectationCLEDromCom";

export interface ValiderAffectationCLEDromComTaskParameters {
    sessionId: string;
    simulationTaskId: string;
    dateAffectation: Date;
}

export type ValiderAffectationCLEDromComTaskResult = Pick<ValiderAffectationCLEDromComResult, "analytics"> & {
    rapportKey: string;
};

export type ValiderAffectationCLEDromComTaskModel = TaskModel<
    ValiderAffectationCLEDromComTaskParameters,
    ValiderAffectationCLEDromComTaskResult
>;
