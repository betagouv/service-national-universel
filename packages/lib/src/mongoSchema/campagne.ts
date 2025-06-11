import mongoose from "mongoose";
import { InterfaceExtended } from ".";
import { CampagneJeuneType, DestinataireListeDiffusion, EnvoiCampagneStatut, TypeEvenement } from "../domains/planMarketing/constants";

const programmation = {
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId() },
  joursDecalage: { type: Number },
  type: { type: String, enum: TypeEvenement, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  envoiDate: { type: Date },
  sentAt: { type: Date },
};

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
  programmations: {
    type: [programmation],
    required: false,
  },
  isProgrammationActive: {
    type: Boolean,
  },
  isArchived: {
    type: Boolean,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

export interface CampagneProgrammationType {
  _id: mongoose.Types.ObjectId;
  joursDecalage?: number;
  type: TypeEvenement;
  createdAt: Date;
  envoiDate?: Date;
  sentAt?: Date;
}

export interface CampagneType
  extends InterfaceExtended<{
    campagneGeneriqueId?: string;
    originalCampagneGeneriqueId?: string;
    nom?: string;
    objet?: string;
    contexte?: string;
    templateId?: number;
    listeDiffusionId?: string;
    generic: boolean;
    destinataires?: DestinataireListeDiffusion[];
    type?: CampagneJeuneType;
    cohortId?: string;
    envois?: Array<{
      date: Date;
      statut: EnvoiCampagneStatut;
    }>;
    programmations?: CampagneProgrammationType[];
    isProgrammationActive?: boolean;
    isArchived?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }> {}
