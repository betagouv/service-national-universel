const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../es");
const { STATUS_CLASSE_LIST, STATUS_PHASE1_CLASSE_LIST, CLE_TYPE_LIST, CLE_SECTOR_LIST, CLE_GRADE_LIST, CLE_COLORATION_LIST } = require("snu-lib");
const patchHistory = require("mongoose-patch-history").default;
const MODELNAME = "classe";

const Schema = new mongoose.Schema({
  etablissementId: {
    type: String,
    required: true,
    documentation: {
      description: "ID de l'établissement",
    },
  },

  referentClasseIds: {
    type: [String],
    required: true,
    documentation: {
      description: "ID du référent de classe",
    },
  },

  cohort: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte de la classe",
    },
  },

  uniqueKey: {
    type: String,
    required: true,
    documentation: {
      description: "Clé unique de la classe (UAI_DATE_*)",
    },
  },

  uniqueId: {
    type: String,
    required: true,
    documentation: {
      description: "ID unique de la classe (*_XXXX)",
    },
  },

  name: {
    type: String,
    documentation: {
      description: "Nom de la classe",
    },
  },

  //TODO update enum
  coloration: {
    type: String,
    enum: CLE_COLORATION_LIST,
    documentation: {
      description: "Couleur de la classe",
    },
  },

  totalSeats: {
    type: Number,
    documentation: {
      description: "Nombre de places total de la classe",
    },
  },

  seatsTaken: {
    type: Number,
    default: 0,
    documentation: {
      description: "Nombre de places prises de la classe",
    },
  },

  //TODO update with the good type enum
  type: {
    type: String,
    enum: CLE_TYPE_LIST,
    documentation: {
      description: "Type de la classe",
    },
  },

  //TODO update with the good sector enum
  sector: {
    type: String,
    enum: CLE_SECTOR_LIST,
    documentation: {
      description: "Filière de l'établissement",
    },
  },

  grade: {
    type: String,
    enum: CLE_GRADE_LIST,
    documentation: {
      description: "Niveau de la classe",
    },
  },

  status: {
    type: String,
    required: true,
    enum: STATUS_CLASSE_LIST,
    documentation: {
      description: "Statut de la classe",
    },
  },

  statusPhase1: {
    type: String,
    required: true,
    enum: STATUS_PHASE1_CLASSE_LIST,
    documentation: {
      description: "Statut de la classe pour la phase 1",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
});

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

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
