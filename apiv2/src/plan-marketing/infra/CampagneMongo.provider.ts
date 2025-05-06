import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { CampagneType, CampagneSchema, MONGO_COLLECTION } from "snu-lib";

export type CampagneDocument = HydratedDocument<CampagneType>;
export const CampagneName = MONGO_COLLECTION.CAMPAIGN;
export const CAMPAGNE_MONGOOSE_ENTITY = "CAMPAGNE_MONGOOSE_ENTITY";

const CampagneSchemaRef = new mongoose.Schema(CampagneSchema);

CampagneSchemaRef.pre("save", function (next) {
    this.updatedAt = new Date();
    next();
});

export const campagneMongoProviders = [
    {
        provide: CAMPAGNE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(CampagneName, CampagneSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
