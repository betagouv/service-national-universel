import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";

import patchHistory from "mongoose-patch-history";
import { SessionPhase1Schema, SessionPhase1Type } from "snu-lib";

export type SejourDocument = HydratedDocument<SessionPhase1Type>;
export const SejourName = "sessionPhase1";
export const SEJOUR_MONGOOSE_ENTITY = "SEJOUR_MONGOOSE_ENTITY";

const SejourSchemaRef = new mongoose.Schema(SessionPhase1Schema);

SejourSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

SejourSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${SejourName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: SejourName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const sejourMongoProviders = [
    {
        provide: SEJOUR_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(SejourName, SejourSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
