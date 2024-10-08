import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const ProgramSchema = {
  name: {
    type: String,
    required: true,
    documentation: {
      description: "nom du programmes",
    },
  },
  description: {
    type: String,
    documentation: {
      description: "description du programme",
    },
  },
  descriptionFor: {
    type: String,
    documentation: {
      description: "desc du programme : C'est pour ?",
    },
  },
  descriptionMoney: {
    type: String,
    documentation: {
      description: "desc du programme : Est-ce indemnisé",
    },
  },
  descriptionDuration: {
    type: String,
    documentation: {
      description: "desc du programme : Quelle durée d'engagement ?",
    },
  },
  url: {
    type: String,
    documentation: {
      description: "lien vers son site web",
    },
  },
  urlPhaseEngagement: {
    type: String,
    documentation: {
      description: "lien vers le site web avec un tracking spécifique pour JVA dans le cadre de la phase 2",
    },
  },
  imageFile: {
    type: String,
    documentation: {
      description: "image (fichier)",
    },
  },
  imageString: {
    type: String,
    default: "default.png",
    documentation: {
      description: "nom fichier image",
    },
  },
  type: {
    type: String,
    documentation: {
      description: "Type de l'engagement (formation, engagement, ...)",
    },
  },
  department: {
    type: String,
    documentation: {
      description: "Département concerné, si applicable",
    },
  },
  region: {
    type: String,
    documentation: {
      description: "Région concernée, si applicable",
    },
  },
  visibility: {
    type: String,
    documentation: {
      description: "",
    },
  },

  publisherName: {
    type: String,
    documentation: "Ce champ nous sert à filtrer les mission JVA et serviceCivique sur la phase 2 engagement, à ne pas modifier",
  },

  order: {
    type: Number,
    documentation: "champ utilisé pour ordonner l'affichage des programmes",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(ProgramSchema);
export type ProgramType = InterfaceExtended<InferSchemaType<typeof schema>>;
