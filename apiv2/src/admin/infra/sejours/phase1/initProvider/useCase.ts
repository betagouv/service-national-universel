import { SimulationAffectationCLE } from "@admin/core/sejours/phase1/affectation/SimulationAffectationCLE";
import { SimulationAffectationHTS } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS";
import { SupprimerLigneDeBus } from "@admin/core/sejours/phase1/affectation/SupprimerLigneDeBus";
import { SupprimerPlanDeTransport } from "@admin/core/sejours/phase1/affectation/SupprimerPlanDeTransport";

export const useCaseProvider = [
    SimulationAffectationHTS,
    SimulationAffectationCLE,
    SupprimerPlanDeTransport,
    SupprimerLigneDeBus,
];
