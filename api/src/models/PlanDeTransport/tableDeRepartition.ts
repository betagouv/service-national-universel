import mongoose, { Schema, InferSchemaType } from "mongoose";
import mongooseElastic from "@selego/mongoose-elastic";
import esClient from "../../es";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";
import { InterfaceExtended, TableDeRepartitionSchema } from "snu-lib";

const MODELNAME = "tablederepartition";

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

schema.plugin(mongooseElastic(esClient), MODELNAME);

type TableDeRepartitionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type TableDeRepartitionDocument<T = {}> = DocumentExtended<TableDeRepartitionType & T>;
type SchemaExtended = TableDeRepartitionDocument & UserExtension;

export const TableDeRepartitionModel = mongoose.model<TableDeRepartitionDocument>(MODELNAME, schema);
