import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";
import { InterfaceExtended, TableDeRepartitionSchema, MONGO_COLLECTION } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.TABLE_DE_REPARTITION;

const schema = new Schema(TableDeRepartitionSchema);

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.user = params?.fromUser;
  this.updatedAt = new Date();
  next();
});

schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

type TableDeRepartitionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type TableDeRepartitionDocument<T = {}> = DocumentExtended<TableDeRepartitionType & T>;
type SchemaExtended = TableDeRepartitionDocument & UserExtension;

export const TableDeRepartitionModel = mongoose.model<TableDeRepartitionDocument>(MODELNAME, schema);
