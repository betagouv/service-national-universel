const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const { getCohortNames } = require("snu-lib");
const esClient = require("../es");
const MODELNAME = "sessionphase1";
const { ENVIRONMENT } = require("../config");

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
    enum: [...getCohortNames(true, false, true)],
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

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.methods.anonymise = async function () {
  const doc = await OBJ.findById(this._id);
  doc.zipCenter = "00000";
  doc.codeCenter = "00000";
  doc.centerName = "********";
  doc.cityCenter = "*********";
  if (!["VALIDATED", "WAITING_VALIDATION"].includes(doc.status)) doc.status = "WAITING_VALIDATION";
  return doc;
};

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
if (ENVIRONMENT === "production") OBJ.syncIndexes();

module.exports = OBJ;
