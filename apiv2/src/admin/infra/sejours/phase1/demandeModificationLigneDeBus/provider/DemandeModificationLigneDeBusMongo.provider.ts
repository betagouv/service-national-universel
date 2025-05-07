import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import {
    MONGO_COLLECTION,
    ModificationBusSchema,
    ModificationBusType,
    CustomSaveParams,
    UserExtension,
    getUserToSave,
} from "snu-lib";
import patchHistory from "mongoose-patch-history";

export type DemandeModificationLigneDeBusDocument = HydratedDocument<ModificationBusType>;
type SchemaExtended = DemandeModificationLigneDeBusDocument & UserExtension;
export const DemandeModificationLigneDeBusName = MONGO_COLLECTION.MODIFICATION_BUS;
export const DEMANDEMODIFICATIONBUS_MONGOOSE_ENTITY = "DEMANDEMODIFICATIONBUS_MONGOOSE_ENTITY";

const DemandeModificationLigneDeBusSchemaRef = new mongoose.Schema(ModificationBusSchema);

DemandeModificationLigneDeBusSchemaRef.pre<SchemaExtended>(
    "save",
    function (next, params: CustomSaveParams | undefined) {
        if (params?.fromUser) {
            this._user = getUserToSave(params.fromUser);
        }
        this.updatedAt = new Date();
        next();
    },
);

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
