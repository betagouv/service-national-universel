import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, SchoolRAMSESchema, MONGO_COLLECTION } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";

const MODELNAME = MONGO_COLLECTION.SCHOOL_RAMSES;

const schema = new Schema(SchoolRAMSESchema, { timestamps: true });

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

type SchoolRAMSESType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SchoolRAMSESDocument<T = {}> = DocumentExtended<SchoolRAMSESType & T>;
type SchemaExtended = SchoolRAMSESDocument & UserExtension;

export const SchoolRAMSESModel = mongoose.model<SchoolRAMSESDocument>(MODELNAME, schema);
