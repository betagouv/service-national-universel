const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const patchHistory = require("mongoose-patch-history").default;

const MODELNAME = "cohort";

const DSNJExportDates = new mongoose.Schema({
  cohesionCenters: Date,
  youngsBeforeSession: Date,
  youngsAfterSession: Date,
});

const Schema = new mongoose.Schema({
  snuId: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte id (defined in snu lib)",
    },
  },
  name: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte name (defined in snu lib)",
    },
  },
  dsnjExportDates: {
    type: DSNJExportDates,
    documentation: {
      description: "Dates when DSNJ export are generated",
    },
  },

  isAssignmentAnnouncementsOpenForYoung: {
    type: Boolean,
    documentation: {
      description:
        "Si true, les affectations sont 'révélées' au jeune. Sinon, le jeune doit avoir l'impression qu'il est toujours dans un état d'attente d'affectation même si il a été affecté.",
    },
  },
  manualAffectionOpenForAdmin: {
    type: Boolean,
    documentation: {
      description: "Si true, les admins peuvent manuellement affecter un jeune à un centre",
    },
  },
  manualAffectionOpenForReferentRegion: {
    type: Boolean,
    documentation: {
      description: "Si true, les referents régionaux peuvent manuellement affecter un jeune à un centre",
    },
  },
  manualAffectionOpenForReferentDepartment: {
    type: Boolean,
    documentation: {
      description: "Si true, les referents départementaux peuvent manuellement affecter un jeune à un centre",
    },
  },

  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },

  pdrChoiceLimitDate: {
    type: Date,
    documentation: {
      description: "Date limite de choix du PDR par le jeune, par defaut 23h59",
    },
  },

  validationDate: {
    type: Date,
    documentation: {
      description: "Date d'autoValidation du jeune (apèrs cette date, sa phase 1 est validée), par defaut 23h59",
    },
  },
  validationDateForTerminaleGrade: {
    type: Date,
    documentation: {
      description: "Date d'autoValidation d'un jeune en terminale (apèrs cette date, sa phase 1 est validée), par defaut 23h59",
    },
  },

  youngCheckinForAdmin: {
    type: Boolean,
    documentation: {
      description: "Ouverture du pointage des volontaires pour les modérateurs",
    },
  },
  youngCheckinForHeadOfCenter: {
    type: Boolean,
    documentation: {
      description: "Ouverture du pointage des volontaires pour les chefs de centre",
    },
  },
  youngCheckinForRegionReferent: {
    type: Boolean,
    documentation: {
      description: "Ouverture du pointage des volontaires pour les référents régionaux",
    },
  },
  youngCheckinForDepartmentReferent: {
    type: Boolean,
    documentation: {
      description: "Ouverture du pointage des volontaires pour les référents départementaux",
    },
  },

  busListAvailability: {
    type: Boolean,
    documentation: {
      description:
        " Ouverture ou fermeture de l’accès à la liste des volontaires d’un même centre par ligne de transport et par point de rassemblement envoyé par email (activation/désactivation du token)",
    },
  },

  sessionEditionOpenForReferentRegion: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des sessions pour les référents régionaux",
    },
  },

  sessionEditionOpenForReferentDepartment: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des sessions pour les référents départementaux",
    },
  },

  sessionEditionOpenForTransporter: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des sessions pour les transporteurs",
    },
  },

  pdrEditionOpenForReferentRegion: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des PDR pour les référents régionaux",
    },
  },

  pdrEditionOpenForReferentDepartment: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des PDR pour les référents départementaux",
    },
  },

  pdrEditionOpenForTransporter: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Ouverture ou fermeture de l'édition des PDR pour les transporteurs",
    },
  },

  repartitionSchemaCreateAndEditGroupAvailability: {
    type: Boolean,
    documentation: {
      description: "Ouverture ou fermeture pour les utilisateurs de la possibilité de créer et modifier des groupes sur le schéma de répartition.",
    },
  },
  repartitionSchemaDownloadAvailability: {
    type: Boolean,
    documentation: {
      description: "Ouverture ou fermeture pour les utilisateurs de la possibilité de télécharger le schéma de répartition.",
    },
  },

  isTransportPlanCorrectionRequestOpen: {
    type: Boolean,
    documentation: {
      description: "Ouverture ou fermeture pour les référents régionaux de la possibilité de demander une correction du plan de transport.",
    },
  },

  //information n'impactant le fonctionnement de l'application
  uselessInformation: {
    type: mongoose.Schema.Types.Mixed,
    documentation: {
      description: "Information complémentaire non utilisée par l'application",
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

Schema.pre("save", function (next) {
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
