import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { CohesionCenterSchema, CohesionCenterType, MONGO_COLLECTION } from "snu-lib";

import anonymize from "../anonymization/cohesionCenter";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";
import { getUserToSave } from "./utils";

const MODELNAME = MONGO_COLLECTION.COHESION_CENTER;

const schema = new Schema(CohesionCenterSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

export type CohesionCenterDocument<T = {}> = DocumentExtended<CohesionCenterType & T>;
type SchemaExtended = CohesionCenterDocument & UserExtension;

export const CohesionCenterModel = mongoose.model<CohesionCenterDocument>(MODELNAME, schema);
