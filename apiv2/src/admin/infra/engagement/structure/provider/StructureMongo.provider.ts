import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
    MONGO_COLLECTION,
    StructureSchema,
    StructureType,
    CustomSaveParams,
    UserExtension,
    buildPatchUser,
} from "snu-lib";

import { DATABASE_CONNECTION } from "@infra/Database.provider";

export type StructureDocument = HydratedDocument<StructureType>;
type SchemaExtended = StructureDocument & UserExtension;
export const StructureName = MONGO_COLLECTION.STRUCTURE;
export const STRUCTURE_MONGOOSE_ENTITY = "STRUCTURE_MONGOOSE_ENTITY";

const StructureSchemaRef = new mongoose.Schema(StructureSchema);

StructureSchemaRef.pre<SchemaExtended>("save", function (next, params: CustomSaveParams | undefined) {
    if (params?.fromUser) {
        this._user = buildPatchUser(params.fromUser);
    }
    this.updatedAt = new Date();
    next();
});

StructureSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${StructureName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: StructureName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const structureMongoProviders = [
    {
        provide: STRUCTURE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(StructureName, StructureSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
