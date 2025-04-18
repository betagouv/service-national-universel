// TODO: Mettre à niveau pour de l'ecriture
export type LigneDeBusModel = {
    id: string;
    numeroLigne: string;
    codeCourtDeRoute?: string;
    capaciteJeunes: number;
    capaciteTotal: number;
    capaciteAccompagnateurs: any;
    placesOccupeesJeunes: number;
    placesRestantes?: number;
    sessionNom?: string;
    sessionId?: string;
    centreId: string;
    sejourId: string;
    pointDeRassemblementIds: string[];
    dureeTrajet: any;
    heureArriveeCentre: any;
    heureDepartCentre: any;
    tempsRetardDepart: any;
    tempsRetardRetour: any;
    dateDepart: any;
    dateRetour: any;
    ligneFusionneeNumerosLignes: string[];
    ligneMiroirNumeroLigne?: string;
};

export type CreateLigneDeBusModel = Omit<
    LigneDeBusModel,
    "id" | "tempsRetardDepart" | "tempsRetardRetour" | "ligneFusionneeNumerosLignes"
>;
