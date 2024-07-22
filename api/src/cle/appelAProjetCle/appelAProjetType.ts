import { IReferent } from "../../models/referentType";
import { IEtablissement, IClasse } from "../../models";

export type IAppelAProjet = {
  numberDS: number;
  etablissement: Pick<IEtablissement, "uai"> & { nameAndCommune?: string };
  referentEtablissement: Pick<IReferent, "email" | "firstName" | "lastName">;
  classe: Pick<IClasse, "name" | "coloration" | "trimester" | "estimatedSeats" | "type">;
  referentClasse: Pick<IReferent, "firstName" | "lastName" | "email">;
};

export type IAppelAProjetOptions = {
  fixes?: Array<Partial<IAppelAProjet> & { useExistingEtablissement?: boolean }>;
  filters?: number[];
};
