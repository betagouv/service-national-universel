import { TaskModel } from "@task/core/Task.model";
import { ValiderBasculeJeunesResult } from "./ValiderBasculeJeunes.service";

export interface ValiderBasculeJeunesNonValidesTaskParameters {
    sessionId: string;
    simulationTaskId: string;
    dateValidation: Date;
    sendEmail: boolean;
}

export type ValiderBasculeJeunesNonValidesTaskResult = Pick<ValiderBasculeJeunesResult, "analytics"> & {
    rapportKey: string;
};

export type ValiderBasculeJeunesNonValidesTaskModel = TaskModel<
    ValiderBasculeJeunesNonValidesTaskParameters,
    ValiderBasculeJeunesNonValidesTaskResult
>;
