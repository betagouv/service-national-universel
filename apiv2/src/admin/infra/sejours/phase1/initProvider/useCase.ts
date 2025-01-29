import { SimulationAffectationCLE } from "@admin/core/sejours/phase1/affectation/SimulationAffectationCLE";
import { SimulationAffectationHTS } from "@admin/core/sejours/phase1/affectation/SimulationAffectationHTS";
import { SupprimerPlanDeTransport } from "@admin/core/sejours/phase1/affectation/SupprimerPlanDeTransport";
import { BasculeCLEtoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeCLEtoCLE";
import { BasculeCLEtoHTS } from "@admin/core/sejours/phase1/bascule/useCase/BasculeCLEtoHTS";
import { BasculeHTStoCLE } from "@admin/core/sejours/phase1/bascule/useCase/BasculeHTStoCLE";
import { BasculeHTStoHTS } from "@admin/core/sejours/phase1/bascule/useCase/BasculeHTStoHTS";

export const useCaseProvider = [
    SimulationAffectationHTS,
    SimulationAffectationCLE,
    SupprimerPlanDeTransport,
    BasculeCLEtoCLE,
    BasculeCLEtoHTS,
    BasculeHTStoCLE,
    BasculeHTStoHTS,
];
