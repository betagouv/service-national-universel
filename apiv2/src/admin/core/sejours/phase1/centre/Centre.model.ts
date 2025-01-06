// TODO: Mettre à niveau pour de l'ecriture
export type CentreModel = {
    id: string;
    nom?: string;
    matricule?: string;
    departement?: string;
    region?: string;
    ville?: string;
    codePostal?: string;
    centreId?: string;
    sessionNames: string[];
    sessionIds: string[];
    listeAttente: string[];
    statutSejour: string[];
};
