import { ListeDiffusionType } from "snu-lib";
import { CreateListeDiffusionModel, ListeDiffusionModel } from "../core/ListeDiffusion.model";

export class ListeDiffusionMapper {
    static toModel(document: ListeDiffusionType): ListeDiffusionModel {
        return {
            id: document._id.toString(),
            nom: document.nom,
            type: document.type,
            filters: document.filters,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            isArchived: document.isArchived,
        };
    }

    static toEntity(model: ListeDiffusionModel): Omit<ListeDiffusionType, "createdAt" | "updatedAt"> {
        return {
            _id: model.id,
            nom: model.nom,
            type: model.type,
            filters: model.filters,
            isArchived: model.isArchived ?? false,
        };
    }

    static toEntityCreate(
        model: CreateListeDiffusionModel,
    ): Omit<ListeDiffusionType, "_id" | "createdAt" | "updatedAt"> {
        return {
            nom: model.nom,
            type: model.type,
            filters: model.filters,
            isArchived: model.isArchived ?? false,
        };
    }
}
