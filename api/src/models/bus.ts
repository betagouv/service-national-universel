import mongoose, { Schema, InferSchemaType } from "mongoose";
import { DocumentExtended, InterfaceExtended } from "./types";

const MODELNAME = "bus";

const schema = new Schema({
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
});

export type BusType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type BusDocument<T = {}> = DocumentExtended<BusType & T>;

const BusModel = mongoose.model<BusDocument>(MODELNAME, schema);
export { BusModel };
