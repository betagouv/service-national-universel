import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
    CohortType,
    CohortSchema,
    YoungDSNJExportDatesSchema,
    YoungINJEPExportDatesSchema,
    YoungEligibilitySchema,
    MONGO_COLLECTION,
} from "snu-lib";

import { DATABASE_CONNECTION } from "@infra/Database.provider";

export type SessionDocument = HydratedDocument<CohortType>;
export const SessionName = MONGO_COLLECTION.COHORT;
export const SESSION_MONGOOSE_ENTITY = "SESSION_MONGOOSE_ENTITY";

const SessionSchemaRef = new mongoose.Schema({
    ...CohortSchema,
    dsnjExportDates: {
        ...CohortSchema.dsnjExportDates,
        type: new mongoose.Schema(YoungDSNJExportDatesSchema),
    },
    injepExportDates: {
        ...CohortSchema.injepExportDates,
        type: new mongoose.Schema(YoungINJEPExportDatesSchema),
    },
    eligibility: {
        ...CohortSchema.eligibility,
        type: new mongoose.Schema(YoungEligibilitySchema),
    },
});

SessionSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

SessionSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${SessionName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: SessionName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const sessionMongoProviders = [
    {
        provide: SESSION_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(SessionName, SessionSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
