import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, MeetingPointSchema } from "snu-lib";

import anonymize from "../anonymization/meetingPoint";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = "meetingpoint";

const schema = new Schema(MeetingPointSchema);

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

type MeetingPointType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type MeetingPointDocument<T = {}> = DocumentExtended<MeetingPointType & T>;
type SchemaExtended = MeetingPointDocument & UserExtension;

export const MeetingPointModel = mongoose.model<MeetingPointDocument>(MODELNAME, schema);
