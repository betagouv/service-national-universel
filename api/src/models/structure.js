const mongoose = require("mongoose");

const mongoosastic = require("../es/mongoosastic");

const MODELNAME = "structure";

const Schema = new mongoose.Schema({
  sqlId: { type: String, index: true },
  name: { type: String, required: true }, // OK
  siret: { type: String }, // OK
  description: { type: String }, // OK

  website: { type: String },
  facebook: { type: String },
  twitter: { type: String },
  instagram: { type: String },

  status: { type: String, default: "WAITING_VALIDATION", enum: ["WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED"] },

  userId: { type: String },
  isNetwork: { type: String, enum: ["true", "false"] },
  networkId: { type: String },
  sqlNetworkId: { type: String },

  legalStatus: { type: String, default: "ASSOCIATION", enum: ["ASSOCIATION", "PUBLIC", "PRIVATE", "OTHER"] },

  associationTypes: { type: [String] },

  /*

        'association_types' => [
        "vocabulary" => "Types d'association",
        "terms" => [
            "Agrément jeunesse et éducation populaire" => "Agrément jeunesse et éducation populaire",
            "Agrément service civique" => "Agrément service civique",
            "Association complémentaire de l'enseignement public" => "Association complémentaire de l'enseignement public",
            "Associations d'usagers du système de santé" => "Associations d'usagers du système de santé",
            "Association sportive affiliée à une fédération sportive agréée par l'État" => "Association sportive affiliée à une fédération sportive agréée par l'État",
            "Agrément des associations de protection de l'environnement" => "Agrément des associations de protection de l'environnement",
            "Association agréée de sécurité civile" => "Association agréée de sécurité civile",
            "Autre agrément" => "Autre agrément",
        ]
    ],

    */
  structurePubliqueType: { type: String },
  structurePubliqueEtatType: { type: String },
  structurePriveeType: { type: String },
  address: { type: String },
  zip: { type: String },
  city: { type: String },
  department: { type: String },
  region: { type: String },
  country: { type: String },
  location: {
    lon: { type: Number },
    lat: { type: Number },
  },

  state: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.plugin(mongoosastic, MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
