import { InferSchemaType, Schema } from "mongoose";
import { InterfaceExtended } from ".";
import { CampagneJeuneType, DestinataireListeDiffusion } from "../domains/planMarketing/constants";

export const CampagneSchema = {
  campagneGeneriqueId: {
    type: String,
  },
  nom: {
    type: String,
    required: true,
  },
  objet: {
    type: String,
    required: true,
  },
  contexte: {
    type: String,
  },
  templateId: {
    type: Number,
    required: true,
  },
  listeDiffusionId: {
    type: String,
    required: true,
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
    required: true,
    default: [],
  },
  type: {
    type: String,
    enum: Object.values(CampagneJeuneType),
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(CampagneSchema);
export type CampagneType = InterfaceExtended<InferSchemaType<typeof schema>>;
