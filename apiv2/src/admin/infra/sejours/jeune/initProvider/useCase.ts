import { BasculeCLEtoCLE } from "@admin/core/sejours/jeune/useCase/basculeCLEtoCLE/basculeCLEtoCLE";
import { BasculeCLEtoHTS } from "@admin/core/sejours/jeune/useCase/basculeCLEtoHTS/basculeCLEtoHTS";
import { BasculeHTStoCLE } from "@admin/core/sejours/jeune/useCase/basculeHTStoCLE/basculeHTStoCLE";
import { BasculeHTStoHTS } from "@admin/core/sejours/jeune/useCase/basculeHTStoHTS/basculeHTStoHTS";

export const useCaseProvider = [BasculeCLEtoCLE, BasculeCLEtoHTS, BasculeHTStoCLE, BasculeHTStoHTS];
