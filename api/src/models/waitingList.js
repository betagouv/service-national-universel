const mongoose = require("mongoose");
const { generateRandomEmail, generateBirthdate } = require("../utils/anonymise");

const MODELNAME = "waitinglist";

const Schema = new mongoose.Schema({
  zip: {
    type: String,
    documentation: {
      description: "Code postal du jeune",
    },
  },
  mail: {
    type: String,
    documentation: {
      description: "Mail du jeune",
    },
  },
  birthdateAt: {
    type: String,
    documentation: {
      description: "date de naissance",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.methods.anonymise = function () {
  this.mail && (this.mail = generateRandomEmail());
  this.birthdateAt && (this.birthdateAt = generateBirthdate());
  return this;
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
