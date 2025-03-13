import { InferSchemaType, Schema } from "mongoose";
import { InterfaceExtended } from ".";
import { CampagneJeuneType, DestinataireListeDiffusion } from "../domains/planMarketing/constants";

export const CampagneSchema = {
  campagneGeneriqueId: {
    type: String,
  },
  nom: {
    type: String,
  },
  objet: {
    type: String,
  },
  contexte: {
    type: String,
  },
  templateId: {
    type: Number,
  },
  listeDiffusionId: {
    type: String,
  },
  generic: {
    type: Boolean,
    required: true,
  },
  destinataires: {
    type: [
      {
        type: String,
        enum: Object.values(DestinataireListeDiffusion),
      },
    ],
    default: [],
  },
  type: {
    type: String,
    enum: Object.values(CampagneJeuneType),
  },
  cohortId: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(CampagneSchema);
export type CampagneType = InterfaceExtended<InferSchemaType<typeof schema>>;
