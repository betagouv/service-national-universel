import { SimulationAffectationCLE } from "@admin/core/sejours/phase1/affectation/SimulationAffectationCLE";
import { SimulationAffectationHTS } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS";
import { SupprimerPlanDeTransport } from "@admin/core/sejours/phase1/affectation/SupprimerPlanDeTransport";

export const useCaseProvider = [SimulationAffectationHTS, SimulationAffectationCLE, SupprimerPlanDeTransport];
