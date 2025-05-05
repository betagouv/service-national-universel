import mongoose, { InferSchemaType, Schema } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";
import { InterfaceExtended, PointDeRassemblementSchema, MONGO_COLLECTION } from "snu-lib";
import { getUserToSave } from "../utils";

const MODELNAME = MONGO_COLLECTION.POINT_DE_RASSEMBLEMENT;

const schema = new Schema(PointDeRassemblementSchema);

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

type PointDeRassemblementType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type PointDeRassemblementDocument<T = {}> = DocumentExtended<PointDeRassemblementType & T>;
type SchemaExtended = PointDeRassemblementDocument & UserExtension;

export const PointDeRassemblementModel = mongoose.model<PointDeRassemblementDocument>(MODELNAME, schema);
