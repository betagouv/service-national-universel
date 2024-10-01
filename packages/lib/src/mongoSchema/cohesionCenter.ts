import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";
import { CohesionCenterDomainEnum, CohesionCenterTypologyEnum } from "../constants/cohesionCenter";

export const CohesionCenterSchema = {
  name: {
    type: String,
    documentation: {
      description: "Nom du centre",
    },
  },
  code2022: {
    type: String,
    documentation: {
      description: "Code du centre utilisé en 2022",
    },
  },
  address: {
    type: String,
    documentation: {
      description: "Adresse du centre",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville du centre",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal du centre",
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
  addressVerified: {
    type: String,
    documentation: {
      description: "Adresse validée",
    },
  },
  placesTotal: {
    type: Number,
    documentation: {
      description: "Nombre de places au total",
    },
  },
  pmr: {
    type: String,
    enum: ["true", "false", ""],
    documentation: {
      description: "Accessibilité aux personnes à mobilité réduite",
    },
  },

  cohorts: {
    type: [String],
    documentation: {
      description: "Liste des cohortes concernées par ce centre de cohésion",
    },
  },
  cohortIds: {
    type: [String],
    documentation: {
      description: "Liste des Ids des cohortes concernées par ce centre de cohésion",
    },
  },
  academy: {
    type: String,
    documentation: {
      description: "Académie du centre",
    },
  },

  typology: {
    type: String,
    enum: Object.values(CohesionCenterTypologyEnum),
    documentation: {
      description: "Typologie du centre",
    },
  },

  domain: {
    type: String,
    enum: Object.values(CohesionCenterDomainEnum),
    documentation: {
      description: "Domaine du centre",
    },
  },

  complement: {
    type: String,
    documentation: {
      description: "Complément",
    },
  },

  centerDesignation: {
    type: String,
    documentation: {
      description: "Désignation du centre",
    },
  },

  //TODO : CLEAN AFTER MERGE NEW CENTER

  placesLeft: {
    type: Number,
    documentation: {
      description: "Nombre de places disponibles",
    },
  },
  outfitDelivered: {
    type: String,
    documentation: {
      description: "Livraison de tenue",
    },
  },
  observations: {
    type: String,
    documentation: {
      description: "Livraison de tenue",
    },
  },
  waitingList: {
    type: [String],
    documentation: {
      description: "Liste ordonnée des jeunes en liste d'attente sur ce cente de cohésion",
    },
  },

  COR: {
    type: String,
    documentation: {
      description: "",
    },
  },
  code: {
    type: String,
    documentation: {
      description: "Code du centre",
    },
  },
  country: {
    type: String,
    documentation: {
      description: "Pays du centre",
    },
  },
  departmentCode: {
    type: String,
    documentation: {
      description: "Numéro du département du centre",
    },
  },

  sessionStatus: {
    type: [String],
    enum: ["VALIDATED", "DRAFT", "WAITING_VALIDATION"],
    documentation: {
      description: "Status de la globalité des cohortes d'un centre",
    },
  },

  matricule: {
    type: String,
    documentation: {
      description: "Matricule du centre sur le SI-SNU",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(CohesionCenterSchema);
export type CohesionCenterType = InterfaceExtended<InferSchemaType<typeof schema>>;
