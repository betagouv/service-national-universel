import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import anonymize from "../anonymization/contract";

import { ContractSchema, InterfaceExtended, MONGO_COLLECTION } from "snu-lib";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";
import { getUserToSave } from "./utils";

const MODELNAME = MONGO_COLLECTION.CONTRACT;

const schema = new Schema(ContractSchema);

schema.methods.anonymise = function () {
  return anonymize(this);
};

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
  excludes: ["/parent1Token", "/projectManagerToken", "/structureManagerToken", "/parent2Token", "/youngContractToken", "/updatedAt"],
});

type ContractType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ContractDocument<T = {}> = DocumentExtended<ContractType & T>;
type SchemaExtended = ContractDocument & UserExtension;

export const ContractModel = mongoose.model<ContractDocument>(MODELNAME, schema);
