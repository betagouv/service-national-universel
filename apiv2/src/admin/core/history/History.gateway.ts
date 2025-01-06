import { HistoryType } from "./History";
import { PatchType } from "snu-lib";

export interface HistoryGateway {
    findByReferenceId(history: HistoryType, referenceId: string): Promise<PatchType[]>;
    bulkCreate(history: HistoryType, patches: PatchType[]): Promise<number>;
}

export const HistoryGateway = Symbol("HistoryGateway");
