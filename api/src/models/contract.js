const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");

const MODELNAME = "contract";

const Schema = new mongoose.Schema({
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
  parent2FirstName: { type: String },
  parent2LastName: { type: String },
  parent2Address: { type: String },
  parent2City: { type: String },
  parent2Department: { type: String },
  parent2Phone: { type: String },
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

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
