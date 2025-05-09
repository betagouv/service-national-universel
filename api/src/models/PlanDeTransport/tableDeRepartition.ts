import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import {
  InterfaceExtended,
  TableDeRepartitionSchema,
  MONGO_COLLECTION,
  getVirtualUser,
  buildPatchUser,
  DocumentExtended,
  CustomSaveParams,
  UserExtension,
  UserSaved,
} from "snu-lib";

const MODELNAME = MONGO_COLLECTION.TABLE_DE_REPARTITION;

const schema = new Schema(TableDeRepartitionSchema);

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

type TableDeRepartitionType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type TableDeRepartitionDocument<T = {}> = DocumentExtended<TableDeRepartitionType & T>;
type SchemaExtended = TableDeRepartitionDocument & UserExtension;

export const TableDeRepartitionModel = mongoose.model<TableDeRepartitionDocument>(MODELNAME, schema);
