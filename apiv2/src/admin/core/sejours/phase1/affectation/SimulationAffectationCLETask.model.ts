import { TaskModel } from "@task/core/Task.model";

import { SimulationAffectationCLEResult } from "./SimulationAffectationCLE";

export interface SimulationAffectationCLETaskParameters {
    sessionId: string;
    departements: string[];
    etranger?: boolean;
}

export type SimulationAffectationCLETaskResult = SimulationAffectationCLEResult["analytics"] & {
    rapportKey: string;
};

export type SimulationAffectationCLETaskModel = TaskModel<
    SimulationAffectationCLETaskParameters,
    SimulationAffectationCLETaskResult
>;
