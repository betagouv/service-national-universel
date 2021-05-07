const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const sendinblue = require("../sendinblue");

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
  lastLoginAt: {
    type: Date,
    documentation: {
      description: "Date de dernière connexion",
    },
  },
  registredAt: {
    type: Date,
    documentation: {
      description: "Date de création",
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
    enum: [
      "admin",
      "referent_region",
      "referent_department",
      "structure_responsible",
      "structure_member",
      "responsible",
      "supervisor",
      "head_center",
    ],
    documentation: {
      description: "Rôle de l'utilisateur sur l'app",
    },
  },
  region: {
    type: String,
    default: "",
    documentation: {
      description: "Région de l'utilisateur, si applicable",
    },
  },
  department: {
    type: String,
    default: "",
    documentation: {
      description: "Département de l'utilisateur, si applicable",
    },
  },
  subRole: {
    type: String,
    enum: [
      "manager_department",
      "assistant_manager_department",
      "manager_department_phase2",
      "secretariat",
      "coordinator",
      "assistant_coordinator",
      "",
    ],
  },
  cohesionCenterId: {
    type: String,
    documentation: {
      description: "Id du centre de cohésion d'accueil pour la phase 1",
    },
  },
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

  structureId: {
    type: String,
    documentation: {
      description: "Identifiant de la structrue de l'utilisateur, si applicable",
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

//Sync with sendinblue
Schema.post("save", function (doc) {
  sendinblue.sync(doc, MODELNAME);
});
Schema.post("findOneAndUpdate", function (doc) {
  sendinblue.sync(doc, MODELNAME);
});
Schema.post("remove", function (doc) {
  sendinblue.unsync(doc);
});
Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

/*

{
   "id":10090,
   "name":"se.legoff@gmail.com",
   "email":"se.legoff@gmail.com",
   "context_role":"responsable",
   "created_at":"2020-12-02 14:37:10",
   "updated_at":"2020-12-02 14:37:10",
   "profile":{
      "id":10080,
      "user_id":10090,
      "first_name":"Sebastien",
      "last_name":"Le Goff",
      "email":"se.legoff@gmail.com",
      "phone":null,
      "mobile":"+33658469890",
      "reseau_id":null,
      "referent_department":null,
      "referent_region":null,
      "created_at":"2020-12-02 14:37:10",
      "updated_at":"2020-12-02 14:37:29",
      "full_name":"Sebastien Le Goff",
      "avatar":null,
      "roles":{
         "admin":false,
         "referent":false,
         "referentRegion":false,
         "superviseur":false,
         "responsable":true,
         "tuteur":false
      },
      "has_user":true,
      "structures":[
         {
            "id":2166,
            "name":"TEST SEB",
            "logo":null,
            "full_address":",  ",
            "ceu":false,
            "pivot":{
               "profile_id":10080,
               "structure_id":2166,
               "role":"responsable"
            }
         }
      ],
      "reseau":null
   }
}

*/
