import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { MONGO_COLLECTION, RoleSchema, RoleType } from "snu-lib";

import { DATABASE_CONNECTION } from "@infra/Database.provider";

export type RoleDocument = HydratedDocument<RoleType>;
export const ROLE_MONGOOSE_ENTITY = "ROLE_MONGOOSE_ENTITY";

const RoleSchemaRef = new mongoose.Schema(RoleSchema);

RoleSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

export const ROLE_PATCHHISTORY_OPTIONS = {
    name: `${MONGO_COLLECTION.ROLE}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: MONGO_COLLECTION.ROLE },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
};

RoleSchemaRef.plugin(patchHistory, {
    mongoose,
    ...ROLE_PATCHHISTORY_OPTIONS,
});

export const roleMongoProviders = [
    {
        provide: ROLE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(MONGO_COLLECTION.ROLE, RoleSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
