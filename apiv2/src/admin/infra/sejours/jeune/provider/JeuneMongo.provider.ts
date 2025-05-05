import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
    MONGO_COLLECTION,
    UserExtension,
    YoungSchema,
    YoungSchemaCorrectionRequest,
    YoungSchemaFile,
    YoungSchemaNote,
    YoungType,
    CustomSaveParams,
    getUserToSave,
} from "snu-lib";

import { DATABASE_CONNECTION } from "@infra/Database.provider";

export type JeuneDocument = HydratedDocument<YoungType>;
type SchemaExtended = JeuneDocument & UserExtension;
export const JeuneName = MONGO_COLLECTION.YOUNG;
export const JEUNE_MONGOOSE_ENTITY = "JEUNE_MONGOOSE_ENTITY";

const JeuneSchemaRef = new mongoose.Schema({
    ...YoungSchema,
    files: {
        ...Object.keys(YoungSchema.files).reduce((acc, key) => {
            acc[key] = [new mongoose.Schema(YoungSchemaFile)];
            return acc;
        }, {}),
    },
    correctionRequests: {
        ...YoungSchema.correctionRequests,
        type: [new mongoose.Schema(YoungSchemaCorrectionRequest)],
    },
    notes: {
        ...YoungSchema.notes,
        type: [new mongoose.Schema(YoungSchemaNote)],
    },
});

JeuneSchemaRef.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
    if (params?.fromUser) {
        this._user = getUserToSave(params.fromUser);
    }
    this.updatedAt = new Date();
    next();
});

export const JEUNE_PATCHHISTORY_OPTIONS = {
    name: `${JeuneName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: JeuneName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
};

JeuneSchemaRef.plugin(patchHistory, { mongoose, ...JEUNE_PATCHHISTORY_OPTIONS });

export const jeuneMongoProviders = [
    {
        provide: JEUNE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model<JeuneDocument>(JeuneName, JeuneSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
