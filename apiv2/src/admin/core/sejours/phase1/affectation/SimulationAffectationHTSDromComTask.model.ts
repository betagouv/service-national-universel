import { GRADES } from "snu-lib";

import { TaskModel } from "@task/core/Task.model";

import { SimulationAffectationHTSDromComResult } from "./SimulationAffectationHTSDromCom";

export interface SimulationAffectationHTSDromComTaskParameters {
    sessionId: string;
    niveauScolaires: Array<keyof typeof GRADES>;
    departements: string[];
    etranger?: boolean;
}

export type SimulationAffectationHTSDromComTaskResult = SimulationAffectationHTSDromComResult["analytics"] & {
    rapportKey: string;
};

export type SimulationAffectationHTSDromComTaskModel = TaskModel<
    SimulationAffectationHTSDromComTaskParameters,
    SimulationAffectationHTSDromComTaskResult
>;
