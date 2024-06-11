import { Document } from "mongoose";
import { IReferent } from "@/models/referentType";

export type ClasseDocument = IClasse & Document;

export type ClasseWithReferentsType = IClasse & {
  referents: IReferent[];
};

export interface IClasse {
  _id: string;
  etablissementId: string;
  referentClasseIds: string[];
  cohort: string;
  uniqueKey: string;
  uniqueId?: string;
  uniqueKeyAndId: string;
  name?: string;
  coloration?: string;
  totalSeats?: number;
  seatsTaken: number;
  filiere?: string;
  grade?: string;
  cohesionCenterId?: string;
  sessionId?: string;
  ligneId?: string;
  pointDeRassemblementId?: string;
  status: string;
  statusPhase1: string;
  department?: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
