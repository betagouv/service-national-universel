import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
  ImportPlanTransportSchema,
  InterfaceExtended,
  MONGO_COLLECTION,
  getUserToSave,
  getVirtualUser,
  DocumentExtended,
  CustomSaveParams,
  UserExtension,
  UserSaved,
} from "snu-lib";

const MODELNAME = MONGO_COLLECTION.IMPORT_PLAN_TRANSPORT;

const schema = new Schema(ImportPlanTransportSchema);

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

type ImportPlanTransportType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ImportPlanTransportDocument<T = {}> = DocumentExtended<ImportPlanTransportType & T>;
type SchemaExtended = ImportPlanTransportDocument & UserExtension;

export const ImportPlanTransportModel = mongoose.model<ImportPlanTransportDocument>(MODELNAME, schema);
