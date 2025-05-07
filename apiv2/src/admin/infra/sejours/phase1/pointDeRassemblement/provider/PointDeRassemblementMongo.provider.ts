import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import {
    MONGO_COLLECTION,
    PointDeRassemblementSchema,
    PointDeRassemblementType,
    UserExtension,
    CustomSaveParams,
    getUserToSave,
} from "snu-lib";
import patchHistory from "mongoose-patch-history";

export type PointDeRassemblementDocument = HydratedDocument<PointDeRassemblementType>;
type SchemaExtended = PointDeRassemblementDocument & UserExtension;
export const PointDeRassemblementName = MONGO_COLLECTION.POINT_DE_RASSEMBLEMENT;
export const PDR_MONGOOSE_ENTITY = "PDR_MONGOOSE_ENTITY";

const PointDeRassemblementSchemaRef = new mongoose.Schema(PointDeRassemblementSchema);

PointDeRassemblementSchemaRef.pre<SchemaExtended>("save", function (next, params: CustomSaveParams | undefined) {
    if (params?.fromUser) {
        this._user = getUserToSave(params.fromUser);
    }
    this.updatedAt = new Date();
    next();
});

PointDeRassemblementSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${PointDeRassemblementName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: PointDeRassemblementName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const pointDeRassemblementMongoProviders = [
    {
        provide: PDR_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) =>
            connection.model(PointDeRassemblementName, PointDeRassemblementSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
