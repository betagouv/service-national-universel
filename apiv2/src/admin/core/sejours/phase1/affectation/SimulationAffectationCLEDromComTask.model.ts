import { TaskModel } from "@task/core/Task.model";

import { SimulationAffectationCLEDromComResult } from "./SimulationAffectationCLEDromCom";

export interface SimulationAffectationCLEDromComTaskParameters {
    sessionId: string;
    departements: string[];
    etranger?: boolean;
}

export type SimulationAffectationCLEDromComTaskResult = SimulationAffectationCLEDromComResult["analytics"] & {
    rapportKey: string;
};

export type SimulationAffectationCLEDromComTaskModel = TaskModel<
    SimulationAffectationCLEDromComTaskParameters,
    SimulationAffectationCLEDromComTaskResult
>;
