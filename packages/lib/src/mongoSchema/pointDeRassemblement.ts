import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";

export const PointDeRassemblementSchema = {
  code: {
    type: String,
    required: true,
    unique: true,
    documentation: {
      description: "Code du point de rassemblement",
    },
  },

  cohorts: {
    type: [String],
    required: true,
    documentation: {
      description: "Cohorte du point de rassemblement",
    },
  },
  cohortIds: {
    type: [String],
    documentation: {
      description: "Liste des Ids des cohortes du point de rassemblement",
    },
  },

  name: {
    type: String,
    required: true,
    documentation: {
      description: "Nom du point de rassemblement",
    },
  },

  address: {
    type: String,
    required: true,
    documentation: {
      description: "Adresse du point de rassemblement",
    },
  },

  complementAddress: {
    type: [
      {
        cohort: {
          type: String,
          documentation: {
            description: "Cohorte du complément d'adresse",
          },
        },
        cohortId: {
          type: String,
          documentation: {
            description: "Id de la cohorte",
          },
        },
        complement: {
          type: String,
          documentation: {
            description: "Complément d'adresse",
          },
        },
      },
    ],
    documentation: {
      description: "Complément d'adresse du point de rassemblement",
    },
  },

  city: {
    type: String,
    required: true,
    documentation: {
      description: "Ville du point de rassemblement",
    },
  },

  zip: {
    type: String,
    required: true,
    documentation: {
      description: "Code postal du point de rassemblement",
    },
  },

  department: {
    type: String,
    required: true,
    documentation: {
      description: "Département du point de rassemblement",
    },
  },

  region: {
    type: String,
    required: true,
    documentation: {
      description: "Région du point de rassemblement",
    },
  },

  location: {
    lat: { type: Number },
    lon: { type: Number },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
};

const schema = new Schema(PointDeRassemblementSchema);
export type PointDeRassemblementType = InterfaceExtended<InferSchemaType<typeof schema>>;
