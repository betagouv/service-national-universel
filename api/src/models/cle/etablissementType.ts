import { Document } from "mongoose";

export type EtablissementDocument = IEtablissement & Document;

export interface IEtablissement {
  _id?: string;
  schoolId?: string;
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
  academy: string;
  state: string;
  schoolYears: string[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
