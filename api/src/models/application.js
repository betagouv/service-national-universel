const mongoose = require("mongoose");

const mongoosastic = require("../es/mongoosastic");

const MODELNAME = "application";

const Schema = new mongoose.Schema({
  youngId: { type: String },
  youngFirstName: { type: String },
  youngLastName: { type: String },
  youngEmail: { type: String },
  youngBirthdateAt: { type: String },
  youngCity: { type: String },
  youngDepartment: { type: String },

  missionId: { type: String },
  missionName: { type: String },
  missionDepartment: { type: String },
  missionRegion: { type: String },

  structureId: { type: String },

  priority: { type: String },

  // STATUS EXISTANT :
  //
  // MISSION_EN_COURS : IN_PROGRESS
  // MISSION_EFFECTUEE : DONE
  // MISSION_NON_ACHEVEE : NOT_COMPLETED
  // CANDIDATURE_CREEE : WAITING_VALIDATION
  // CANDIDATURE_REFUSEE : REFUSED
  // CANDIDATURE_VALIDEE : VALIDATED
  // CANDIDATURE_ANNULEE : CANCEL
  // CANDIDATURE_PRESELECTIONNEE : PRESELECTED
  // CANDIDATURE_CONTRAT_SIGNE : SIGNED_CONTRACT

  status: {
    type: String,
    enum: [
      "WAITING_VALIDATION",
      "WAITING_ACCEPTATION",
      "VALIDATED",
      "REFUSED",
      "CANCEL",
      "ARCHIVED",
      "IN_PROGRESS",
      "DONE",
      "NOT_COMPLETED",
      "PRESELECTED",
      "SIGNED_CONTRACT",
      "ABANDON",
    ],
    default: "WAITING_VALIDATION",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongoosastic, MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
