import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, MissionEquivalenceSchema, MONGO_COLLECTION } from "snu-lib";

import anonymize from "../anonymization/missionEquivalence";
import { DocumentExtended, CustomSaveParams, UserExtension } from "./types";

const MODELNAME = MONGO_COLLECTION.MISSION_EQUIVALENCE;

const schema = new Schema(MissionEquivalenceSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser) {
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

type MissionEquivalenceType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type MissionEquivalenceDocument<T = {}> = DocumentExtended<MissionEquivalenceType & T>;
type SchemaExtended = MissionEquivalenceDocument & UserExtension;

export const MissionEquivalenceModel = mongoose.model<MissionEquivalenceDocument>(MODELNAME, schema);
