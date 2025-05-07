import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
    MONGO_COLLECTION,
    SessionPhase1FileSchema,
    SessionPhase1Schema,
    SessionPhase1Type,
    UserExtension,
    getUserToSave,
    CustomSaveParams,
} from "snu-lib";

import { DATABASE_CONNECTION } from "@infra/Database.provider";

export type SejourDocument = HydratedDocument<SessionPhase1Type>;
type SchemaExtended = SejourDocument & UserExtension;
export const SejourName = MONGO_COLLECTION.SESSION_PHASE1;
export const SEJOUR_MONGOOSE_ENTITY = "SEJOUR_MONGOOSE_ENTITY";

const SejourSchemaRef = new mongoose.Schema({
    ...SessionPhase1Schema,
    timeScheduleFiles: {
        ...SessionPhase1Schema.timeScheduleFiles,
        type: [new mongoose.Schema(SessionPhase1FileSchema)],
    },
    pedagoProjectFiles: {
        ...SessionPhase1Schema.pedagoProjectFiles,
        type: [new mongoose.Schema(SessionPhase1FileSchema)],
    },
});

SejourSchemaRef.pre<SchemaExtended>("save", function (next, params: CustomSaveParams | undefined) {
    if (params?.fromUser) {
        this._user = getUserToSave(params.fromUser);
    }
    this.updatedAt = new Date();
    next();
});

export const SEJOUR_PATCHHISTORY_OPTIONS = {
    name: `${SejourName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: SejourName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
};

SejourSchemaRef.plugin(patchHistory, {
    mongoose,
    ...SEJOUR_PATCHHISTORY_OPTIONS,
});

export const sejourMongoProviders = [
    {
        provide: SEJOUR_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(SejourName, SejourSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
