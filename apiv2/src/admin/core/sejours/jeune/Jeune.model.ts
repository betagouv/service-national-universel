import { YOUNG_SOURCE } from "snu-lib";

// TODO: Mettre à niveau pour de l'ecriture
export type JeuneModel = {
    id: string;
    statut: string;
    statutPhase1: string;
    email: string;
    telephone?: string;
    dateNaissance?: Date;
    centreId?: string;
    handicapMemeDepartement?: string;
    genre?: string;
    qpv?: string;
    psh?: string;
    departement?: string;
    region?: string;
    codePostal?: string;
    departementScolarite?: string;
    regionScolarite?: string;
    paysScolarite?: string;
    localisation?: {
        lat?: number;
        lon?: number;
    };
    pointDeRassemblementId?: string;
    ligneDeBusId?: string;
    sejourId?: string;
    hasPDR?: string;
    sessionId?: string;
    sessionNom?: string;
    originalSessionId?: string;
    originalSessionNom?: string;
    prenom?: string;
    nom?: string;
    deplacementPhase1Autonomous?: string;
    presenceArrivee?: string;
    presenceJDM?: string;
    departInform?: string;
    departSejourAt?: string;
    departSejourMotif?: string;
    departSejourMotifComment?: string;
    transportInfoGivenByLocal?: string;
    desistementMotif?: string;
    desistementMessage?: string;
    source?: keyof typeof YOUNG_SOURCE;
    consentement?: string;
    imageRight?: string;
    acceptCGU?: string;
    parentAllowSNU?: string;
    // Parent 1 Information
    parent1Prenom?: string;
    parent1Nom?: string;
    parent1Email?: string;
    parent1Telephone?: string;
    parent1AllowSNU?: string;
    parent1AllowImageRights?: string;
    // Parent 2 Information
    parent2Prenom?: string;
    parent2Nom?: string;
    parent2Email?: string;
    parent2Telephone?: string;
    youngPhase1Agreement: string;
    sessionChangeReason?: string;
    classeId?: string;
    etablissementId?: string;
    niveauScolaire?: string;
    scolarise?: string;
    lastStatusAt?: Date;
};

export type CreateJeuneModel = Omit<JeuneModel, "id" | "createdAt" | "updatedAt">;

export type JeuneWithMinimalDataModel = Pick<JeuneModel, "prenom" | "nom" | "dateNaissance" | "genre"> & {
    prenom: string;
    nom: string;
    dateNaissance: Date;
    genre: string;
};
