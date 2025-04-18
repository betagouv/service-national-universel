import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { MONGO_COLLECTION, LigneToPointSchema, LigneToPointType } from "snu-lib";
import patchHistory from "mongoose-patch-history";

export type SegmentDeLigneDocument = HydratedDocument<LigneToPointType>;
export const SegmentDeLigneName = MONGO_COLLECTION.LIGNE_TO_POINT;
export const SEGMENTLIGNE_MONGOOSE_ENTITY = "SEGMENTLIGNE_MONGOOSE_ENTITY";

const SegmentDeLigneSchemaRef = new mongoose.Schema(LigneToPointSchema);

SegmentDeLigneSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

SegmentDeLigneSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${SegmentDeLigneName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: SegmentDeLigneName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const segmentDeLigneMongoProviders = [
    {
        provide: SEGMENTLIGNE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(SegmentDeLigneName, SegmentDeLigneSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
