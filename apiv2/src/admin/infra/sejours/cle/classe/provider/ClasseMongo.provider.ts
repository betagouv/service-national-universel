import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { ClasseSchema, ClasseType } from "snu-lib";
import patchHistory from "mongoose-patch-history";

export type ClasseDocument = HydratedDocument<ClasseType>;
export const ClasseName = "classe";
export const CLASSE_MONGOOSE_ENTITY = "CLASSE_MONGOOSE_ENTITY";

const ClasseSchemaRef = new mongoose.Schema(ClasseSchema);

ClasseSchemaRef.pre("save", function (next, params) {
    //@ts-ignore
    // TODO : add typing
    this._user = params?.fromUser;
    this.updatedAt = new Date();
    next();
});

ClasseSchemaRef.plugin(patchHistory, {
    mongoose,
    name: `${ClasseName}Patches`,
    trackOriginalValue: true,
    includes: {
        modelName: { type: String, required: true, default: ClasseName },
        user: { type: Object, required: false, from: "_user" },
    },
    excludes: ["/updatedAt"],
});

export const classeMongoProviders = [
    {
        provide: CLASSE_MONGOOSE_ENTITY,
        useFactory: (connection: Connection) => connection.model(ClasseName, ClasseSchemaRef),
        inject: [DATABASE_CONNECTION],
    },
];
