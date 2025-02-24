// TODO: Mettre à niveau pour de l'ecriture
export type PlanDeTransportModel = {
    id: string;
    sessionNom: string;
    sessionId?: string;
    numeroLigne: string;
    dateDepart: string;
    dateRetour: string;
    capaciteJeunes: number;
    placesOccupeesJeunes: number;
    tauxRemplissageLigne?: number;
    capaciteTotal: number;
    capaciteAccompagnateurs: number;
    dureeTrajet: string;
    lunchBreak?: boolean;
    lunchBreakReturn?: boolean;
    centreId: string;
    centreRegion: string;
    centreDepartement: string;
    centreAdresse?: string;
    centreCodePostal?: string;
    centreNom: string;
    centreCode?: string;
    heureArriveeCentre: string;
    heureDepartCentre: string;
    classeId?: string;
    tempsRetardDepart: string;
    tempsRetardRetour: string;
    ligneFusionneeIds: string[];
    ligneMirroirId?: string;
};

export type CreatePlanDeTransportModel = Omit<PlanDeTransportModel, "id" | "tempsRetardDepart" | "tempsRetardRetour">;
