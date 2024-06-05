const mongoose = require("mongoose");
const patchHistory = require("mongoose-patch-history").default;
const { generateAddress, starify } = require("../utils/anonymise");

const MODELNAME = "meetingpoint";

const Schema = new mongoose.Schema({
  isValid: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le point de rassemblement est validé",
    },
  },
  cohort: {
    type: String,
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2021"],
    documentation: {
      description: "Cohorte",
    },
  },
  busId: {
    type: String,
    documentation: {
      description: "Id du car qui fera le trajet",
    },
  },
  busExcelId: {
    type: String,
    documentation: {
      description: "Id du fichier import du car qui fera le trajet",
    },
  },

  // centre (destination)
  centerId: {
    type: String,
  },
  centerCode: {
    type: String,
  },

  // lieu de départ
  departureAddress: {
    type: String,
  },
  departureZip: {
    type: String,
  },
  departureCity: {
    type: String,
  },
  departureDepartment: {
    type: String,
  },
  departureRegion: {
    type: String,
  },
  hideDepartmentInConvocation: {
    type: String,
  },

  // date de départ
  departureAt: {
    type: Date,
  },
  departureAtString: {
    type: String,
  },
  realDepartureAtString: {
    type: String,
  },
  // date de retour
  returnAt: {
    type: Date,
  },
  returnAtString: {
    type: String,
  },
  realReturnAtString: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

function anonymize(item) {
  item.departureAddress && (item.departureAddress = generateAddress());
  item.centerCode && (item.centerCode = starify(item.centerCode));
  return item;
};

Schema.methods.anonymise = function() { return anonymize(this); };

Schema.virtual("user").set(function (user) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.user = params?.fromUser;
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
  excludes: ["/updatedAt"],
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
module.exports.anonymize = anonymize;
