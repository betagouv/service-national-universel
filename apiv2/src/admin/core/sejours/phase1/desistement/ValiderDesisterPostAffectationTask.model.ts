import { TaskModel } from "@task/core/Task.model";
import { DesisterValiderTaskResult } from "snu-lib";

export interface ValiderDesisterPostAffectationTaskParameters {
    sessionId: string;
    simulationTaskId: string;
}

export type ValiderDesisterPostAffectationTaskModel = TaskModel<
    ValiderDesisterPostAffectationTaskParameters,
    DesisterValiderTaskResult
>;

export const RAPPORT_SHEETS_TRAITEMENT = {
    RESUME: "Résumé",
    DESISTES: "Jeunes désistés",
    CONFIRMATION_PARTICIPATION: "ont confirmé leur séjour",
    CHANGEMENTS_SEJOUR: "ont changé de séjour",
    DESITEMENT_PREALABLE: "se sont désistés en amont",
};
