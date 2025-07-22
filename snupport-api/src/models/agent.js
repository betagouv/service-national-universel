const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MODELNAME = "agent";

const Schema = new mongoose.Schema({
  organisationId: { type: String, required: true },
  firstName: { type: String, documentation: { description: "Prénom de l'agent" } },
  lastName: { type: String, documentation: { description: "Nom de l'agent" } },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    documentation: {
      description: "Email de l'agent",
    },
  },
  password: {
    type: String,
    select: false,
    documentation: {
      description: "Mot de passe de l'utilisateur",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département de l'utilisateur",
    },
  },
  departments: {
    type: [String],
    documentation: {
      description: "Départements de l'utilisateur",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région de l'utilisateur",
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
  role: {
    type: String,
    required: true,
    enum: ["AGENT", "ADMIN", "REFERENT_DEPARTMENT", "REFERENT_REGION", "DG"],
    documentation: {
      description: "Rôle de l'agent",
    },
  },

  lastLoginAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  // an agent is used to regroup all referents (department + region)
  isReferent: {
    type: Boolean,
    default: false,
  },
  snuReferentId: {
    type: String,
    unique: true,
    index: true,
    documentation: {
      description: "Id du référent sur la plateforme SNU",
    },
  },
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

Schema.methods.comparePassword = async function (password) {
  const user = await AgentModel.findById(this._id).select("password");
  return bcrypt.compare(password, user.password || "");
};

const AgentModel = mongoose.model(MODELNAME, Schema);

module.exports = AgentModel;
