import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { AcademieSchema, AcademieType } from "snu-lib";

export type AcademieDocument = HydratedDocument<AcademieType>;
export const AcademieName = "academie";
export const ACADEMIE_MONGOOSE_ENTITY = "ACADEMIE_MONGOOSE_ENTITY";

const AcademieSchemaRef = new mongoose.Schema(AcademieSchema);

export const academieMongoProviders = [
    {
        provide: ACADEMIE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(AcademieName, AcademieSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
