export type StructureModel = {
    id: string;
    name: string;
    status: string;
    types: string[];
    associationTypes: string[];
    isJvaStructure: boolean;
    region?: string;
    department?: string;
    networkId?: string;
};

export type StructureProjection = keyof StructureModel;

export const STRUCTURE_PROJECTION_KEYS: readonly StructureProjection[] = [
    "id",
    "name",
    "region",
    "department",
    "networkId",
] as const;
