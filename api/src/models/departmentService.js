const mongoose = require("mongoose");
const mongooseElastic = require("@selego/mongoose-elastic");
const esClient = require("../es");
const { generateAddress, generateRandomName, generateRandomEmail, generateNewPhoneNumber } = require("../utils/anonymise");

const MODELNAME = "departmentservice";

const Schema = new mongoose.Schema({
  contacts: {
    type: [
      {
        cohort: {
          type: String,
          documentation: "cohorte concerné par le service",
        },
        contactName: {
          type: String,
          documentation: {
            description: "Nom du contact au sein du service",
          },
        },
        contactPhone: {
          type: String,
          documentation: {
            description: "Téléphone du contact au sein du service",
          },
        },
        contactMail: {
          type: String,
          documentation: {
            description: "Mail du contact au sein du service",
          },
        },
      },
    ],
  },
  department: {
    type: String,
    documentation: {
      description: "Nom du département",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Nom de la région (peut être déduit du département)",
    },
  },
  directionName: {
    type: String,
    documentation: {
      description: "Nom de la direction",
    },
  },
  serviceName: {
    type: String,
    documentation: {
      description: "Nom du service",
    },
  },
  serviceNumber: {
    type: String,
    documentation: {
      description: "Numero du bureau",
    },
  },
  address: {
    type: String,
    documentation: {
      description: "Adresse",
    },
  },
  complementAddress: {
    type: String,
    documentation: {
      description: "Adresse",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville",
    },
  },
  description: {
    type: String,
    documentation: {
      description: "Information comlpémentaire",
    },
  },
  contactName: {
    type: String,
    documentation: {
      description: "Nom du contact au sein du service",
    },
  },
  contactPhone: {
    type: String,
    documentation: {
      description: "Téléphone du contact au sein du service",
    },
  },
  contactMail: {
    type: String,
    documentation: {
      description: "Mail du contact au sein du service",
    },
  },

  representantEtat: {
    type: {
      firstName: {
        type: String,
        documentation: {
          description: "Prénom du représentant de l'état",
        },
      },
      lastName: {
        type: String,
        documentation: {
          description: "Nom du représentant de l'état",
        },
      },
      mobile: {
        type: String,
        documentation: {
          description: "Téléphone du représentant de l'état",
        },
      },
      email: {
        type: String,
        documentation: {
          description: "Mail du représentant de l'état",
        },
      },
      role: {
        type: String,
        documentation: {
          description: "Rôle du représentant de l'état",
        },
      },
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

Schema.methods.anonymise = function () {
  this.email && (this.email = generateRandomEmail());
  this.contactPhone && (this.contactPhone = generateNewPhoneNumber());
  this.address && (this.address = generateAddress());
  this.directionName && (this.directionName = generateRandomName());
  this.contactName && (this.contactName = generateRandomName());
  this.contactMail && (this.contactMail = generateRandomEmail());
  this.contacts &&
    (this.contacts = [
      {
        cohort: "New Cohort",
        contactName: "New Contact",
        contactPhone: generateNewPhoneNumber(),
        contactMail: generateRandomEmail(),
      },
    ]);
  this.representantEtat &&
    (this.representantEtat = {
      firstName: generateRandomName(),
      lastName: generateRandomName(),
      mobile: generateNewPhoneNumber(),
      email: generateRandomEmail(),
    });

  return this;
};

Schema.plugin(mongooseElastic(esClient), MODELNAME);

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
