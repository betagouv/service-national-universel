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

export enum EmailTemplate {
    VERIFIER_CLASSE_EMAIL_ADMIN_CLE = "VERIFIER_CLASSE_EMAIL_ADMIN_CLE",
    VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG = "VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG",
    INVITER_REFERENT_CLASSE_TO_INSCRIPTION = "INVITER_REFERENT_CLASSE_TO_INSCRIPTION",
    INVITER_REFERENT_CLASSE_TO_CONFIRMATION = "INVITER_REFERENT_CLASSE_TO_CONFIRMATION",
}
