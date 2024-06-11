export type IAppelAProjetType = {
  etablissement: IAppelAProjetEtablissement;
  classe: IAppelAprojetClasse;
};

export type IAppelAProjetEtablissement = {
  uai?: string;
  email: string;
  name?: string;
  department?: string;
  region?: string;
  zip?: string;
  city?: string;
  type?: string;
  sector?: string;
};

export type IAppelAprojetClasse = {
  colorationExpected: string;
  numberOfStudentsExpected: number;
  type: string;
  quarterExpected: string;
  dateConstraint: string;
  level: string;
  status: string;
  referent: IAppelAProjetReferent;
};

export type IAppelAProjetReferent = {
  firstName: string;
  lastName: string;
  email: string;
};
