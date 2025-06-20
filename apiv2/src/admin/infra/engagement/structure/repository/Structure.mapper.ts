import { StructureModel } from "@admin/core/engagement/structure/Structure.model";
import { StructureDocument } from "../provider/StructureMongo.provider";
import { StructureType } from "snu-lib";

export class StructureMapper {
    static toModels(structureDocuments: StructureDocument[]): StructureModel[] {
        return structureDocuments.map((structureDocument) => this.toModel(structureDocument));
    }

    static toModel(structureDocument: StructureDocument): StructureModel {
        return {
            id: structureDocument._id.toString(),
            name: structureDocument.name,
            status: structureDocument.status,
            types: structureDocument.types,
            associationTypes: structureDocument.associationTypes,
            isJvaStructure: structureDocument.isJvaStructure === "true",
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
        };
    }
}
