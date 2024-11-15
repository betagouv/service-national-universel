export type CentreModel = {
    id: string;
    nom?: string;
    departement?: string;
    region?: string;
    ville?: string;
    codePostal?: string;
    centreId?: string;
    sessionNames: string[];
    sessionIds: string[];
    listeAttente: string[];
    statusSejour: string[];
};
