import { IReferent } from "../../models/referentType";
import { IClasse } from "../../models/cle/classeType";
import { IEtablissement } from "../../models/cle/etablissementType";

export type IAppelAProjet = {
  etablissement: Pick<IEtablissement, "uai">;
  referentEtablissement: Pick<IReferent, "email">;
  classe: Pick<IClasse, "name" | "coloration" | "trimester" | "estimatedSeats">;
  referentClasse: Pick<IReferent, "firstName" | "lastName" | "email">;
};

// export type IAppelAProjetEtablissement = {
//   uai?: string | null;
//   email?: string;
//   nom?: string;
//   departement?: string;
//   region?: string;
//   codePostal?: string;
//   commune?: string;
//   type?: string;
//   secteur?: string;
// };
//
// export type IAppelAprojetClasse = {
//   nom?: string;
//   coloration?: string;
//   nombreElevesPrevus?: string;
//   type?: string;
//   trimestre?: string;
//   contraintesDates?: string;
//   niveau?: string;
//   statut?: string;
//   referent: IAppelAProjetReferent;
// };
//
// export type IAppelAProjetReferent = {
//   prenom?: string;
//   nom?: string;
//   email?: string;
// };
