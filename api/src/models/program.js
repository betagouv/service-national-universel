const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const MODELNAME = "program";
const patchHistory = require("mongoose-patch-history").default;

const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    documentation: {
      description: "nom du programmes",
    },
  },
  description: {
    type: String,
    documentation: {
      description: "description du programme",
    },
  },
  descriptionFor: {
    type: String,
    documentation: {
      description: "desc du programme : C'est pour ?",
    },
  },
  descriptionMoney: {
    type: String,
    documentation: {
      description: "desc du programme : Est-ce indemnisé",
    },
  },
  descriptionDuration: {
    type: String,
    documentation: {
      description: "desc du programme : Quelle durée d'engagement ?",
    },
  },
  url: {
    type: String,
    documentation: {
      description: "lien vers son site web",
    },
  },
  imageFile: {
    type: String,
    documentation: {
      description: "image (fichier)",
    },
  },
  imageString: {
    type: String,
    default: "default.png",
    documentation: {
      description: "nom fichier image",
    },
  },
  type: {
    type: String,
    documentation: {
      description: "Type de l'engagement (formation, engagement, ...)",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département concerné, si applicable",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région concernée, si applicable",
    },
  },
  visibility: {
    type: String,
    documentation: {
      description: "",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.virtual("fromUser").set(function (fromUser) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

Schema.pre("save", function (next, params) {
  this.fromUser = params?.fromUser;
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
