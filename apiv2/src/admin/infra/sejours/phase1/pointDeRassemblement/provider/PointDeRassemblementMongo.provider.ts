import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { PointDeRassemblementSchema, PointDeRassemblementType } from "snu-lib";
import patchHistory from "mongoose-patch-history";

export type PointDeRassemblementDocument = HydratedDocument<PointDeRassemblementType>;
export const PointDeRassemblementName = "pointDeRassemblement";
export const PDR_MONGOOSE_ENTITY = "PDR_MONGOOSE_ENTITY";

const PointDeRassemblementSchemaRef = new mongoose.Schema(PointDeRassemblementSchema);

PointDeRassemblementSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
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
