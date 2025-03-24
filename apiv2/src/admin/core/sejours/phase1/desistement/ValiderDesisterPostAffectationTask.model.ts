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
    CONFIRMATION_PARTICIPATION: "Confirmations de participation",
    CHANGEMENTS_SEJOUR: "Changements de séjour",
    DESITEMENT_PREALABLE: "Désistements préalables",
};
