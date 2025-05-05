import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { CohortGroupSchema, CohortGroupType, MONGO_COLLECTION, getVirtualUser, getUserToSave, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.COHORT_GROUP;

const schema = new Schema(CohortGroupSchema);

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

export type CohortGroupDocument<T = {}> = DocumentExtended<CohortGroupType & { cohortGroup?: CohortGroupDocument } & T>;
type SchemaExtended = CohortGroupDocument & UserExtension;

export const CohortGroupModel = mongoose.model<CohortGroupDocument>(MODELNAME, schema);
