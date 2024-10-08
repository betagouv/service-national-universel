import config from "config";
import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";
import esClient from "../es";
import anonymize from "../anonymization/application";

import { ApplicationSchema, InterfaceExtended } from "snu-lib";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = "application";

const schema = new Schema(ApplicationSchema);

schema.virtual("mission", {
  ref: "mission",
  localField: "missionId",
  foreignField: "_id",
  justOne: true,
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

if (config.get("ENABLE_MONGOOSE_ELASTIC")) {
  schema.plugin(mongooseElastic(esClient), MODELNAME);
}

type ApplicationType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ApplicationDocument<T = {}> = DocumentExtended<ApplicationType & T>;
type SchemaExtended = ApplicationDocument & UserExtension;

export const ApplicationModel = mongoose.model<ApplicationDocument>(MODELNAME, schema);
