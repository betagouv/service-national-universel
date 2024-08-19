import mongoose, { Schema, InferSchemaType } from "mongoose";
import { DocumentExtended, InterfaceExtended } from "./types";

const MODELNAME = "area";

// This object is used to get the density of a city and assign it to a young

const schema = new Schema({
  cityCode: {
    type: String,
    documentation: {
      description: "Code commune. C'est pas le code postal ni le code INSE",
    },
  },

  density: {
    type: String,
    enum: ["TRES PEU DENSE", "PEU DENSE", "INTERMEDIAIRE", "DENSE"],
    documentation: {
      description: "",
    },
  },

  region: {
    type: String,
    documentation: {
      description: "",
    },
  },

  population: {
    type: Number,
    documentation: {
      description: "",
    },
  },

  name: {
    type: String,
    documentation: {
      description: "",
    },
  },
});

export type AreasType = InterfaceExtended<InferSchemaType<typeof schema>>;
export type AreasDocument<T = {}> = DocumentExtended<AreasType & T>;

export const AreasModel = mongoose.model<AreasDocument>(MODELNAME, schema);
