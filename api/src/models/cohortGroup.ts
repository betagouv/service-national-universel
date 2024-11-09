import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { CohortGroupSchema, CohortGroupType } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = "cohortGroup";

const schema = new Schema(CohortGroupSchema);

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

export type CohortGroupDocument<T = {}> = DocumentExtended<CohortGroupType & { cohortGroup?: CohortGroupDocument } & T>;
type SchemaExtended = CohortGroupDocument & UserExtension;

export const CohortGroupModel = mongoose.model<CohortGroupDocument>(MODELNAME, schema);
