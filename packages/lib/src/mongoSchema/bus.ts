import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from ".";

export const BusSchema = {
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
  idExcel: {
    type: String,
  },
  capacity: {
    type: Number,
    documentation: {
      description: "Nombre de passager (volontaire) possible",
    },
  },
  placesLeft: {
    type: Number,
    documentation: {
      description: "Nombre de places disponibles",
    },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(BusSchema);
export type BusType = InterfaceExtended<InferSchemaType<typeof schema>>;
