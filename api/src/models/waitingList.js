const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const { generateRandomEmail, generateBirhtdate } = require("../utils/anonymise");

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

Schema.methods.anonymise = async function () {
  const doc = await OBJ.findById(this._id);
  doc.mail = generateRandomEmail();
  doc.birthdateAt = generateBirhtdate();
  return doc;
};

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
