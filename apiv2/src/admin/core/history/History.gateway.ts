import { HistoryType } from "./History";
import { PatchType } from "snu-lib";

export interface HistoryGateway {
    findByReferenceId(history: HistoryType, referenceId: string): Promise<PatchType[]>;
}

export const HistoryGateway = Symbol("HistoryGateway");
