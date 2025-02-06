import exp from "constants";

export interface EmailParams {
    from?: string;
    to: { email: string; name: string }[];
    subject?: string;
    attachments?: Attachment[];
}

export interface Attachment {
    fileName: string;
    filePath: string;
}

export interface VerifierClasseEmailAdminCleParams extends EmailParams {
    classeNom?: string;
    classeCode: string;
    classeUrl: string;
}

export interface VerifierClasseEmailReferentDepRegParams extends EmailParams {
    classeNom?: string;
    classeCode: string;
    classeUrl: string;
}

export interface InviterReferentClasseParams extends EmailParams {
    classeNom?: string;
    classeCode: string;
    invitationUrl: string;
    etablissementNom: string;
    etablissementEmail: string;
}

export interface SupprimerReferentClasseParams extends EmailParams {}

export interface SupprimerClasseEngageeParams extends EmailParams {
    classeNom?: string;
    classeCode: string;
    compteUrl: string;
}

export interface NouvelleClasseEngageeParams extends SupprimerClasseEngageeParams {}

export interface jeuneBasculeCLEParams extends EmailParams {
    firstname: string;
    name: string;
    class_name: string;
    class_code: string;
    cta: string;
}

export interface jeuneBasculeParentNotifParams extends EmailParams {
    cohort: string;
    youngFirstName: string;
    youngName: string;
    cta: string;
}

export interface jeuneBasculeNotifToJeune extends EmailParams {
    motif: string;
    message: string;
    newcohortdate: string;
    oldprogram: string;
    newprogram: string;
    cta: string;
}

export enum EmailTemplate {
    // CLE
    VERIFIER_CLASSE_EMAIL_ADMIN_CLE = "2084",
    VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG = "2085",
    INVITER_REFERENT_CLASSE_TO_INSCRIPTION = "1391",
    INVITER_REFERENT_CLASSE_TO_CONFIRMATION = "1427",
    SUPPRIMER_REFERENT_CLASSE = "2349",
    SUPPRIMER_CLASSE_ENGAGEE = "2331",
    NOUVELLE_CLASSE_ENGAGEE = "2350",
    IMPORT_REFERENTIEL_GENERIQUE = "2324",

    // Referent
    JEUNE_CHANGE_SESSION_TO_CLE = "1462",
    JEUNE_CHANGE_SESSION_CLE_TO_HTS = "1463",

    // Jeune
    CHANGE_SESSION = "1461",

    // Parent
    PARENT_JEUNE_SESSION_CHANGE = "1307",
}
