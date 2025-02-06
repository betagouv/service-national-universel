import { TaskModel } from "@task/core/Task.model";
import { JeuneModel } from "../../jeune/Jeune.model";

export interface SimulationBasculeJeunesTaskParameters {
    sessionId: string;
    status: string[];
    statusPhase1: string[];
    presenceArrivee: Array<boolean | null>;
    statusPhase1Motif: string[];
    niveauScolaires: string[];
    departements: string[];
    etranger: boolean;
    avenir: boolean;
}

export type SimulationBasculeJeunesTaskResult = {
    jeunesAvenir: number;
    jeunesProchainSejour: number;
    rapportKey: string;
};

export type SimulationBasculeJeunesTaskModel = TaskModel<
    SimulationBasculeJeunesTaskParameters,
    SimulationBasculeJeunesTaskResult
>;

export type RapportData = {
    jeunesProchainSejour: JeuneRapportSimulation[];
    jeunesAvenir: JeuneRapportSimulation[];
};

export type JeuneRapportSimulation = Pick<
    JeuneModel,
    | "id"
    | "nom"
    | "prenom"
    | "statut"
    | "statutPhase1"
    | "classeId"
    | "niveauScolaire"
    | "regionScolarite"
    | "departementScolarite"
    | "paysScolarite"
    | "presenceArrivee"
    | "departSejourMotif"
> & {
    regionResidence?: string;
    departementResidence?: string;
    nouvelleSession?: string;
    nouvelleSessionId?: string;
    ancienneSession?: string;
    ancienneSessionId?: string;
    dateNaissance?: string;
    age?: string;
};

export const RAPPORT_SHEETS = {
    RESUME: "Résumé",
    PROCHAINSEJOUR: "Prochain séjour",
    AVENIR: "À venir",
    REFUSES: "Refusés",
};
