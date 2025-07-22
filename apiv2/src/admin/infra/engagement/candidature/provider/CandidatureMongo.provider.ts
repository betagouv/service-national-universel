import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
    MONGO_COLLECTION,
    ApplicationSchema,
    ApplicationType,
    CustomSaveParams,
    UserExtension,
    buildPatchUser,
} from "snu-lib";

import { DATABASE_CONNECTION } from "@infra/Database.provider";

export type CandidatureDocument = HydratedDocument<ApplicationType>;
type SchemaExtended = CandidatureDocument & UserExtension;
export const CandidatureName = MONGO_COLLECTION.APPLICATION;
export const CANDIDATURE_MONGOOSE_ENTITY = "CANDIDATURE_MONGOOSE_ENTITY";

const CandidatureSchemaRef = new mongoose.Schema(ApplicationSchema);

CandidatureSchemaRef.pre<SchemaExtended>("save", function (next, params: CustomSaveParams | undefined) {
    if (params?.fromUser) {
        this._user = buildPatchUser(params.fromUser);
    }
    this.updatedAt = new Date();
    next();
});

CandidatureSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${CandidatureName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: CandidatureName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const candidatureMongoProviders = [
    {
        provide: CANDIDATURE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(CandidatureName, CandidatureSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
