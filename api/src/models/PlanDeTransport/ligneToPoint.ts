import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";

import { InterfaceExtended, LigneToPointSchema } from "snu-lib";

import esClient from "../../es";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";

const MODELNAME = "lignetopoint";

const schema = new Schema(LigneToPointSchema);

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

type LigneToPointType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type LigneToPointDocument<T = {}> = DocumentExtended<LigneToPointType & T>;
type SchemaExtended = LigneToPointDocument & UserExtension;

export const LigneToPointModel = mongoose.model<LigneToPointDocument>(MODELNAME, schema);
