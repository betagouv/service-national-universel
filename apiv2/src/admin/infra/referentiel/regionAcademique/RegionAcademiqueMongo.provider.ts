import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { RegionAcademiqueSchema, RegionAcademiqueType } from "snu-lib";

export type RegionAcademiqueDocument = HydratedDocument<RegionAcademiqueType>;
export const RegionAcademiqueName = "regionAcademique";
export const REGION_ACADEMIQUE_MONGOOSE_ENTITY = "REGION_ACADEMIQUE_MONGOOSE_ENTITY";

const RegionAcademiqueSchemaRef = new mongoose.Schema(RegionAcademiqueSchema);

RegionAcademiqueSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

export const regionAcademiqueMongoProviders = [
    {
        provide: REGION_ACADEMIQUE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(RegionAcademiqueName, RegionAcademiqueSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
