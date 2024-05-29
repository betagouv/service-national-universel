const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const { esClient } = require("../es");
const MODELNAME = "mission";
const { generateAddress, generateRandomName, starify } = require("../utils/anonymise");

const Schema = new mongoose.Schema({
  sqlId: {
    type: String,
    index: true,
    documentation: {
      description: "(migration) Identifiant dans l'ancienne base de données",
    },
  }, // ID of the previous database
  sqlStructureId: {
    type: String,
    index: true,
    documentation: {
      description: "(migration) Identifiant de la structure dans l'ancienne base de données",
    },
  }, // ID of the previous database
  sqlTutorId: {
    type: String,
    index: true,
    documentation: {
      description: "(migration) Identifiant de l'utilisateur tuteur de mission dans l'ancienne base de données",
    },
  }, // ID of the previous database

  name: {
    type: String,
    required: true,
    documentation: {
      description: "Titre de la mission",
    },
  }, // OK
  domains: {
    type: [String],
    documentation: {
      description: "Domaine principal et domaine(s) secondaire(s) de la mission (citoyenneté, sport, culture, ...)",
    },
  }, // OK
  mainDomain: {
    type: String,
    documentation: {
      description: "Domaine principal de la mission (citoyenneté, sport, culture, ...)",
    },
  }, // OK

  startAt: {
    type: Date,
    documentation: {
      description: "Date du début de la mission",
    },
  }, // OK
  endAt: {
    type: Date,
    documentation: {
      description: "Date de fin de la mission",
    },
  }, // OK
  duration: {
    type: String,
    documentation: {
      description: "Durée prévisionnelle de la mission",
    },
  },
  format: {
    type: String,
    default: "CONTINUOUS",
    enum: ["CONTINUOUS", "DISCONTINUOUS", "AUTONOMOUS"],
    documentation: {
      description: "Format de la mission",
    },
  },

  frequence: {
    type: String,
    documentation: {
      description: "Fréquence de la mission",
    },
  },
  period: {
    type: [String],
    enum: ["WHENEVER", "DURING_HOLIDAYS", "DURING_SCHOOL"],
    documentation: {
      description: "Période de la mission (pendant les vacances scolaires, pendant l'année scolaire)",
    },
  },
  subPeriod: {
    type: [String],
    documentation: {
      description: "Période de la mission, détails",
    },
  },

  placesTotal: {
    type: Number,
    default: 1,
    documentation: {
      description: "Nombre de places total pour cette mission",
    },
  }, // OK
  placesLeft: {
    type: Number,
    default: 1,
    documentation: {
      description: "Nombre de places encore disponibles pour cette mission",
    },
  }, // OK
  pendingApplications: {
    type: Number,
    default: 0,
    documentation: {
      description: "Le nombre de candidatures en attente.",
    },
  },

  actions: {
    type: String,
    documentation: {
      description: "Actions concrètes confiées au(x) volontaire(s)",
    },
  }, // OK
  description: {
    type: String,
    documentation: {
      description: "Description de la mission",
    },
  }, // OK
  justifications: {
    type: String,
    documentation: {
      description: "",
    },
  }, // OK
  contraintes: {
    type: String,
    documentation: {
      description: "Contraintes spécifiques pour la mission",
    },
  }, // OK

  structureId: {
    type: String,
    documentation: {
      description: "Identifiant de la structure proposant la mission",
    },
  }, // OK
  structureName: {
    type: String,
    documentation: {
      description: "Nom de la structure proposant la mission",
    },
  }, // OK ( slave data from structure)

  status: {
    type: String,
    default: "DRAFT",
    enum: ["DRAFT", "WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED", "CANCEL", "ARCHIVED"],
    documentation: {
      description: "Statut de la mission",
    },
  },

  visibility: {
    type: String,
    default: "VISIBLE",
    enum: ["VISIBLE", "HIDDEN"],
    documentation: {
      description: "Statut de la mission",
    },
  },

  statusComment: {
    type: String,
    default: "",
    documentation: {
      description: "Commentaire sur le statut de la mission",
    },
  },
  hebergement: {
    type: String,
    enum: ["", "false", "true"],
    documentation: {
      description: "La mission propose un hébergement",
    },
  },
  hebergementPayant: {
    type: String,
    default: "",
    enum: ["", "false", "true"],
    documentation: {
      description: "L'hébergement est-il payant ?",
    },
  },

  // structure_id: { type: String, required: true },
  // referent_id: { type: String, required: true },
  tutorId: {
    type: String,
    documentation: {
      description: "Identifiant de l'utilisateur tuteur de la mission",
    },
  },

  tutorName: {
    type: String,
    documentation: {
      description: "Prénom et nom de l'utilisateur tuteur de la mission",
    },
  },

  //

  // dates_infos: { type: String },
  // periodes: { type: String },
  // frequence: { type: String },
  // planning: { type: String },

  address: {
    type: String,
    documentation: {
      description: "Adresse du lieu où se déroule la mission",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal du lieu où se déroule la mission",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville où se déroule la mission",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département où se déroule la mission",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région où se déroule la mission",
    },
  },
  country: {
    type: String,
    documentation: {
      description: "",
    },
  },
  location: {
    lat: {
      type: Number,
    },
    lon: {
      type: Number,
    },
  },
  addressVerified: {
    type: String,
    documentation: {
      description: "L'adresse a été vérifiée",
    },
  },
  remote: {
    type: String,
    documentation: {
      description: "La mission peut se réaliser à distance",
    },
  },

  isMilitaryPreparation: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La mission est une préparation militaire",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  //JVA mission
  lastSyncAt: { type: Date },
  isJvaMission: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "Mission proposée par JVA",
    },
  },

  jvaMissionId: {
    type: Number,
    documentation: {
      description: "JVA mission ID",
    },
  },
  apiEngagementId: {
    type: String,
    documentation: {
      description: "Api Engagement mission ID",
    },
  },
  jvaRawData: mongoose.Schema.Types.Mixed,

  applicationStatus: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des statuts des candidatures de phase 2 pour la mission",
    },
  },

  placesStatus: {
    type: String,
    enum: ["FULL", "EMPTY", "ONE_OR_MORE"],
    default: "EMPTY",
    documentation: {
      description: "Champs pour filtrer sur une mission pleine, vide, ayant au moin une places de prise ",
    },
  },
});

Schema.methods.anonymise = function () {
  this.name && (this.name = `Mission ${generateRandomName()}`);
  this.description && (this.description = starify(this.description));
  this.address && (this.address = generateAddress());
  this.actions && (this.actions = "action Test");
  this.structureName && (this.structureName = starify(this.structureName));
  this.tutorName && (this.tutorName = starify(this.tutorName));
  this.actions && (this.actions = starify(this.actions));
  this.justifications && (this.justifications = starify(this.justifications));
  this.contraintes && (this.contraintes = starify(this.contraintes));
  this.frequence && (this.frequence = starify(this.frequence));
  this.jvaRawData && (this.jvaRawData = undefined);
  return this;
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
Schema.plugin(mongooseElastic(esClient(), { selectiveIndexing: true, ignore: ["jvaRawData"] }), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
