// TODO: Mettre à niveau pour de l'ecriture
export type LigneDeBusModel = {
    id: string;
    numeroLigne: string;
    capaciteJeunes: number;
    capaciteTotal: number;
    capaciteAccompagnateurs: any;
    placesOccupeesJeunes: number;
    placesRestantes?: number;
    sessionNom?: string;
    sessionId?: string;
    centreId: string;
    sejourId?: string;
    pointDeRassemblementIds: string[];
    dureeTrajet: any;
    heureArriveeCentre: any;
    heureDepartCentre: any;
    tempsRetardDepart: any;
    tempsRetardRetour: any;
    dateDepart: any;
    dateRetour: any;
    ligneFusionneIds: any;
};
