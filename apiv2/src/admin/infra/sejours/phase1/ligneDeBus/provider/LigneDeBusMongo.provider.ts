import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
    MONGO_COLLECTION,
    LigneBusSchema,
    LigneBusTeamSchema,
    LigneBusType,
    CustomSaveParams,
    UserExtension,
    buildPatchUser,
} from "snu-lib";

export type LigneDeBusDocument = HydratedDocument<LigneBusType>;
type SchemaExtended = LigneDeBusDocument & UserExtension;
export const LigneDeBusName = MONGO_COLLECTION.LIGNE_BUS;
export const LIGNEDEBUS_MONGOOSE_ENTITY = "LIGNEDEBUS_MONGOOSE_ENTITY";

const LigneDeBusSchemaRef = new mongoose.Schema({
    ...LigneBusSchema,
    team: {
        ...LigneBusSchema.team,
        type: [new mongoose.Schema(LigneBusTeamSchema)],
    },
});

LigneDeBusSchemaRef.pre<SchemaExtended>("save", function (next, params: CustomSaveParams | undefined) {
    if (params?.fromUser) {
        this._user = buildPatchUser(params.fromUser);
    }
    this.updatedAt = new Date();
    next();
});

export const LIGNEDEBUS_PATCHHISTORY_OPTIONS = {
    name: `${LigneDeBusName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: LigneDeBusName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
};

LigneDeBusSchemaRef.plugin(patchHistory, {
    mongoose,
    ...LIGNEDEBUS_PATCHHISTORY_OPTIONS,
});

export const ligneDeBusMongoProviders = [
    {
        provide: LIGNEDEBUS_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(LigneDeBusName, LigneDeBusSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
