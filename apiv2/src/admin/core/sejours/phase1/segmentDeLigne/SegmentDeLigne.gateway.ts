import { SegmentDeLigneModel } from "./SegmentDeLigne.model";

export interface SegmentDeLigneGateway {
    findByLigneDeBusIds(ids: string[]): Promise<SegmentDeLigneModel[]>;
    delete(segmentDeLigne: SegmentDeLigneModel): Promise<void>;
}

export const SegmentDeLigneGateway = Symbol("SegmentDeLigneGateway");
