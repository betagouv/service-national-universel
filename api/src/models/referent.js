const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseElastic = require("@selego/mongoose-elastic");
const patchHistory = require("mongoose-patch-history").default;
const esClient = require("../es");
const sendinblue = require("../sendinblue");
const { SUB_ROLES_LIST, ROLES_LIST, VISITOR_SUB_ROLES_LIST } = require("snu-lib");

const MODELNAME = "referent";

const Schema = new mongoose.Schema({
  sqlId: {
    type: String,
    index: true,
    documentation: {
      description: "Identifiant dans l'ancienne base de données",
    },
  },
  firstName: {
    type: String,
    documentation: {
      description: "Prénom de l'utilisateur",
    },
  },
  lastName: {
    type: String,
    documentation: {
      description: "Nom de l'utilisateur",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    documentation: {
      description: "Email de l'utilisateur",
    },
  },

  password: {
    type: String,
    select: false,
    documentation: {
      description: "Mot de passe de l'utilisateur",
    },
  },
  loginAttempts: {
    type: Number,
    default: 0,
    documentation: {
      description: "tentative de connexion. Max 15",
    },
  },
  acceptCGU: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "l'utilisateur a accepté les CGU",
    },
  },
  lastLoginAt: {
    type: Date,
    documentation: {
      description: "Date de dernière connexion",
    },
  },
  lastActivityAt: {
    type: Date,
    documentation: {
      description: "Date de dernière activité",
    },
  },
  lastLogoutAt: {
    type: Date,
    select: true,
    documentation: {
      description: "Date de dernière déconnexion",
    },
  },
  passwordChangedAt: {
    type: Date,
    select: true,
    documentation: {
      description: "Date de dernier changement de password",
    },
  },
  registredAt: {
    type: Date,
    documentation: {
      description: "Date de création",
    },
  },

  nextLoginAttemptIn: {
    type: Date,
    documentation: {
      description: "Date pour autoriser la prochaine tentative de connexion",
    },
  },

  forgotPasswordResetToken: {
    type: String,
    default: "",
    documentation: {
      description: "Token servant à la réinitialisation du mot de passe",
    },
  },
  forgotPasswordResetExpires: {
    type: Date,
    documentation: {
      description: "Date limite de validité du token pour réinitialiser le mot de passe",
    },
  },

  invitationToken: {
    type: String,
    default: "",
    documentation: {
      description: "Token d'invitation",
    },
  },
  invitationExpires: {
    type: Date,
    documentation: {
      description: "Date limite de validité du token d'invitation",
    },
  },

  role: {
    type: String,
    enum: ROLES_LIST,
    documentation: {
      description: "Rôle de l'utilisateur sur l'app",
    },
  },

  subRole: {
    type: String,
    enum: [...SUB_ROLES_LIST, ...VISITOR_SUB_ROLES_LIST, "god"],
  },

  // Specific fields

  // Regional and departmental referent
  region: {
    type: String,
    default: "",
    documentation: {
      description: "Région de l'utilisateur, si applicable",
    },
  },
  department: {
    type: [String],
    documentation: {
      description: "Département de l'utilisateur, si applicable",
    },
  },

  // Responsible and Supervisor
  structureId: {
    type: String,
    documentation: {
      description: "Identifiant de la structure de l'utilisateur, si applicable",
    },
  },

  // Head center
  sessionPhase1Id: {
    type: String,
    documentation: {
      description: "Id de la session de cohésion d'accueil pour la phase 1",
    },
  },
  cohorts: {
    type: [String],
    documentation: {
      description: "Identifiant des cohortes du chef de centre",
    },
  },

  // End specific fields

  // *** START LEGACY COHESION CENTER ***
  cohesionCenterId: {
    type: String,
    documentation: {
      description: "Id du centre de cohésion d'accueil pour la phase 1",
    },
  },
  cohesionCenterName: {
    type: String,
    documentation: {
      description: "Nom du centre de cohésion d'accueil pour la phase 1",
    },
  },
  // *** END LEGACY COHESION CENTER ***
  phone: {
    type: String,
    documentation: {
      description: "Numéro de téléphone fix",
    },
  },
  mobile: {
    type: String,
    documentation: {
      description: "Numéro de portable",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
    bcrypt.hash(this.password, 10, (e, hash) => {
      this.password = hash;
      return next();
    });
  } else {
    return next();
  }
});

Schema.methods.comparePassword = async function (p) {
  const user = await OBJ.findById(this._id).select("password");
  return bcrypt.compare(p, user.password || "");
};

//Sync with Sendinblue
Schema.post("save", function (doc) {
  sendinblue.sync(doc, MODELNAME);
});
Schema.post("findOneAndUpdate", function (doc) {
  sendinblue.sync(doc, MODELNAME);
});
Schema.post("remove", function (doc) {
  sendinblue.unsync(doc);
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
  excludes: [
    "/password",
    "/lastLoginAt",
    "/lastActivityAt",
    "/lastLogoutAt",
    "/passwordChangedAt",
    "/nextLoginAttemptIn",
    "/forgotPasswordResetToken",
    "/forgotPasswordResetExpires",
    "/invitationToken",
    "/invitationExpires",
    "/loginAttempts",
    "/updatedAt",
  ],
});

Schema.plugin(
  mongooseElastic(esClient, {
    selectiveIndexing: true,
    ignore: [
      "password",
      "lastLogoutAt",
      "passwordChangedAt",
      "nextLoginAttemptIn",
      "forgotPasswordResetToken",
      "forgotPasswordResetExpires",
      "invitationToken",
      "invitationExpires",
      "loginAttempts",
      "updatedAt",
      "lastActivityAt",
    ],
  }),
  MODELNAME,
);

const OBJ = mongoose.model(MODELNAME, Schema);

module.exports = OBJ;
