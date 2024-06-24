const mongoose = require("mongoose");
const anonymize = require("../anonymization/waitingList");

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
  return anonymize(this);
};

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
