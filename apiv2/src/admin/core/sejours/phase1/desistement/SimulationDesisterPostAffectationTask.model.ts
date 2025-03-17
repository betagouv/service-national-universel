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

export type JeuneTraitementDesistementRapport = Pick<
    JeuneModel,
    | "sessionNom"
    | "id"
    | "prenom"
    | "nom"
    | "email"
    | "genre"
    | "region"
    | "departement"
    | "statut"
    | "statutPhase1"
    | "sessionId"
    | "centreId"
    | "pointDeRassemblementId"
    | "ligneDeBusId"
    | "parent1Nom"
    | "parent1Prenom"
    | "parent1Email"
    | "parent2Nom"
    | "parent2Prenom"
    | "parent2Email"
    | "youngPhase1Agreement"
>;

export type RapportData = {
    jeunesNonConfirmes: JeuneSimulationDesistementRapport[];
    jeunesConfirmes: JeuneSimulationDesistementRapport[];
    jeunesAutreSession: JeuneSimulationDesistementRapport[];
    jeunesDesistes: JeuneSimulationDesistementRapport[];
};

export const RAPPORT_SHEETS_SIMULATION = {
    RESUME: "Résumé",
    A_DESITER: "A désister",
    CONFIRMATION_PARTICIPATION: "Confirmations de participation",
    CHANGEMENTS_SEJOUR: "Changements de séjour",
    DESITEMENT_PREALABLE: "Desistements préalables",
};

export const RAPPORT_SHEETS_TRAITEMENT = {
    RESUME: "Résumé",
    A_DESITER: "Jeunes désistés",
    CONFIRMATION_PARTICIPATION: "ont confirmé leur séjour",
    CHANGEMENTS_SEJOUR: "ont changé de séjour",
    DESITEMENT_PREALABLE: "se sont désistés en amont",
};
