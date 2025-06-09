export interface EmailParams {
    from?: string;
    to: { email: string; name: string }[];
    subject?: string;
    attachments?: Attachment[];
}

export interface EmailWithMessage extends EmailParams {
    message: string;
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

export interface BasculeJeuneParams extends EmailParams {
    prenom: string;
    nom: string;
    ancienneSessionNom: string;
    nouvelleSessionNom?: string;
}

export interface EmailTestParams extends EmailParams {
    templateId: string;
}

export enum EmailTemplate {
    // GENERIQUE
    ENVOYER_MAIL_TEST = "test",
    // CLE
    VERIFIER_CLASSE_EMAIL_ADMIN_CLE = "2084",
    VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG = "2085",
    INVITER_REFERENT_CLASSE_TO_INSCRIPTION = "1391",
    INVITER_REFERENT_CLASSE_TO_CONFIRMATION = "1427",
    SUPPRIMER_REFERENT_CLASSE = "2349",
    SUPPRIMER_CLASSE_ENGAGEE = "2331",
    NOUVELLE_CLASSE_ENGAGEE = "2350",
    IMPORT_REFERENTIEL_GENERIQUE = "2324",
    // BASCULE
    BASCULE_SEJOUR_ELIGIBLE = "2407",
    BASCULE_SEJOUR_AVENIR = "2408",
    // DESISTEMENT
    DESISTEMENT_PAR_VOLONTAIRE = "1248",
    DESISTEMENT_PAR_TIERS = "2518",
}
