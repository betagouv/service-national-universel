import { HistoryType } from "./History";
import { PatchType } from "snu-lib";

export interface HistoryGateway {
    findByReferenceId(history: HistoryType, referenceId: string): Promise<PatchType[]>;
    findLastByReferenceId(history: HistoryType, referenceId: string): Promise<PatchType | null>;
    findLastByReferenceIdAndPath(history: HistoryType, referenceId: string, path: string): Promise<PatchType | null>;
    findLastByReferenceIdAndPathAndValue(
        history: HistoryType,
        referenceId: string,
        path: string,
        value: string,
    ): Promise<PatchType | null>;
    bulkCreate(history: HistoryType, patches: PatchType[]): Promise<number>;
    create(history: HistoryType, patch: PatchType): Promise<PatchType>;
}

export const HistoryGateway = Symbol("HistoryGateway");
