import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const DepartmentServiceContactSchema = {
  cohort: {
    type: String,
    documentation: "cohorte concerné par le service",
  },
  cohortId: {
    type: String,
    documentation: {
      description: "Id de la cohorte",
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
};

export const DepartmentServiceSchema = {
  contacts: {
    type: [DepartmentServiceContactSchema],
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
};

const schema = new Schema({ ...DepartmentServiceSchema, contacts: [new Schema(DepartmentServiceContactSchema)] });
export type DepartmentServiceType = InterfaceExtended<InferSchemaType<typeof schema>>;
