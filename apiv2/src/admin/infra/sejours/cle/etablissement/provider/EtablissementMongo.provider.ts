import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { EtablissementSchema, EtablissementType } from "snu-lib";

export type EtablissementDocument = HydratedDocument<EtablissementType>;
export const EtablissementName = "etablissement";
export const ETABLISSEMENT_MONGOOSE_ENTITY = "ETABLISSEMENT_MONGOOSE_ENTITY";

export const etablissementMongoProviders = [
    {
        provide: ETABLISSEMENT_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => {
            const modelExists = connection.modelNames().includes(EtablissementName);
            if (modelExists) {
                return connection.model(EtablissementName);
            } else {
                return connection.model(EtablissementName, new mongoose.Schema(EtablissementSchema));
            }
        },
        inject: [DATABASE_CONNECTION],
    },
];
