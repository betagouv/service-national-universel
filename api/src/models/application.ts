import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import anonymize from "../anonymization/application";

import { ApplicationSchema, InterfaceExtended, MONGO_COLLECTION } from "snu-lib";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved } from "./types";
import { getUserToSave } from "./utils";

const MODELNAME = MONGO_COLLECTION.APPLICATION;

const schema = new Schema(ApplicationSchema);

schema.virtual("mission", {
  ref: "mission",
  localField: "missionId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("contract", {
  ref: "contract",
  localField: "contractId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("tutor", {
  ref: "referent",
  localField: "tutorId",
  foreignField: "_id",
  justOne: true,
});

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

schema.set("toObject", { virtuals: true });
schema.set("toJSON", { virtuals: true });

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

type ApplicationType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ApplicationDocument<T = {}> = DocumentExtended<ApplicationType & T>;
type SchemaExtended = ApplicationDocument & UserExtension;

export const ApplicationModel = mongoose.model<ApplicationDocument>(MODELNAME, schema);
