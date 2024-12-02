import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";

import { InterfaceExtended, LigneBusSchema, LigneBusTeamSchema } from "snu-lib";

import anonymize from "../../anonymization/PlanDeTransport/ligneBus";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "../types";

const MODELNAME = "lignebus";

const schema = new Schema({
  ...LigneBusSchema,
  team: {
    ...LigneBusSchema.team,
    type: [new Schema(LigneBusTeamSchema)],
  },
});

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

schema.index({ cohort: 1 });
schema.index({ cohort: 1, busId: 1 }, { unique: true });

type LigneBusType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type LigneBusDocument<T = {}> = DocumentExtended<LigneBusType & T>;
type SchemaExtended = LigneBusDocument & UserExtension;

export const LigneBusModel = mongoose.model<LigneBusDocument>(MODELNAME, schema);
