export interface EmailParams {
    from?: string;
    to: { email: string; name: string }[];
    subject?: string;
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

export enum EmailTemplate {
    // CLE
    VERIFIER_CLASSE_EMAIL_ADMIN_CLE = "2084",
    VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG = "2085",
    INVITER_REFERENT_CLASSE_TO_INSCRIPTION = "1391",
    INVITER_REFERENT_CLASSE_TO_CONFIRMATION = "1427",
    SUPPRIMER_REFERENT_CLASSE = "2349",
    SUPPRIMER_CLASSE_ENGAGEE = "2331",
    NOUVELLE_CLASSE_ENGAGEE = "2350",
}
