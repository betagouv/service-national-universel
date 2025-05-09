import mongoose, { InferSchemaType, Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
  InterfaceExtended,
  PointDeRassemblementSchema,
  MONGO_COLLECTION,
  buildPatchUser,
  getVirtualUser,
  DocumentExtended,
  CustomSaveParams,
  UserExtension,
  UserSaved,
} from "snu-lib";

const MODELNAME = MONGO_COLLECTION.POINT_DE_RASSEMBLEMENT;

const schema = new Schema(PointDeRassemblementSchema);

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

type PointDeRassemblementType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type PointDeRassemblementDocument<T = {}> = DocumentExtended<PointDeRassemblementType & T>;
type SchemaExtended = PointDeRassemblementDocument & UserExtension;

export const PointDeRassemblementModel = mongoose.model<PointDeRassemblementDocument>(MODELNAME, schema);
