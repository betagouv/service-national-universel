import { TaskModel } from "@task/core/Task.model";
import { DesisterSimulationTaskResult } from "snu-lib";
import { JeuneModel } from "../../jeune/Jeune.model";

export interface SimulationDesisterPostAffectationTaskParameters {
    sessionId: string;
    affectationTaskId: string;
    dateAffectation: Date;
}

export type SimulationDesisterPostAffectationTaskModel = TaskModel<
    SimulationDesisterPostAffectationTaskParameters,
    DesisterSimulationTaskResult
>;

export type JeuneSimulationDesistementRapport = Pick<
    JeuneModel,
    | "id"
    | "email"
    | "prenom"
    | "nom"
    | "statut"
    | "statutPhase1"
    | "sessionNom"
    | "region"
    | "departement"
    | "sessionId"
    | "youngPhase1Agreement"
>;

export type RapportData = {
    jeunesNonConfirmes: JeuneSimulationDesistementRapport[];
    jeunesConfirmes: JeuneSimulationDesistementRapport[];
    jeunesAutreSession: JeuneSimulationDesistementRapport[];
    jeunesDesistes: JeuneSimulationDesistementRapport[];
};

export const RAPPORT_SHEETS = {
    RESUME: "Résumé",
    A_DESITER: "A désister",
    CONFIRMATION_PARTICIPATION: "Confirmations de participation",
    CHANGEMENTS_SEJOUR: "Changements de séjour",
    DESITEMENT_PREALABLE: "Desistements préalables",
};
