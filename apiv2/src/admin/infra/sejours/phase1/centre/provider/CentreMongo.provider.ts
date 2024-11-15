import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { CohesionCenterSchema, CohesionCenterType } from "snu-lib";
import patchHistory from "mongoose-patch-history";

export type CentreDocument = HydratedDocument<CohesionCenterType>;
export const CentreName = "cohesionCenter";
export const CENTRE_MONGOOSE_ENTITY = "CENTRE_MONGOOSE_ENTITY";

const CentreSchemaRef = new mongoose.Schema(CohesionCenterSchema);

CentreSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

CentreSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${CentreName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: CentreName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const centreMongoProviders = [
    {
        provide: CENTRE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(CentreName, CentreSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
