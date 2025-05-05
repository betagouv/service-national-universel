import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { CohesionCenterSchema, CohesionCenterType, MONGO_COLLECTION, getVirtualUser, getUserToSave, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

import anonymize from "../anonymization/cohesionCenter";

const MODELNAME = MONGO_COLLECTION.COHESION_CENTER;

const schema = new Schema(CohesionCenterSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  if (params?.fromUser) {
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
