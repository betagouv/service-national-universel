import mongoose, { InferSchemaType, Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";
import { InterfaceExtended, SchemaDeRepartitionSchema, MONGO_COLLECTION } from "snu-lib";
import { getUserToSave } from "../utils";

const MODELNAME = MONGO_COLLECTION.SCHEMA_DE_REPARTITION;

const schema = new Schema(SchemaDeRepartitionSchema);

schema.virtual("cohesionCenter", {
  ref: "cohesioncenter",
  localField: "centerId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model, impersonatedBy } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model, impersonatedBy };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  if (params.fromUser) {
    this.user = getUserToSave(params.fromUser);
  }
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
