const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const patchHistory = require("mongoose-patch-history").default;
const anonymize = require("../anonymization/application");

const MODELNAME = "application";

const Schema = new mongoose.Schema({
  sqlId: {
    type: String,
    documentation: {
      description: "(migration) Identifiant dans l'ancienne base de données",
    },
  },
  apiEngagementId: {
    type: String,
    documentation: {
      description: "Identifiant de la candidature (Activity) dans l'API Engagement",
    },
  },
  youngId: {
    type: String,
    documentation: {
      description: "Identifiant du volontaire",
    },
  },
  youngFirstName: {
    type: String,
    documentation: {
      description: "Prénom du volontaire",
    },
  },
  youngLastName: {
    type: String,
    documentation: {
      description: "Nom du volontaire",
    },
  },
  youngEmail: {
    type: String,
    documentation: {
      description: "E-mail du volontaire",
    },
  },
  youngBirthdateAt: {
    type: String,
    documentation: {
      description: "Date de naissance du volontaire",
    },
  },
  youngCity: {
    type: String,
    documentation: {
      description: "Ville de résidence du volontaire",
    },
  },
  youngDepartment: {
    type: String,
    documentation: {
      description: "Département du volontaire",
    },
  },
  youngCohort: {
    type: String,
    documentation: {
      description: "Cohorte du volontaire",
    },
  },

  missionId: {
    type: String,
    documentation: {
      description: "Identifiant de la mission",
    },
  },

  isJvaMission: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "Mission proposée par JVA",
    },
  },

  missionName: {
    type: String,
    documentation: {
      description: "Titre de la mission",
    },
  },
  missionDepartment: {
    type: String,
    documentation: {
      description: "Département de la mission",
    },
  },
  missionRegion: {
    type: String,
    documentation: {
      description: "Région de la mission",
    },
  },
  missionDuration: {
    type: String,
    documentation: {
      description: "Durée de la mission pour cette candidature (peut-être différent de la durée initiale)",
    },
  },

  structureId: {
    type: String,
    documentation: {
      description: "Identifiant de la structure proposant la mission",
    },
  },

  tutorId: {
    type: String,
    documentation: {
      description: "Identifiant de l'utilisateur tuteur de la mission",
    },
  },

  contractId: {
    type: String,
    documentation: {
      description: "Identifiant du contract d'engagement",
    },
  },

  contractStatus: {
    type: String,
    default: "DRAFT",
    enum: ["DRAFT", "SENT", "VALIDATED"],
    documentation: {
      description: "Statut du contrat d'engagement",
    },
  },

  tutorName: {
    type: String,
    documentation: {
      description: "Prénom et nom de l'utilisateur tuteur de la mission",
    },
  },

  priority: {
    type: String,
    documentation: {
      description: "Place au sein du classement des candidatures du volontaire (ex : 1 -> premier choix)",
    },
  },

  hidden: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Indique si la candidature est cachée",
    },
  },

  status: {
    type: String,
    enum: ["WAITING_VALIDATION", "WAITING_ACCEPTATION", "VALIDATED", "REFUSED", "CANCEL", "IN_PROGRESS", "DONE", "ABANDON", "WAITING_VERIFICATION"],
    default: "WAITING_VALIDATION",
    documentation: {
      description: "Statut de la candidature du volontaire sur la mission",
    },
  },

  statusComment: {
    type: String,
    documentation: {
      description: "Commentaire lié au statut de la candidature",
    },
  },

  //files
  contractAvenantFiles: {
    type: [String],
    default: [],
  },

  justificatifsFiles: {
    type: [String],
    default: [],
  },

  feedBackExperienceFiles: {
    type: [String],
    default: [],
  },

  othersFiles: {
    type: [String],
    default: [],
  },

  filesType: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des type de fichier des candidatures",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.virtual("mission", {
  ref: "mission",
  localField: "missionId",
  foreignField: "_id",
  justOne: true,
});

Schema.methods.anonymise = function () {
  return anonymize(this);
};

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
