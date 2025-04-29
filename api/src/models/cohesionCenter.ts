import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { CohesionCenterSchema, CohesionCenterType, MONGO_COLLECTION } from "snu-lib";

import anonymize from "../anonymization/cohesionCenter";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = MONGO_COLLECTION.COHESION_CENTER;

const schema = new Schema(CohesionCenterSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

export type CohesionCenterDocument<T = {}> = DocumentExtended<CohesionCenterType & T>;
type SchemaExtended = CohesionCenterDocument & UserExtension;

export const CohesionCenterModel = mongoose.model<CohesionCenterDocument>(MODELNAME, schema);
