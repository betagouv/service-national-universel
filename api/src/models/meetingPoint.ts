import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, MeetingPointSchema, MONGO_COLLECTION, getVirtualUser, buildPatchUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

import anonymize from "../anonymization/meetingPoint";

const MODELNAME = MONGO_COLLECTION.MEETING_POINT;

const schema = new Schema(MeetingPointSchema);

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

type MeetingPointType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type MeetingPointDocument<T = {}> = DocumentExtended<MeetingPointType & T>;
type SchemaExtended = MeetingPointDocument & UserExtension;

export const MeetingPointModel = mongoose.model<MeetingPointDocument>(MODELNAME, schema);
