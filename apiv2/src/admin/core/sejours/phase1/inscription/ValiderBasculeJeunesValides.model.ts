import { TaskModel } from "@task/core/Task.model";

import { ValiderBasculeJeunesValidesResult } from "./ValiderBasculeJeunesValides";

export interface ValiderBasculeJeunesValidesTaskParameters {
    sessionId: string;
    simulationTaskId: string;
    dateValidation: Date;
    sendEmail: boolean;
}

export type ValiderBasculeJeunesValidesTaskResult = Pick<ValiderBasculeJeunesValidesResult, "analytics"> & {
    rapportKey: string;
};

export type ValiderBasculeJeunesValidesTaskModel = TaskModel<
    ValiderBasculeJeunesValidesTaskParameters,
    ValiderBasculeJeunesValidesTaskResult
>;
