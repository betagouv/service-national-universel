const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const MODELNAME = "contract";

const Schema = new mongoose.Schema({
  youngId: { type: String },
  structureId: { type: String },
  applicationId: { type: String },
  missionId: { type: String },
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
  structureSiret: { type: String },
  structureName: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.fromUser = params?.fromUser;
  next();
});

Schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/parent1Token", "/projectManagerToken", "/structureManagerToken", "/parent2Token", "/youngContractToken"],
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
