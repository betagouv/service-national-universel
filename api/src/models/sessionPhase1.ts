import mongoose, { Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
  SessionPhase1FileSchema,
  SessionPhase1Schema,
  SessionPhase1Type,
  MONGO_COLLECTION,
  getVirtualUser,
  buildPatchUser,
  DocumentExtended,
  CustomSaveParams,
  UserExtension,
  UserSaved,
} from "snu-lib";

import anonymize from "../anonymization/sessionPhase1";

const MODELNAME = MONGO_COLLECTION.SESSION_PHASE1;

const schema = new Schema({
  ...SessionPhase1Schema,
  timeScheduleFiles: {
    ...SessionPhase1Schema.timeScheduleFiles,
    type: [new Schema(SessionPhase1FileSchema)],
  },
  pedagoProjectFiles: {
    ...SessionPhase1Schema.pedagoProjectFiles,
    type: [new Schema(SessionPhase1FileSchema)],
  },
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

schema.virtual("cohesionCenter", {
  ref: "cohesioncenter",
  localField: "cohesionCenterId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  if (params?.fromUser) {
    this.user = buildPatchUser(params.fromUser);
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

schema.index({ cohesionCenterId: 1 });

export type SessionPhase1Document<T = {}> = DocumentExtended<SessionPhase1Type & T>;
type SchemaExtended = SessionPhase1Document & UserExtension;

export const SessionPhase1Model = mongoose.model<SessionPhase1Document>(MODELNAME, schema);
