import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import anonymize from "../anonymization/contract";

import { ContractSchema, InterfaceExtended, MONGO_COLLECTION, getVirtualUser, buildPatchUser, DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "snu-lib";

const MODELNAME = MONGO_COLLECTION.CONTRACT;

const schema = new Schema(ContractSchema);

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
  excludes: ["/parent1Token", "/projectManagerToken", "/structureManagerToken", "/parent2Token", "/youngContractToken", "/updatedAt"],
});

type ContractType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ContractDocument<T = {}> = DocumentExtended<ContractType & T>;
type SchemaExtended = ContractDocument & UserExtension;

export const ContractModel = mongoose.model<ContractDocument>(MODELNAME, schema);
