import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, ModificationBusSchema } from "snu-lib";

import anonymize from "../../anonymization/PlanDeTransport/modificationBus";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";

const MODELNAME = "modificationbus";

const schema = new Schema(ModificationBusSchema);

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

type ModificationBusType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ModificationBusDocument<T = {}> = DocumentExtended<ModificationBusType & T>;
type SchemaExtended = ModificationBusDocument & UserExtension;

export const ModificationBusModel = mongoose.model<ModificationBusDocument>(MODELNAME, schema);
