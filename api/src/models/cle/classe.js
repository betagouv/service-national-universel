const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const { esClient } = require("../../es");
const { STATUS_CLASSE_LIST, STATUS_PHASE1_CLASSE_LIST, CLE_FILIERE_LIST, CLE_GRADE_LIST, CLE_COLORATION_LIST } = require("snu-lib");
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
    documentation: {
      description: "ID unique de la classe (*_XXXX)",
    },
  },

  uniqueKeyAndId: {
    type: String,
    required: true,
    documentation: {
      description: "Key_ID unique de la classe (UAI_DATE_XXXX)",
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

  //TODO update with the good filiere enum
  filiere: {
    type: String,
    enum: CLE_FILIERE_LIST,
    documentation: {
      description: "Filière de la classe",
    },
  },

  grade: {
    type: String,
    enum: CLE_GRADE_LIST,
    documentation: {
      description: "Niveau de la classe",
    },
  },

  cohesionCenterId: {
    type: String,
    documentation: {
      description: "ID du centre de cohésion",
    },
  },

  sessionId: {
    type: String,
    documentation: {
      description: "ID de la session",
    },
  },

  ligneId: {
    type: String,
    documentation: {
      description: "ID de la ligne de bus",
    },
  },

  pointDeRassemblementId: {
    type: String,
    documentation: {
      description: "ID du point de rassemblement",
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

Schema.virtual("etablissement", {
  ref: "etablissement",
  localField: "etablissementId",
  foreignField: "_id",
  justOne: true,
});

Schema.virtual("referents", {
  ref: "referent",
  localField: "referentClasseIds",
  foreignField: "_id",
});

Schema.virtual("cohesionCenter", {
  ref: "cohesioncenter",
  localField: "cohesionCenterId",
  foreignField: "_id",
  justOne: true,
});

Schema.virtual("session", {
  ref: "sessionphase1",
  localField: "sessionId",
  foreignField: "_id",
  justOne: true,
});

Schema.virtual("pointDeRassemblement", {
  ref: "pointderassemblement",
  localField: "pointDeRassemblementId",
  foreignField: "_id",
  justOne: true,
});

Schema.virtual("ligne", {
  ref: "lignebuses",
  localField: "ligneId",
  foreignField: "_id",
  justOne: true,
});

Schema.virtual("isFull").get(function () {
  return this.totalSeats - this.seatsTaken <= 0;
});

Schema.virtual("department").get(function () {
  return this.etablissement?.department ?? null;
});

Schema.virtual("region").get(function () {
  return this.etablissement?.region ?? null;
});

Schema.virtual("user").set(function (user) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model } = user;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.set("toObject", { virtuals: true });
Schema.set("toJSON", { virtuals: true });

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

Schema.plugin(
  mongooseElastic(esClient(), {
    populate: ["etablissement"],
    virtuals: [
      { key: "region", type: "String" },
      { key: "department", type: "String" },
    ],
  }),
  MODELNAME,
);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
