import { Inject, Injectable } from "@nestjs/common";
import { FeatureFlagGateway } from "@shared/core/featureFlag/FeatureFlag.gateway";
import { FeatureFlagModel } from "@shared/core/featureFlag/FeatureFlag.model";
import { Model } from "mongoose";
import { FeatureFlagName } from "snu-lib";
import { FEATURE_FLAG_MONGOOSE_ENTITY, FeatureFlagDocument } from "./FeatureFlag.provider";

@Injectable()
export class FeatureFlagMongoRepository implements FeatureFlagGateway {
    constructor(
        @Inject(FEATURE_FLAG_MONGOOSE_ENTITY)
        private featureFlagModel: Model<FeatureFlagDocument>,
    ) {}

    async findAll(): Promise<FeatureFlagModel[]> {
        return this.featureFlagModel.find().lean().exec();
    }

    async findById(id: string): Promise<FeatureFlagModel | null> {
        return await this.featureFlagModel.findById(id).lean();
    }

    async findByName(name: FeatureFlagName): Promise<FeatureFlagModel | null> {
        return await this.featureFlagModel.findOne({ name }).lean();
    }
}
