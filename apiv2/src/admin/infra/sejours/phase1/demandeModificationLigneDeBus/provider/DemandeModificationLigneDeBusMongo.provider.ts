import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { ModificationBusSchema, ModificationBusType } from "snu-lib";
import patchHistory from "mongoose-patch-history";

export type DemandeModificationLigneDeBusDocument = HydratedDocument<ModificationBusType>;
export const DemandeModificationLigneDeBusName = "modificationbus";
export const DEMANDEMODIFICATIONBUS_MONGOOSE_ENTITY = "DEMANDEMODIFICATIONBUS_MONGOOSE_ENTITY";

const DemandeModificationLigneDeBusSchemaRef = new mongoose.Schema(ModificationBusSchema);

DemandeModificationLigneDeBusSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

DemandeModificationLigneDeBusSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${DemandeModificationLigneDeBusName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: DemandeModificationLigneDeBusName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const demandeModificationLigneDeBusMongoProviders = [
    {
        provide: DEMANDEMODIFICATIONBUS_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) =>
            connection.model(DemandeModificationLigneDeBusName, DemandeModificationLigneDeBusSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
