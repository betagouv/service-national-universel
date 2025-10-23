import { StructureModel, StructureProjection } from "@admin/core/engagement/structure/Structure.model";
import { StructureDocument } from "../provider/StructureMongo.provider";
import { StructureType } from "snu-lib";

export class StructureMapper {
    static toModels(structureDocuments: StructureDocument[]): StructureModel[] {
        return structureDocuments.map((structureDocument) => this.toModel(structureDocument));
    }

    static toModelProjections(
        structureDocuments: StructureDocument[],
        projection: Record<string, 1>,
    ): Partial<StructureModel>[] {
        const models = structureDocuments.map((structureDocument) => this.toModel(structureDocument));
        const projectedModels = models.map((model) => {
            return Object.keys(projection).reduce((acc: Partial<StructureModel>, key) => {
                acc[key] = model[key];
                return acc;
            }, {});
        });
        return projectedModels;
    }

    static toModel(structureDocument: StructureDocument): StructureModel {
        return {
            id: structureDocument._id.toString(),
            name: structureDocument.name,
            status: structureDocument.status,
            types: structureDocument.types,
            associationTypes: structureDocument.associationTypes,
            isJvaStructure: structureDocument.isJvaStructure === "true",
            region: structureDocument.region,
            department: structureDocument.department,
            networkId: structureDocument.networkId,
        };
    }

    static toEntity(structureModel: StructureModel): Omit<StructureType, "createdAt" | "updatedAt"> {
        return {
            _id: structureModel.id,
            name: structureModel.name,
            status: structureModel.status,
            types: structureModel.types,
            associationTypes: structureModel.associationTypes,
            isJvaStructure: structureModel.isJvaStructure ? "true" : "false",
            region: structureModel.region,
            department: structureModel.department,
            networkId: structureModel.networkId,
        };
    }
}
