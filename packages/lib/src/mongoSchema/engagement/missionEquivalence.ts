import { Schema, InferSchemaType } from "mongoose";
import { ENGAGEMENT_LYCEEN_TYPES, ENGAGEMENT_TYPES, UNSS_TYPE } from "../../constants/constants";
import { InterfaceExtended } from "..";

export const MissionEquivalenceSchema = {
  youngId: {
    type: String,
    documentation: {
      description: "Identifiant du jeune",
    },
  },
  status: {
    type: String,
    enum: ["WAITING_VERIFICATION", "WAITING_CORRECTION", "VALIDATED", "REFUSED"],
    documentation: {
      description: "Statut de l'équivalence",
    },
  },
  type: {
    type: String,
    enum: [...ENGAGEMENT_TYPES],
    documentation: {
      description: "Type de mission",
    },
  },
  desc: {
    type: String,
    documentation: {
      description: "Description du type de mission si le type sélectionné est 'Autre'",
    },
  },
  sousType: {
    type: String,
    enum: [...UNSS_TYPE, ...ENGAGEMENT_LYCEEN_TYPES],
    documentation: {
      description: "Sous-type de mission",
    },
  },
  structureName: {
    type: String,
    documentation: {
      description: "Nom de la structure d'accueil",
    },
  },
  address: {
    type: String,
    documentation: {
      description: "Adresse de la structure d'accueil",
    },
  },
  zip: {
    type: String,
    documentation: {
      description: "Code postal de la structure d'accueil",
    },
  },
  city: {
    type: String,
    documentation: {
      description: "Ville de la structure d'accueil",
    },
  },
  startDate: {
    type: Date,
    documentation: {
      description: "Date de début de la mission",
    },
  },
  endDate: {
    type: Date,
    documentation: {
      description: "Date de fin de la mission",
    },
  },

  // legacy
  frequency: {
    type: {
      nombre: String,
      duree: String,
      frequence: String,
    },
    documentation: {
      description: "Fréquence de la mission",
    },
  },

  missionDuration: {
    type: Number,
    documentation: {
      description: "Durée de la mission pour cette candidature (peut-être différent de la durée initiale)",
    },
  },

  contactFullName: {
    type: String,
    documentation: {
      description: "Nom et prénom du contact au sein de la structure",
    },
  },
  contactEmail: {
    type: String,
    documentation: {
      description: "Email du contact au sein de la structure",
    },
  },

  files: {
    type: [String],
    documentation: {
      description: "Liste des fichiers joints",
    },
  },

  message: {
    type: String,
    documentation: {
      description: "Message de correction ou de refus",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(MissionEquivalenceSchema);
export type MissionEquivalenceType = InterfaceExtended<InferSchemaType<typeof schema>>;
