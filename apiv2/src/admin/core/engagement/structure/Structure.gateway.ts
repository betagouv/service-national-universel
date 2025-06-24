import { StructureModel } from "./Structure.model";

export interface StructureGateway {
    findById(id: string): Promise<StructureModel>;
    findByIds(ids: string[]): Promise<StructureModel[]>;
    findByIdOrNetworkId(id: string): Promise<StructureModel[]>;
}

export const StructureGateway = Symbol("StructureGateway");
