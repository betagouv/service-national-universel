import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
    MONGO_COLLECTION,
    PermissionSchema,
    PermissionType,
    CustomSaveParams,
    UserExtension,
    getUserToSave,
} from "snu-lib";

import { DATABASE_CONNECTION } from "@infra/Database.provider";

export type PermissionDocument = HydratedDocument<PermissionType>;
type SchemaExtended = PermissionDocument & UserExtension;
export const PERMISSION_MONGOOSE_ENTITY = "PERMISSION_MONGOOSE_ENTITY";

const PermissionSchemaRef = new mongoose.Schema(PermissionSchema);

PermissionSchemaRef.pre<SchemaExtended>("save", function (next, params: CustomSaveParams | undefined) {
    if (params?.fromUser) {
        this._user = getUserToSave(params.fromUser);
    }
    this.updatedAt = new Date();
    next();
});

export const PERMISSION_PATCHHISTORY_OPTIONS = {
    name: `${MONGO_COLLECTION.PERMISSION}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: MONGO_COLLECTION.PERMISSION },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
};

PermissionSchemaRef.plugin(patchHistory, {
    mongoose,
    ...PERMISSION_PATCHHISTORY_OPTIONS,
});

export const permissionMongoProviders = [
    {
        provide: PERMISSION_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(MONGO_COLLECTION.PERMISSION, PermissionSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
