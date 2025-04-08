import { InferSchemaType, Schema } from "mongoose";
import { InterfaceExtended } from ".";
import { CampagneJeuneType, DestinataireListeDiffusion, EnvoiCampagneStatut } from "../domains/planMarketing/constants";

export const CampagneSchema = {
  campagneGeneriqueId: {
    type: String,
  },
  originalCampagneGeneriqueId: {
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
  },
  type: {
    type: String,
    enum: Object.values(CampagneJeuneType),
  },
  cohortId: {
    type: String,
  },
  envois: {
    type: [
      {
        date: { type: Date, required: true },
        statut: { type: String, enum: EnvoiCampagneStatut, required: true },
        _id: false,
      },
    ],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

const schema = new Schema(CampagneSchema);
export type CampagneType = InterfaceExtended<InferSchemaType<typeof schema>>;
