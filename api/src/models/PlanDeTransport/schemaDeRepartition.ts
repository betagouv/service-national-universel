import mongoose, { InferSchemaType, Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";
import { InterfaceExtended, SchemaDeRepartitionSchema } from "snu-lib";

const MODELNAME = "schemaderepartition";

const schema = new Schema(SchemaDeRepartitionSchema);

schema.virtual("cohesionCenter", {
  ref: "cohesioncenter",
  localField: "centerId",
  foreignField: "_id",
  justOne: true,
});

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

type SchemaDeRepartitionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SchemaDeRepartitionDocument<T = {}> = DocumentExtended<SchemaDeRepartitionType & T>;
type SchemaExtended = SchemaDeRepartitionDocument & UserExtension;

export const SchemaDeRepartitionModel = mongoose.model<SchemaDeRepartitionDocument>(MODELNAME, schema);
