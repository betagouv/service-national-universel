import { GRADES } from "snu-lib";

import { TaskModel } from "@task/core/Task.model";

import { SimulationAffectationHTSResult } from "./SimulationAffectationHTS";

export interface SimulationAffectationHTSTaskParameters {
    sessionId: string;
    departements: string[];
    niveauScolaires: Array<keyof typeof GRADES>;
    sdrImportId: string;
    etranger?: boolean;
    affecterPDR?: boolean;
}

export type SimulationAffectationHTSTaskResult = Pick<
    SimulationAffectationHTSResult["analytics"],
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
