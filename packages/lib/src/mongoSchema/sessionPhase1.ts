import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "..";

export const SessionPhase1FileSchema = {
  _id: String,
  name: String,
  uploadedAt: Date,
  size: Number,
  mimetype: String,
};

export const SessionPhase1Schema = {
  cohesionCenterId: {
    type: String,
    documentation: {
      description: "Id du centre de cohésion",
    },
  },
  cohort: {
    type: String,
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
  codeCentre: {
    type: String,
    documentation: {
      description: "Code du centre",
    },
  },
  nameCentre: {
    type: String,
    documentation: {
      description: "Nom du centre",
    },
  },
  zipCentre: {
    type: String,
    documentation: {
      description: "Zip du centre",
    },
  },
  cityCentre: {
    type: String,
    documentation: {
      description: "Ville du centre",
    },
  },
  headCenterId: {
    type: String,
    documentation: {
      description: "Id de l'utilisateur responsable, le chef de centre",
    },
  },
  team: {
    type: [
      {
        firstName: {
          type: String,
          description: "prénom du membre de l'équipe",
        },
        lastName: {
          type: String,
          description: "nom du membre de l'équipe",
        },
        role: {
          type: String,
          description: "role du membre de l'équipe",
        },
        email: {
          type: String,
          description: "email du membre de l'équipe",
        },
        phone: {
          type: String,
          description: "téléphone du membre de l'équipe",
        },
      },
    ],
    documentation: {
      description: "equipe d'encadrement pour le séjour",
    },
  },
  waitingList: {
    type: [String],
    documentation: {
      description: "Liste  des jeunes en liste d'attente sur ce séjour de cohésion",
    },
  },

  placesTotal: {
    type: Number,
    documentation: {
      description: "Nombre de places au total",
    },
  },
  placesLeft: {
    type: Number,
    documentation: {
      description: "Nombre de places disponibles",
    },
  },

  timeScheduleFiles: {
    type: [SessionPhase1FileSchema],
    documentation: {
      description: "Fichiers d'emploi du temps",
    },
  },
  hasTimeSchedule: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La session possède au moins 1 fichier d'emploi du temps.",
    },
  },
  pedagoProjectFiles: {
    type: [SessionPhase1FileSchema],
    documentation: {
      description: "Fichiers du projet pédagogique",
    },
  },
  hasPedagoProject: {
    type: String,
    enum: ["true", "false"],
    default: "false",
    documentation: {
      description: "La session possède au moins 1 fichier de projet pédagogique.",
    },
  },

  dateStart: {
    type: Date,
    documentation: {
      description: "Date spécifique de début du séjour",
    },
  },
  dateEnd: {
    type: Date,
    documentation: {
      description: "Date spécifique de fin du séjour",
    },
  },

  // TODO: remove this field
  status: {
    type: String,
    default: "WAITING_VALIDATION",
    enum: ["VALIDATED", "WAITING_VALIDATION"],
    documentation: {
      description: "Statut",
    },
  },

  sanitaryContactEmail: {
    type: String,
    documentation: {
      description: "email nécessaire pour envoyer la fiche sanitaire au centre de la sessions",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

// le schéma doit être défini ici pour l'inferage, mais dupliqué dans l'api pour une bonne interpretation du model
const schema = new Schema({
  ...SessionPhase1Schema,
  timeScheduleFiles: {
    ...SessionPhase1Schema.timeScheduleFiles,
    type: [new Schema(SessionPhase1FileSchema)],
  },
  pedagoProjectFiles: {
    ...SessionPhase1Schema.pedagoProjectFiles,
    type: [new Schema(SessionPhase1FileSchema)],
  },
});

export type SessionPhase1Type = InterfaceExtended<InferSchemaType<typeof schema>>;
