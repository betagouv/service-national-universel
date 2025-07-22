const mongoose = require("mongoose");

const MODELNAME = "ventilation";

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    documentation: {
      description: "nom de la règle de ventilation",
    },
  },
  createdAt: { type: Date, default: Date.now, required: true },
  description: {
    type: String,
    required: true,
    documentation: {
      description: "description de la règle de ventilation",
    },
  },
  active: {
    type: Boolean,
    required: true,
    documentation: {
      description: "état de la règle de ventilation",
    },
  },
  conditionsEt: {
    type: [{ value: String, field: String, operator: String }],
    required: true,
    documentation: {
      description: "ensemble des conditions ET de la règle de ventilation",
    },
  },
  conditionsOu: {
    type: [{ value: String, field: String, operator: String }],
    required: true,
    documentation: {
      description: "ensemble des conditions OU de la règle de ventilation",
    },
  },
  actions: {
    type: [{ value: String, field: String, action: String }],
    required: true,
    documentation: {
      description: "ensemble des conditions de la règle de ventilation",
    },
  },
  userRole: {
    type: String,
    required: true,
    enum: ["AGENT", "ADMIN", "REFERENT_DEPARTMENT", "REFERENT_REGION"],
    documentation: {
      description: "Rôle de l'agent qui utilise la règle de ventilation",
    },
  },
  userDepartment: {
    type: String,
    documentation: {
      description: "Département de l'utilisateur qui utilise la règle de ventilation",
    },
  },
  userRegion: {
    type: String,
    documentation: {
      description: "Région de l'utilisateur qui utilise la règle de ventilation",
    },
  },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
