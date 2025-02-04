import { TaskModel } from "@task/core/Task.model";
import { JeuneModel } from "../../jeune/Jeune.model";

export interface SimulationBasculeJeunesValidesTaskParameters {
    sessionId: string;
    status: string[];
    statusPhase1: string[];
    presenceArrivee: boolean;
    statusPhase1Motif: string[];
    niveauScolaires: string[];
    departements: string[];
    etranger: boolean;
    avenir: boolean;
}

export type SimulationBasculeJeunesValidesTaskResult = {
    jeunesAvenir: number;
    jeunesProchainSejour: number;
    rapportKey: string;
};

export type SimulationBasculeJeunesValidesTaskModel = TaskModel<
    SimulationBasculeJeunesValidesTaskParameters,
    SimulationBasculeJeunesValidesTaskResult
>;

export type RapportData = {
    jeunesProchainSejour: JeuneRapport[];
    jeunesAvenir: JeuneRapport[];
};

export type JeuneRapport = Pick<
    JeuneModel,
    | "id"
    | "nom"
    | "prenom"
    | "statut"
    | "statutPhase1"
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
