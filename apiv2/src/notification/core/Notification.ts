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
    VERIFIER_CLASSE_EMAIL_ADMIN_CLE = "VERIFIER_CLASSE_EMAIL_ADMIN_CLE",
    VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG = "VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG",
    INVITER_REFERENT_CLASSE_TO_INSCRIPTION = "INVITER_REFERENT_CLASSE_TO_INSCRIPTION",
    INVITER_REFERENT_CLASSE_TO_CONFIRMATION = "INVITER_REFERENT_CLASSE_TO_CONFIRMATION",
    SUPPRIMER_REFERENT_CLASSE = "SUPPRIMER_REFERENT_CLASSE",
    SUPPRIMER_CLASSE_ENGAGEE = "SUPPRIMER_CLASSE_ENGAGEE",
    NOUVELLE_CLASSE_ENGAGEE = "NOUVELLE_CLASSE_ENGAGEE",
}
