import { TaskModel } from "@task/core/Task.model";
import { ValiderBasculeJeunesResult } from "./ValiderBasculeJeunes.service";

export interface ValiderBasculeJeunesValidesTaskParameters {
    sessionId: string;
    simulationTaskId: string;
    dateValidation: Date;
    sendEmail: boolean;
}

export type ValiderBasculeJeunesValidesTaskResult = Pick<ValiderBasculeJeunesResult, "analytics"> & {
    rapportKey: string;
};

export type ValiderBasculeJeunesValidesTaskModel = TaskModel<
    ValiderBasculeJeunesValidesTaskParameters,
    ValiderBasculeJeunesValidesTaskResult
>;
