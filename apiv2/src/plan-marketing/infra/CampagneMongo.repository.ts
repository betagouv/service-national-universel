import { Inject, Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { CampagneGateway } from "../core/gateway/Campagne.gateway";
import { CampagneModel, CreateCampagneModel } from "../core/Campagne.model";
import { CAMPAGNE_MONGOOSE_ENTITY, CampagneDocument } from "./CampagneMongo.provider";
import { CampagneMapper } from "./Campagne.mapper";

@Injectable()
export class CampagneMongoRepository implements CampagneGateway {
    constructor(
        @Inject(CAMPAGNE_MONGOOSE_ENTITY)
        private campagneModel: Model<CampagneDocument>,
    ) {}
    async search(filter?: Record<string, any>, sort?: "ASC" | "DESC"): Promise<CampagneModel[]> {
        const campagnes = await this.campagneModel.find({ ...filter }).sort({ createdAt: sort === "ASC" ? 1 : -1 });
        return campagnes.map(CampagneMapper.toModel);
    }

    async save(campagne: CreateCampagneModel): Promise<CampagneModel> {
        const created = await this.campagneModel.create(CampagneMapper.toEntityCreate(campagne));
        return CampagneMapper.toModel(created);
    }

    async findById(id: string): Promise<CampagneModel | null> {
        const campagneEntity = await this.campagneModel.findById(id);
        return campagneEntity ? CampagneMapper.toModel(campagneEntity) : null;
    }

    async update(campagne: CampagneModel): Promise<CampagneModel | null> {
        const updated = await this.campagneModel.findByIdAndUpdate(campagne.id, campagne, { new: true });
        return updated ? CampagneMapper.toModel(updated) : null;
    }

    async delete(id: string): Promise<void> {
        await this.campagneModel.findByIdAndDelete(id);
    }
}
