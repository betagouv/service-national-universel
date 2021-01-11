const mongoose = require("mongoose");

const mongoosastic = require("../es/mongoosastic");

const MODELNAME = "application";

const Schema = new mongoose.Schema({
  youngId: { type: String },
  youngFirstName: { type: String },
  youngLastName: { type: String },
  youngEmail: { type: String },

  missionId: { type: String },
  missionName: { type: String },
  missionDepartment: { type: String },
  missionRegion: { type: String },

  // STATUS EXISTANT :
  //
  // MISSION_EN_COURS
  // MISSION_EFFECTUEE
  // MISSION_NON_ACHEVEE
  // CANDIDATURE_CREEE
  // CANDIDATURE_REFUSEE
  // CANDIDATURE_VALIDEE
  // CANDIDATURE_ANNULEE
  // CANDIDATURE_PRESELECTIONNEE
  // CANDIDATURE_CONTRAT_SIGNE

  status: { type: String, enum: ["WAITING_VALIDATION", "VALIDATED", "REFUSED", "CANCEL", "ARCHIVED"], default: "WAITING_VALIDATION" },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongoosastic, MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
