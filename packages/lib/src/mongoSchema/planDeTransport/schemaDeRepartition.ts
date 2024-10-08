import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";
import { CohesionCenterType } from "../cohesionCenter";

export const SchemaDeRepartitionSchema = {
  cohort: {
    type: String,
    required: true,
    documentation: {
      description: "Cohorte",
    },
  },
  cohortId: {
    type: String,
    documentation: {
      description: "Id de la cohorte",
    },
  },
  intradepartmental: {
    type: String,
    enum: ["true", "false"],
    required: true,
    documentation: {
      description: "Groupe pour les volontaires intradéparementaux",
    },
  },
  fromDepartment: {
    type: String,
    documentation: {
      description: "Département d'origine",
    },
  },
  fromRegion: {
    type: String,
    required: true,
    documentation: {
      description: "Région d'origine",
    },
  },
  toDepartment: {
    type: String,
    documentation: {
      description: "Département de destination",
    },
  },
  toRegion: {
    type: String,
    documentation: {
      description: "Région de destination",
    },
  },
  centerId: {
    type: String,
    documentation: {
      description: "Identifiant du centre",
    },
  },
  centerName: {
    type: String,
    documentation: {
      description: "Nom du centre",
    },
  },
  centerCity: {
    type: String,
    documentation: {
      description: "Ville du centre",
    },
  },
  sessionId: {
    type: String,
    documentation: {
      description: "Identifiant de la session du centre correspondant à la cohorte",
    },
  },
  youngsVolume: {
    type: Number,
    default: 0,
    documentation: {
      description: "Nombre de jeune pour ce groupe",
    },
  },
  gatheringPlaces: {
    type: [String],
    default: [],
    documentation: {
      description: "Liste des points de rassemblements permettant d'accéder au centre pour ce groupe.",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(SchemaDeRepartitionSchema);
export type SchemaDeRepartitionType = InterfaceExtended<InferSchemaType<typeof schema>> & {
  cohesionCenter?: CohesionCenterType;
};
