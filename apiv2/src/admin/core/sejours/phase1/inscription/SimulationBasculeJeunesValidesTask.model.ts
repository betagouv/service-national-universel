import { TaskModel } from "@task/core/Task.model";
import { JeuneModel } from "../../jeune/Jeune.model";

export interface SimulationBasculeJeunesValidesTaskParameters {
    sessionId: string;
    status: string[];
    statusPhase1: string[];
    cohesionStayPresence: boolean;
    statusPhase1Motif: string[];
    niveauScolaires: string[];
    departements: string[];
    etranger: boolean;
    avenir: boolean;
}

export type SimulationBasculeJeunesValidesTaskResult = {
    jeunesAvenir: number;
    jeunesProchainSejour: number;
    jeunesRefuses: number;
    rapportKey: string;
};

export type SimulationBasculeJeunesValidesTaskModel = TaskModel<
    SimulationBasculeJeunesValidesTaskParameters,
    SimulationBasculeJeunesValidesTaskResult
>;

export type RapportData = {
    jeunesProchainSejour: JeuneRapport[];
    jeunesAvenir: JeuneRapport[];
    jeunesRefuses: JeuneRapport[];
};

export type JeuneRapport = Pick<
    JeuneModel,
    | "id"
    | "statutPhase1"
    | "genre"
    | "qpv"
    | "psh"
    | "sessionNom"
    | "region"
    | "departement"
    | "regionScolarite"
    | "departementScolarite"
    | "pointDeRassemblementId"
    | "ligneDeBusId"
    | "centreId"
    | "statut"
    | "prenom"
    | "nom"
    | "handicapMemeDepartement"
>;

export const RAPPORT_SHEETS = {
    PROCHAINSEJOUR: "Prochain séjour",
    AVENIR: "À venir",
    REFUSES: "Refusés",
};
