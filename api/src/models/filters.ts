import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { FiltersSchema, InterfaceExtended } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = "filter";

const schema = new Schema(FiltersSchema);

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.fromUser = params?.fromUser;
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

type FiltersType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type FiltersDocument<T = {}> = DocumentExtended<FiltersType & T>;
type SchemaExtended = FiltersDocument & UserExtension;

export const FiltersModel = mongoose.model<FiltersDocument>(MODELNAME, schema);
