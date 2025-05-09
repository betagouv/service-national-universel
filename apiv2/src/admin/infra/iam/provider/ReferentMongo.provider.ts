import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";
import {
    MONGO_COLLECTION,
    ReferentSchema,
    ReferentType,
    CustomSaveParams,
    UserExtension,
    buildPatchUser,
} from "snu-lib";

export type ReferentDocument = HydratedDocument<ReferentType>;
type SchemaExtended = ReferentDocument & UserExtension;
export const ReferentName = MONGO_COLLECTION.REFERENT;
export const REFERENT_MONGOOSE_ENTITY = "REFERENT_MONGOOSE_ENTITY";

const ReferentSchemaRef = new mongoose.Schema(ReferentSchema);

ReferentSchemaRef.pre<SchemaExtended>("save", function (next, params: CustomSaveParams | undefined) {
    if (params?.fromUser) {
        this._user = buildPatchUser(params.fromUser);
    }
    this.updatedAt = new Date();
    next();
});

ReferentSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${ReferentName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: ReferentName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: [
        "/password",
        "/lastLoginAt",
        "/lastActivityAt",
        "/lastLogoutAt",
        "/passwordChangedAt",
        "/nextLoginAttemptIn",
        "/forgotPasswordResetToken",
        "/forgotPasswordResetExpires",
        "/invitationToken",
        "/invitationExpires",
        "/loginAttempts",
        "/attempts2FA",
        "/updatedAt",
        "/token2FA",
        "/token2FAExpires",
    ],
});

export const referentMongoProviders = [
    {
        provide: REFERENT_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(ReferentName, ReferentSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
