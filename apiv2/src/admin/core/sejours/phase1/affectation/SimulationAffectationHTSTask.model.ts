import { GRADES } from "snu-lib";

import { TaskModel } from "@task/core/Task.model";

import { SimulationAffectationHTSResult } from "./SimulationAffectationHTS";

export interface SimulationAffectationHTSTaskParameters {
    sessionId: string;
    departements: string[];
    niveauScolaires: Array<keyof typeof GRADES>;
    changementDepartements: { origine: string; destination: string }[];
}

export type SimulationAffectationHTSTaskResult = Pick<
    SimulationAffectationHTSResult["analytics"],
    "selectedCost" | "jeunesNouvellementAffected" | "jeuneAttenteAffectation" | "jeunesDejaAffected"
> & {
    rapportUrl: string;
    rapportKey: string;
};

export type SimulationAffectationHTSTaskModel = TaskModel<
    SimulationAffectationHTSTaskParameters,
    SimulationAffectationHTSTaskResult
>;
