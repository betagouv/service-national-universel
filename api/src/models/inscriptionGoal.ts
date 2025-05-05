import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InscriptionGoalSchema, InterfaceExtended, MONGO_COLLECTION } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";
import { getUserToSave } from "./utils";

const MODELNAME = MONGO_COLLECTION.INSCRIPTION_GOAL;

const schema = new Schema(InscriptionGoalSchema);

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

type InscriptionGoalType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type InscriptionGoalDocument<T = {}> = DocumentExtended<InscriptionGoalType & T>;
type SchemaExtended = InscriptionGoalDocument & UserExtension;

export const InscriptionGoalModel = mongoose.model<InscriptionGoalDocument>(MODELNAME, schema);
