import { CLE_TYPE_LIST } from "snu-lib";

export type EtablissementModel = {
    id: string;
    adresse?: string;
    codePostal: string;
    commune: string;
    pays: string;
    departement: string;
    academie: string;
    region: string;
    nom: string;
    type: typeof CLE_TYPE_LIST | string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    uai: string;
    anneesScolaires: string[];
    etat: string;
    secteur: string[];
    coordinateurIds: string[];
    referentEtablissementIds: string[];
    //used by usecase ?
    schoolId?: string;
};

export type CreateEtablissementModel = Omit<EtablissementModel, "id" | "createdAt" | "updatedAt">;
