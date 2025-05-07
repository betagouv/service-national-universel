import mongoose, { InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, MissionSchema, MONGO_COLLECTION, getVirtualUser, buildPatchUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

import anonymize from "../anonymization/mission";

const MODELNAME = MONGO_COLLECTION.MISSION;

const schema = new mongoose.Schema(MissionSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

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

type MissionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type MissionDocument<T = {}> = DocumentExtended<MissionType & T>;
type SchemaExtended = MissionDocument & UserExtension;

export const MissionModel = mongoose.model<MissionDocument>(MODELNAME, schema);
