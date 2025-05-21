import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { FeatureFlagType, FeatureFlagSchema, MONGO_COLLECTION } from "snu-lib";

export type FeatureFlagDocument = HydratedDocument<FeatureFlagType>;
export const FeatureFlagName = MONGO_COLLECTION.FEATURE_FLAG;
export const FEATURE_FLAG_MONGOOSE_ENTITY = "FEATURE_FLAG_MONGOOSE_ENTITY";

const FeatureFlagSchemaRef = new mongoose.Schema(FeatureFlagSchema);

FeatureFlagSchemaRef.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export const featureFlagMongoProviders = [
    {
        provide: FEATURE_FLAG_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(FeatureFlagName, FeatureFlagSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
