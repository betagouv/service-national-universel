import { Model } from "mongoose";
import { LISTE_DIFFUSION_MONGOOSE_ENTITY, ListeDiffusionDocument } from "./ListeDiffusion.provider";
import { ListeDiffusionGateway } from '../core/gateway/ListeDiffusion.gateway';
import { Inject } from "@nestjs/common";
import { CreateListeDiffusionModel, ListeDiffusionModel } from '../core/ListeDiffusion.model';
import { ListeDiffusionMapper } from "./ListeDiffusion.mapper";

export class ListeDiffusionMongoRepository implements ListeDiffusionGateway {
    constructor(
        @Inject(LISTE_DIFFUSION_MONGOOSE_ENTITY)
        private listeDiffusionModel: Model<ListeDiffusionDocument>,
    ) {}

    async save(listeDiffusion: CreateListeDiffusionModel): Promise<ListeDiffusionModel> {
        const created = await this.listeDiffusionModel.create(ListeDiffusionMapper.toEntityCreate(listeDiffusion));
        return ListeDiffusionMapper.toModel(created);
    }

    async findById(id: string): Promise<ListeDiffusionModel | null> {
        const listeDiffusion = await this.listeDiffusionModel.findById(id);
        return listeDiffusion ? ListeDiffusionMapper.toModel(listeDiffusion) : null;
    }

    async update(listeDiffusion: ListeDiffusionModel): Promise<ListeDiffusionModel | null> {
        const updated = await this.listeDiffusionModel.findByIdAndUpdate(listeDiffusion.id, ListeDiffusionMapper.toEntity(listeDiffusion), { new: true });
        return updated ? ListeDiffusionMapper.toModel(updated) : null;
    }

    async delete(id: string): Promise<void> {
        await this.listeDiffusionModel.findByIdAndDelete(id);
    }

    async search(filter?: Record<string, any>, sort?: "ASC" | "DESC"): Promise<ListeDiffusionModel[]> {
        const cleanedFilter = Object.entries(filter ?? {})
            .filter(([key, value]) =>
                !["isArchived"].includes(key) || value !== undefined
            )
            .reduce<Record<string, unknown>>((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {});

        let mongoFilter = { ...cleanedFilter };
        if ("isArchived" in mongoFilter) {
            mongoFilter = {
                ...mongoFilter,
                isArchived: mongoFilter.isArchived,
            };
        }

        const listeDiffusions = await this.listeDiffusionModel.find(mongoFilter).sort({ createdAt: sort === "ASC" ? 1 : -1 });
        return listeDiffusions.map(ListeDiffusionMapper.toModel);
    }
}