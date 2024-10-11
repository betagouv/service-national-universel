import { Schema, InferSchemaType } from "mongoose";
import { InterfaceExtended } from "./";

export const FiltersSchema = {
  userId: {
    type: String,
  },
  url: {
    type: String,
    documentation: {
      description: "Url contenant tous les filtres preselectionnés",
    },
  },
  page: {
    type: String,
    documentation: {
      description: "Page sur laquelle se trouve le filtre",
    },
  },
  name: {
    type: String,
    documentation: {
      description: "Nom de la sauvegarde des filtres",
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(FiltersSchema);
export type FiltersType = InterfaceExtended<InferSchemaType<typeof schema>>;
