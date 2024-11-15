import mongoose, { Connection, HydratedDocument } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { YoungSchema, YoungType } from "snu-lib";

import { DATABASE_CONNECTION } from "@infra/Database.provider";

export type JeuneDocument = HydratedDocument<YoungType>;
export const JeuneName = "young";
export const JEUNE_MONGOOSE_ENTITY = "JEUNE_MONGOOSE_ENTITY";

const JeuneSchemaRef = new mongoose.Schema(YoungSchema);

JeuneSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

JeuneSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${JeuneName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: JeuneName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const jeuneMongoProviders = [
    {
        provide: JEUNE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(JeuneName, JeuneSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
