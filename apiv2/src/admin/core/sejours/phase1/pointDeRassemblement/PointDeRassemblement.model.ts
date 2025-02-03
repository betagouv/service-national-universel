// TODO: Mettre à niveau pour de l'ecriture
export type PointDeRassemblementModel = {
    id: string;
    code: string;
    matricule?: string;
    nom: string;
    adresse: string;
    ville: string;
    codePostal: string;
    particularitesAcces?: string;
    localisation?: { lat?: number; lon?: number };
    region: string;
    departement: string;
    academie: string;
    sessionIds: string[];
    sessionNoms: string[];
    complementAddress: any;
    uai?: string;
    numeroOrdre?: string;
};

export type CreatePointDeRassemblementModel = Omit<PointDeRassemblementModel, "id" | "complementAddress">;
