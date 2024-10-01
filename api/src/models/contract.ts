import config from "config";
import mongoose, { Schema, InferSchemaType } from "mongoose";
import patchHistory from "mongoose-patch-history";
import mongooseElastic from "@selego/mongoose-elastic";
import esClient from "../es";
import anonymize from "../anonymization/contract";

import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "contract";

const schema = new Schema({
  youngId: { type: String },
  structureId: { type: String },
  applicationId: { type: String },
  missionId: { type: String },
  //deprecated (only firstname and lastname are used)
  tutorId: { type: String },
  isYoungAdult: { type: String, default: "false" },

  parent1Token: { type: String },
  projectManagerToken: { type: String },
  structureManagerToken: { type: String },
  parent2Token: { type: String },
  youngContractToken: { type: String },

  parent1Status: {
    type: String,
    default: "WAITING_VALIDATION",
    enum: ["WAITING_VALIDATION", "VALIDATED"],
  },
  projectManagerStatus: {
    type: String,
    default: "WAITING_VALIDATION",
    enum: ["WAITING_VALIDATION", "VALIDATED"],
  },
  structureManagerStatus: {
    type: String,
    default: "WAITING_VALIDATION",
    enum: ["WAITING_VALIDATION", "VALIDATED"],
  },
  parent2Status: {
    type: String,
    default: "WAITING_VALIDATION",
    enum: ["WAITING_VALIDATION", "VALIDATED"],
  },
  youngContractStatus: {
    type: String,
    default: "WAITING_VALIDATION",
    enum: ["WAITING_VALIDATION", "VALIDATED"],
  },

  parent1ValidationDate: { type: Date },
  projectManagerValidationDate: { type: Date },
  structureManagerValidationDate: { type: Date },
  parent2ValidationDate: { type: Date },
  youngContractValidationDate: { type: Date },

  invitationSent: { type: String },
  youngFirstName: { type: String },
  youngLastName: { type: String },
  youngBirthdate: { type: String },
  youngAddress: { type: String },
  youngCity: { type: String },
  youngDepartment: { type: String },
  youngEmail: { type: String },
  youngPhone: { type: String },
  parent1FirstName: { type: String },
  parent1LastName: { type: String },
  parent1Address: { type: String },
  parent1City: { type: String },
  parent1Department: { type: String },
  parent1Phone: { type: String },
  parent1Email: { type: String },
  parent2FirstName: { type: String },
  parent2LastName: { type: String },
  parent2Address: { type: String },
  parent2City: { type: String },
  parent2Department: { type: String },
  parent2Phone: { type: String },
  parent2Email: { type: String },
  missionName: { type: String },
  missionObjective: { type: String },
  missionAction: { type: String },
  missionStartAt: { type: String },
  missionEndAt: { type: String },
  missionAddress: { type: String },
  missionCity: { type: String },
  missionZip: { type: String },
  missionDuration: { type: String },
  missionFrequence: { type: String },
  date: { type: String },
  projectManagerFirstName: { type: String },
  projectManagerLastName: { type: String },
  projectManagerRole: { type: String },
  projectManagerEmail: { type: String },
  structureManagerFirstName: { type: String },
  structureManagerLastName: { type: String },
  structureManagerRole: { type: String },
  structureManagerEmail: { type: String },
  tutorFirstName: { type: String },
  tutorLastName: { type: String },
  //deprecated (only firstname and lastname are used)
  tutorRole: { type: String },
  //deprecated (only firstname and lastname are used)
  tutorEmail: { type: String },
  structureSiret: { type: String },
  structureName: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.fromUser = params?.fromUser;
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

if (config.get("ENABLE_MONGOOSE_ELASTIC")) {
  schema.plugin(mongooseElastic(esClient), MODELNAME);
}

export type ContractType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type ContractDocument<T = {}> = DocumentExtended<ContractType & T>;
type SchemaExtended = ContractDocument & UserExtension;

export const ContractModel = mongoose.model<ContractDocument>(MODELNAME, schema);
