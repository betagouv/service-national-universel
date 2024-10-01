import config from "config";
import mongoose, { Schema } from "mongoose";
import mongooseElastic from "@selego/mongoose-elastic";
import patchHistory from "mongoose-patch-history";

import esClient from "../es";
import anonymize from "../anonymization/sessionPhase1";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

import { SessionPhase1FileSchema, SessionPhase1Schema, SessionPhase1Type } from "snu-lib";

const MODELNAME = "sessionphase1";

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

if (config.get("ENABLE_MONGOOSE_ELASTIC")) {
  schema.plugin(mongooseElastic(esClient, { selectiveIndexing: true, ignore: ["team"] }), MODELNAME);
}

schema.index({ cohesionCenterId: 1 });

export type SessionPhase1Document<T = {}> = DocumentExtended<SessionPhase1Type & T>;
type SchemaExtended = SessionPhase1Document & UserExtension;

export const SessionPhase1Model = mongoose.model<SessionPhase1Document>(MODELNAME, schema);
