import { ClasseType, EtablissementType } from "snu-lib";
import { ReferentType } from "../../models";

export type IAppelAProjet = {
  numberDS: number;
  etablissement: Pick<EtablissementType, "uai"> & { nameAndCommune?: string };
  referentEtablissement: Pick<ReferentType, "email" | "firstName" | "lastName">;
  classe: Pick<ClasseType, "name" | "coloration" | "trimester" | "estimatedSeats" | "type">;
  referentClasse?: Pick<ReferentType, "firstName" | "lastName" | "email">;
};

export type IAppelAProjetOptions = {
  fixes?: Array<Partial<IAppelAProjet> & { useExistingEtablissement?: boolean }>;
  filters?: number[];
};
