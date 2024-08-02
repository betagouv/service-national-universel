import mongoose, { Schema, InferSchemaType } from "mongoose";
import mongooseElastic from "@selego/mongoose-elastic";
import patchHistory from "mongoose-patch-history";

import esClient from "../es";
import anonymize from "../anonymization/sessionPhase1";
import { DocumentExtended, CustomSaveParams, UserExtension, UserSaved, InterfaceExtended } from "./types";

const MODELNAME = "sessionphase1";

const File = new Schema({
  _id: String,
  name: String,
  uploadedAt: Date,
  size: Number,
  mimetype: String,
});

const schema = new Schema({
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
    type: [File],
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
    type: [File],
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
});

schema.methods.anonymise = function () {
  return anonymize(this);
};

schema.virtual("cohesionCenter", {
  ref: "cohesioncenter",
  localField: "cohesionCenterId",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("fromUser").set<SchemaExtended>(function (fromUser: UserSaved) {
  if (fromUser) {
    const { _id, role, department, region, email, firstName, lastName, model } = fromUser;
    this._user = { _id, role, department, region, email, firstName, lastName, model };
  }
});

schema.pre<SchemaExtended>("save", function (next, params: CustomSaveParams) {
  this.fromUser = params?.fromUser;
  this.updatedAt = new Date();

  next();
});

schema.plugin(patchHistory, {
  mongoose,
  name: `${MODELNAME}Patches`,
  trackOriginalValue: true,
  includes: {
    modelName: { type: String, required: true, default: MODELNAME },
    user: { type: Object, required: false, from: "_user" },
  },
  excludes: ["/updatedAt"],
});

schema.plugin(mongooseElastic(esClient, { selectiveIndexing: true, ignore: ["team"] }), MODELNAME);

schema.index({ cohesionCenterId: 1 });

export type SessionPhase1Type = InterfaceExtended<InferSchemaType<typeof schema>>;
export type SessionPhase1Document<T = {}> = DocumentExtended<SessionPhase1Type & T>;
type SchemaExtended = SessionPhase1Document & UserExtension;

export const SessionPhase1Model = mongoose.model<SessionPhase1Document>(MODELNAME, schema);
