const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../../es");
const { CLE_TYPE_LIST, CLE_SECTOR_LIST } = require("snu-lib");
const patchHistory = require("mongoose-patch-history").default;
const MODELNAME = "etablissement";
const ClasseModel = require("./classe");

const Schema = new mongoose.Schema({
  schoolId: {
    type: String,
    required: false,
    documentation: {
      description: "School Ramses rataché à l'établissement",
    },
  },

  uai: {
    type: String,
    required: true,
    documentation: {
      description: "Code UAI de l'établissement",
    },
  },

  name: {
    type: String,
    required: true,
    documentation: {
      description: "Nom de l'établissement",
    },
  },

  referentEtablissementIds: {
    type: [String],
    required: true,
    default: [],
    documentation: {
      description: "Liste des ids des chefs d'établissement",
    },
  },

  coordinateurIds: {
    type: [String],
    required: true,
    default: [],
    documentation: {
      description: "Liste des ids des coordinateurs d'établissement",
    },
  },

  department: {
    type: String,
    required: true,
    documentation: {
      description: "Département de l'établissement",
    },
  },

  region: {
    type: String,
    required: true,
    documentation: {
      description: "Région de l'établissement",
    },
  },

  zip: {
    type: String,
    required: true,
    documentation: {
      description: "Code postal de l'établissement",
    },
  },

  city: {
    type: String,
    required: true,
    documentation: {
      description: "Ville de l'établissement",
    },
  },

  address: {
    type: String,
    documentation: {
      description: "Adresse de l'établissement",
    },
  },

  country: {
    type: String,
    required: true,
    documentation: {
      description: "Pays de l'établissement",
    },
  },

  type: {
    type: [String],
    enum: CLE_TYPE_LIST,
    documentation: {
      description: "Type d'établissement",
    },
  },

  sector: {
    type: [String],
    enum: CLE_SECTOR_LIST,
    documentation: {
      description: "Secteur de l'établissement",
    },
  },

  state: {
    type: String,
    required: true,
    enum: ["active", "inactive"],
    default: "inactive",
    documentation: {
      description: "Etat de l'etablissement, active si au moins un eleves inscrits dans l'année scolaire en cours",
    },
  },

  academy: {
    type: String,
    required: true,
    documentation: {
      description: "Académie de l'établissement",
    },
  },

  schoolYears: {
    type: [String],
    required: true,
    default: [],
    documentation: {
      description: "Liste des années scolaires",
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

Schema.pre("save", async function (next, params) {
  this.user = params?.fromUser;
  this.updatedAt = Date.now();
  if (!this.isNew && (this.isModified("department") || this.isModified("region"))) {
    const classes = await ClasseModel.find({ etablissementId: this._id });
    if (classes.length > 0) {
      await ClasseModel.updateMany(
        { etablissementId: this._id },
        {
          department: this.department,
          region: this.region,
          academy: this.academy,
        },
      );
    }
  }

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
