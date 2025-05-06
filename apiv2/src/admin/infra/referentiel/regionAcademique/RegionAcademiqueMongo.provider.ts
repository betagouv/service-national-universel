import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { MONGO_COLLECTION, RegionAcademiqueSchema, RegionAcademiqueType } from "snu-lib";

export type RegionAcademiqueDocument = HydratedDocument<RegionAcademiqueType>;
export const RegionAcademiqueName = MONGO_COLLECTION.REGION_ACADEMIQUE;
export const REGION_ACADEMIQUE_MONGOOSE_ENTITY = "REGION_ACADEMIQUE_MONGOOSE_ENTITY";

const RegionAcademiqueSchemaRef = new mongoose.Schema(RegionAcademiqueSchema);

export const regionAcademiqueMongoProviders = [
    {
        provide: REGION_ACADEMIQUE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(RegionAcademiqueName, RegionAcademiqueSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
