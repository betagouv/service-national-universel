import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection, HydratedDocument } from "mongoose";
import { ClasseSchema, ClasseType, MONGO_COLLECTION, CustomSaveParams, getUserToSave, UserExtension } from "snu-lib";
import patchHistory from "mongoose-patch-history";

export type ClasseDocument = HydratedDocument<ClasseType>;
type SchemaExtended = ClasseDocument & UserExtension;
export const ClasseName = MONGO_COLLECTION.CLASSE;
export const CLASSE_MONGOOSE_ENTITY = "CLASSE_MONGOOSE_ENTITY";

const ClasseSchemaRef = new mongoose.Schema(ClasseSchema);

ClasseSchemaRef.pre<SchemaExtended>("save", function (next, params: CustomSaveParams | undefined) {
    if (params?.fromUser) {
        this._user = getUserToSave(params.fromUser);
    }
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
