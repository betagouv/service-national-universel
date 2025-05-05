import mongoose, { InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, MissionSchema, MONGO_COLLECTION } from "snu-lib";

import anonymize from "../anonymization/mission";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";
import { getUserToSave } from "./utils";

const MODELNAME = MONGO_COLLECTION.MISSION;

const schema = new mongoose.Schema(MissionSchema);

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

type MissionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type MissionDocument<T = {}> = DocumentExtended<MissionType & T>;
type SchemaExtended = MissionDocument & UserExtension;

export const MissionModel = mongoose.model<MissionDocument>(MODELNAME, schema);
