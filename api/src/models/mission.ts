import config from "config";
import mongoose, { InferSchemaType } from "mongoose";
import mongooseElastic from "@selego/mongoose-elastic";
import patchHistory from "mongoose-patch-history";
import { MissionSchema } from "snu-lib";

import esClient from "../es";
import anonymize from "../anonymization/mission";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "mission";

const schema = new mongoose.Schema(MissionSchema);

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

if (config.get("ENABLE_MONGOOSE_ELASTIC")) {
  schema.plugin(mongooseElastic(esClient, { selectiveIndexing: true, ignore: ["jvaRawData"] }), MODELNAME);
}

export type MissionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type MissionDocument<T = {}> = DocumentExtended<MissionType & T>;
type SchemaExtended = MissionDocument & UserExtension;

export const MissionModel = mongoose.model<MissionDocument>(MODELNAME, schema);
