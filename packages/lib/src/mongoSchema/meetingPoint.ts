import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const MeetingPointSchema = {
  isValid: {
    type: String,
    enum: ["true", "false"],
    documentation: {
      description: "Le point de rassemblement est validé",
    },
  },
  cohort: {
    type: String,
    enum: ["Juillet 2022", "Juin 2022", "Février 2022", "2021"],
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
  busId: {
    type: String,
    documentation: {
      description: "Id du car qui fera le trajet",
    },
  },
  busExcelId: {
    type: String,
    documentation: {
      description: "Id du fichier import du car qui fera le trajet",
    },
  },

  // centre (destination)
  centerId: {
    type: String,
  },
  centerCode: {
    type: String,
  },

  // lieu de départ
  departureAddress: {
    type: String,
  },
  departureZip: {
    type: String,
  },
  departureCity: {
    type: String,
  },
  departureDepartment: {
    type: String,
  },
  departureRegion: {
    type: String,
  },
  hideDepartmentInConvocation: {
    type: String,
  },

  // date de départ
  departureAt: {
    type: Date,
  },
  departureAtString: {
    type: String,
  },
  realDepartureAtString: {
    type: String,
  },
  // date de retour
  returnAt: {
    type: Date,
  },
  returnAtString: {
    type: String,
  },
  realReturnAtString: {
    type: String,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date },
};

const schema = new Schema(MeetingPointSchema);
export type MeetingPointType = InterfaceExtended<InferSchemaType<typeof schema>>;
