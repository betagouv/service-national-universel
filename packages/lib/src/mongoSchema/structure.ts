import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const StructureSchema = {
  name: {
    type: String,
    required: true,
    documentation: {
      description: "Nom de la structure",
    },
  }, // OK
  siret: {
    type: String,
    documentation: {
      description: "Numéro de SIRET de la structure",
    },
  }, // OK
  description: {
    type: String,
    documentation: {
      description: "Description de la structure",
    },
  }, // OK

  website: {
    type: String,
    documentation: {
      description: "lien vers le site internet de la structure",
    },
  },
  facebook: {
    type: String,
    documentation: {
      description: "lien vers le facebook de la structure",
    },
  },
  twitter: {
    type: String,
    documentation: {
      description: "lien vers le twitter de la structure",
    },
  },
  instagram: {
    type: String,
    documentation: {
      description: "lien vers l'instagram de la structure",
    },
  },

  status: {
    type: String,
    default: "VALIDATED",
    enum: ["WAITING_VALIDATION", "WAITING_CORRECTION", "VALIDATED", "DRAFT"],
    documentation: {
      description: "Statut de la structure",
    },
  },
  isNetwork: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "La structure est une tête de réseau. Une structure qui a des antennes reparties dans toutes la France",
    },
  },
  networkId: {
    type: String,
    documentation: {
      description: "Identifiant de la structure principale (tête de réseau).",
    },
  },
  networkName: {
    type: String,
    documentation: {
      description: "Nom de la structure principale (tête de réseau).",
    },
  },

  // statut juridique
  // todo : enlever OTHER
  legalStatus: {
    type: String,
    enum: ["ASSOCIATION", "PUBLIC", "PRIVATE", "OTHER"],
    documentation: {
      description: "Statut juridique",
    },
  },

  // type de structure
  types: {
    type: [String],
    enum: [
      "Collectivité territoriale",
      "Etablissement scolaire",
      "Etablissement public de santé",
      "Corps en uniforme",
      "Service de l'Etat",
      "Autre établissement public",
      "Etablissement de santé privée d'intérêt collectif à but non lucratif",
      "Entreprise agréée ESUS",
      "Autre structure privée à but non lucratif",
      "Agrément Jeunesse et Education Populaire",
      "Agrément Service Civique",
      "Association complémentaire de l'enseignement public",
      "Associations d'usagers du système de santé",
      "Association sportive affiliée à une fédération sportive agréée par l'Etat",
      "Agrément des associations de protection de l'environnement",
      "Association agréée de sécurité civile",
      "Autre agrément",
    ],
    documentation: {
      description: "Statut juridique",
    },
  },

  // sous type de structure
  sousType: {
    type: String,
    enum: [
      // Collectivité territoriale
      "Commune",
      "EPCI",
      "Conseil départemental",
      "Conseil régional",
      "Autre",
      // Etablissement scolaire
      "Collège",
      "Lycée",
      // "Autre",
      // Etablissement public de santé
      "EHPAD",
      "Centre hospitalier",
      // "Autre",
      // Corps en uniforme
      "Pompiers",
      "Police",
      "Gendarmerie",
      "Armée",
      "Armées",
    ],
    documentation: {
      description: "Statut juridique",
    },
  },

  // todo clean a partir de cette ligne...
  associationTypes: {
    type: [String],
    documentation: {
      description: "Type d'association, si applicable",
    },
  },

  structurePubliqueType: {
    type: String,
    documentation: {
      description: "Type de structure publique, si applicable",
    },
  },
  structurePubliqueEtatType: {
    type: String,
    documentation: {
      description: "Type de service de l'état, si applicable",
    },
  },
  structurePriveeType: {
    type: String,
    documentation: {
      description: "Type de structure privée, si applicable",
    },
  },
  // todo ...jusque ici

  address: {
    type: String,
    documentation: {
      description: "Adresse de la structure",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal de la structure",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville de la structure",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département de la structure",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région de la structure",
    },
  },
  country: {
    type: String,
    documentation: {
      description: "Pays de la structure",
    },
  },
  location: {
    lon: { type: Number },
    lat: { type: Number },
  },
  addressVerified: {
    type: String,
    documentation: {
      description: "L'adresse a été vérifiée",
    },
  },

  state: {
    type: String,
    documentation: {
      description: "",
    },
  },

  isMilitaryPreparation: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "La structure est une préparation militaire",
    },
  },

  //JVA structure
  isJvaStructure: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "Structure importée de JVA",
    },
  },

  jvaStructureId: {
    type: Number,
    unique: true,
    sparse: true,
    documentation: {
      description: "JVA structure ID",
    },
  },
  jvaRawData: Schema.Types.Mixed,

  structureManager: {
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

const schema = new Schema(StructureSchema);
export type StructureType = InterfaceExtended<InferSchemaType<typeof schema>>;
