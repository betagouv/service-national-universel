import { Document } from "mongoose";
import { IReferent } from "../referentType";

export type ClasseDocument = IClasse & Document;

export type ClasseWithReferentsType = IClasse & {
  referents: IReferent[];
};

export interface IClasse {
  _id?: string;
  etablissementId: string;
  referentClasseIds: string[];
  cohort?: string;
  uniqueKey: string;
  uniqueId?: string;
  uniqueKeyAndId: string;
  name?: string;
  coloration?: string;
  estimatedSeats: number;
  totalSeats: number;
  seatsTaken?: number;
  filiere?: string;
  grade?: string;
  cohesionCenterId?: string;
  sessionId?: string;
  ligneId?: string;
  pointDeRassemblementId?: string;
  status: string;
  statusPhase1: string;
  department: string;
  region: string;
  academy: string;
  schoolYear: string;
  trimester?: string;
  comments?: string;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
