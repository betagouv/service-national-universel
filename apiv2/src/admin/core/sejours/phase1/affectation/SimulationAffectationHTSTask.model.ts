import { GRADES } from "snu-lib";

import { TaskModel } from "@task/core/Task.model";

import { Analytics } from "./SimulationAffectationHTS.service";

export interface SimulationAffectationHTSTaskParameters {
    sessionId: string;
    departements: string[];
    niveauScolaires: Array<keyof typeof GRADES>;
    sdrImportId: string;
    etranger?: boolean;
    affecterPDR?: boolean;
}

export type SimulationAffectationHTSTaskResult = Pick<
    Analytics,
    | "selectedCost"
    | "iterationCostList"
    | "jeunesNouvellementAffected"
    | "jeuneAttenteAffectation"
    | "jeunesDejaAffected"
> & {
    rapportKey: string;
};

export type SimulationAffectationHTSTaskModel = TaskModel<
    SimulationAffectationHTSTaskParameters,
    SimulationAffectationHTSTaskResult
>;
