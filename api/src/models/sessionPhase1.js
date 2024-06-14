const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const { getCohortNames } = require("snu-lib");
const esClient = require("../es");
const MODELNAME = "sessionphase1";
const config = require("config");
const { starify } = require("../utils/anonymise");

const File = new mongoose.Schema({
  _id: String,
  name: String,
  uploadedAt: Date,
  size: Number,
  mimetype: String,
});

const Schema = new mongoose.Schema({
  cohesionCenterId: {
    type: String,
    documentation: {
      description: "Id du centre de cohésion",
    },
  },
  cohort: {
    type: String,
    enum: getCohortNames(true, false, true),
    documentation: {
      description: "Cohorte",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département du centre",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région du centre",
    },
  },
  codeCentre: {
    type: String,
    documentation: {
      description: "Code du centre",
    },
  },
  nameCentre: {
    type: String,
    documentation: {
      description: "Nom du centre",
    },
  },
  zipCentre: {
    type: String,
    documentation: {
      description: "Zip du centre",
    },
  },
  cityCentre: {
    type: String,
    documentation: {
      description: "Ville du centre",
    },
  },
  headCenterId: {
    type: String,
    documentation: {
      description: "Id de l'utilisateur responsable, le chef de centre",
    },
  },
  team: {
    type: [
      {
        firstName: {
          type: String,
          description: "prénom du membre de l'équipe",
        },
        lastName: {
          type: String,
          description: "nom du membre de l'équipe",
        },
        role: {
          type: String,
          description: "role du membre de l'équipe",
        },
        email: {
          type: String,
          description: "email du membre de l'équipe",
        },
        phone: {
          type: String,
          description: "téléphone du membre de l'équipe",
        },
      },
    ],
    documentation: {
      description: "equipe d'encadrement pour le séjour",
    },
  },
  waitingList: {
    type: [String],
    documentation: {
      description: "Liste  des jeunes en liste d'attente sur ce séjour de cohésion",
    },
  },

  placesTotal: {
    type: Number,
    documentation: {
      description: "Nombre de places au total",
    },
  },
  placesLeft: {
    type: Number,
    documentation: {
      description: "Nombre de places disponibles",
    },
  },

  timeScheduleFiles: {
    type: [File],
    documentation: {
      description: "Fichiers d'emploi du temps",
    },
  },
  hasTimeSchedule: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La session possède au moins 1 fichier d'emploi du temps.",
    },
  },

  pedagoProjectFiles: {
    type: [File],
    documentation: {
      description: "Fichiers du projet pédagogique",
    },
  },
  hasPedagoProject: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La session possède au moins 1 fichier de projet pédagogique.",
    },
  },

  dateStart: {
    type: Date,
    documentation: {
      description: "Date spécifique de début du séjour",
    },
  },
  dateEnd: {
    type: Date,
    documentation: {
      description: "Date spécifique de fin du séjour",
    },
  },

  // TODO: remove this field
  status: {
    type: String,
    default: "WAITING_VALIDATION",
    enum: ["VALIDATED", "WAITING_VALIDATION"],
    documentation: {
      description: "Statut",
    },
  },

  sanitaryContactEmail: {
    type: String,
    documentation: {
      description: "email nécessaire pour envoyer la fiche sanitaire au centre de la sessions",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.methods.anonymise = function () {
  this.zipCenter && (this.zipCenter = starify(this.zipCenter));
  this.codeCenter && (this.codeCenter = starify(this.codeCenter));
  this.centerName && (this.centerName = starify(this.centerName));
  this.cityCenter && (this.cityCenter = starify(this.cityCenter));
  if (!["VALIDATED", "WAITING_VALIDATION"].includes(this.status)) this.status = "WAITING_VALIDATION";
  this.team &&
    (this.team = this.team.map((member) => {
      member.firstName && (member.firstName = starify(member.firstName));
      member.lastName && (member.lastName = starify(member.lastName));
      member.email && (member.email = starify(member.email));
      member.phone && (member.phone = starify(member.phone));
      return member;
    }));
  return this;
};

Schema.virtual("cohesionCenter", {
  ref: "cohesioncenter",
  localField: "cohesionCenterId",
  foreignField: "_id",
  justOne: true,
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

Schema.plugin(mongooseElastic(esClient, { selectiveIndexing: true, ignore: ["team"] }), MODELNAME);

Schema.index({ cohesionCenterId: 1 });

const OBJ = mongoose.model(MODELNAME, Schema);

module.exports = OBJ;
