import { IReferent } from "../../models/referentType";
import { IClasse } from "../../models/cle/classeType";
import { IEtablissement } from "../../models/cle/etablissementType";

export type IAppelAProjet = {
  etablissement: Pick<IEtablissement, "uai"> & { nameAndCommune?: string };
  referentEtablissement: Pick<IReferent, "email" | "firstName" | "lastName">;
  classe: Pick<IClasse, "name" | "coloration" | "trimester" | "estimatedSeats" | "type">;
  referentClasse: Pick<IReferent, "firstName" | "lastName" | "email">;
};
