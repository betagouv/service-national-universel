const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const MODELNAME = "contract";
const { generateBirthdate, generateNewPhoneNumber, starify } = require("../utils/anonymise");

const Schema = new mongoose.Schema({
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

function anonymize(item) {
  item.tutorFirstName && (item.tutorFirstName = starify(item.tutorFirstName));
  item.tutorLastName && (item.tutorLastName = starify(item.tutorLastName));
  item.tutorEmail && (item.tutorEmail = "*******@*******.***");
  item.youngFirstName && (item.youngFirstName = starify(item.youngFirstName));
  item.youngLastName && (item.youngLastName = starify(item.youngLastName));
  item.youngBirthdate && (item.youngBirthdate = generateBirthdate());
  item.youngEmail && (item.youngEmail = "*******@*******.***");
  item.youngPhone && (item.youngPhone = generateNewPhoneNumber());
  item.youngAddress && (item.youngAddress = starify(item.youngAddress));
  item.parent1FirstName && (item.parent1FirstName = starify(item.parent1FirstName));
  item.parent1LastName && (item.parent1LastName = starify(item.parent1LastName));
  item.parent1Email && (item.parent1Email = "*******@*******.***");
  item.parent1Adress && (item.parent1Adress = starify(item.parent1Adress));
  item.parent1Phone && (item.parent1Phone = generateNewPhoneNumber());
  item.parent2FirstName && (item.parent2FirstName = starify(item.parent2FirstName));
  item.parent2LastName && (item.parent2LastName = starify(item.parent2LastName));
  item.parent2Email && (item.parent2Email = "*******@*******.***");
  item.parent2Adress && (item.parent2Adress = starify(item.parent2Adress));
  item.parent2Phone && (item.parent2Phone = generateNewPhoneNumber());
  item.missionName && (item.missionName = starify(item.missionName));
  item.missionAdress && (item.missionAdress = starify(item.missionAdress));
  item.missionZip && (item.missionZip = starify(item.missionZip));
  item.missionObjective && (item.missionObjective = starify(item.missionObjective));
  item.missionAction && (item.missionAction = starify(item.missionAction));
  item.missionFrequence && (item.missionFrequence = starify(item.missionFrequence));
  item.missionDuration && (item.missionDuration = starify(item.missionDuration));
  item.projectManagerFirstName && (item.projectManagerFirstName = starify(item.projectManagerFirstName));
  item.projectManagerLastName && (item.projectManagerLastName = starify(item.projectManagerLastName));
  item.projectManagerEmail && (item.projectManagerEmail = "*******@*******.***");
  item.structureName && (item.structureName = starify(item.structureName));
  item.structureManagerEmail && (item.structureManagerEmail = "*******@*******.***");
  item.structureManagerFirstName && (item.structureManagerFirstName = starify(item.structureManagerFirstName));
  item.structureManagerLastName && (item.structureManagerLastName = starify(item.structureManagerLastName));
  return item;
};

Schema.methods.anonymise = function() { return anonymize(this); };

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.fromUser = params?.fromUser;
  this.updatedAt = Date.now();
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
  excludes: ["/parent1Token", "/projectManagerToken", "/structureManagerToken", "/parent2Token", "/youngContractToken", "/updatedAt"],
});

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
module.exports.anonymize = anonymize;
