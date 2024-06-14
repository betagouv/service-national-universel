export type IAppelAProjetType = {
  etablissement: IAppelAProjetEtablissement;
  classe: IAppelAprojetClasse;
};

export type IAppelAProjetEtablissement = {
  uai?: string;
  email: string;
  nom?: string;
  departement?: string;
  region?: string;
  codePostal?: string;
  commune?: string;
  type?: string;
  secteur?: string;
};

export type IAppelAprojetClasse = {
  coloration: string;
  nombreElevesPrevus: number;
  type: string;
  trimestre: string;
  contraintesDates: string;
  niveau: string;
  statut: string;
  referent: IAppelAProjetReferent;
};

export type IAppelAProjetReferent = {
  prenom: string;
  nom: string;
  email: string;
};
