import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, SchoolRAMSESchema, MONGO_COLLECTION, getVirtualUser, getUserToSave, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.SCHOOL_RAMSES;

const schema = new Schema(SchoolRAMSESchema, { timestamps: true });

schema.virtual("user").set<SchemaExtended>(function (user: UserSaved) {
  this._user = getVirtualUser(user);
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  if (params?.fromUser) {
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

type SchoolRAMSESType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SchoolRAMSESDocument<T = {}> = DocumentExtended<SchoolRAMSESType & T>;
type SchemaExtended = SchoolRAMSESDocument & UserExtension;

export const SchoolRAMSESModel = mongoose.model<SchoolRAMSESDocument>(MODELNAME, schema);
