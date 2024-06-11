import { Document } from "mongoose";

export type EtablissementDocument = IEtablissement & Document;

export interface IEtablissement {
  schoolId: string;
  uai: string;
  name: string;
  referentEtablissementIds: string[];
  coordinateurIds: string[];
  department: string;
  region: string;
  zip: string;
  city: string;
  address?: string;
  country: string;
  type: string[];
  sector: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
