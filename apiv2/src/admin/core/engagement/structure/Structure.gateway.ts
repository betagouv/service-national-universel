import { StructureModel, StructureProjection } from "./Structure.model";

export interface StructureGateway {
    findById(id: string): Promise<StructureModel>;
    findByIds(ids: string[]): Promise<StructureModel[]>;
    findByIdOrNetworkId(id: string): Promise<StructureModel[]>;
    findAll(
        projection?: StructureProjection[],
        filter?: Record<string, unknown> | null,
    ): Promise<Partial<StructureModel>[]>;
}

export const StructureGateway = Symbol("StructureGateway");
