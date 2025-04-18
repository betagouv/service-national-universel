import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { DepartementSchema, DepartementType, MONGO_COLLECTION } from "snu-lib";

export type DepartementDocument = HydratedDocument<DepartementType>;
export const DepartementName = MONGO_COLLECTION.DEPARTEMENT;
export const DEPARTEMENT_MONGOOSE_ENTITY = "DEPARTEMENT_MONGOOSE_ENTITY";

const DepartementSchemaRef = new mongoose.Schema(DepartementSchema);

export const departementMongoProviders = [
    {
        provide: DEPARTEMENT_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(DepartementName, DepartementSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
