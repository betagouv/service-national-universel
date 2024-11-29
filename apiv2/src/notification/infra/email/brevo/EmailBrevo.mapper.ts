import {
    EmailParams,
    EmailTemplate,
    InviterReferentClasseParams,
    SupprimerClasseEngageeParams,
    VerifierClasseEmailAdminCleParams,
    VerifierClasseEmailReferentDepRegParams,
} from "@notification/core/Notification";
import { EmailProviderParams } from "./EmailBrevo.provider";

export class EmailBrevoMapper {
    static mapEmailParamsToBrevoByTemplate(template: EmailTemplate, emailParams: EmailParams): EmailProviderParams {
        switch (template) {
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE: {
                return this.mapVerifierClasseAdminCleToBrevo(emailParams as VerifierClasseEmailAdminCleParams);
            }
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG: {
                return this.mapVerifierClasseReferentDepRegToBrevo(emailParams as VerifierClasseEmailAdminCleParams);
            }
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_INSCRIPTION:
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_CONFIRMATION: {
                return this.mapInviterReferentClasse(template, emailParams as InviterReferentClasseParams);
            }
            case EmailTemplate.SUPPRIMER_REFERENT_CLASSE:
                return this.mapGenericEmailToBrevo(template, emailParams);
            case EmailTemplate.SUPPRIMER_CLASSE_ENGAGEE:
            case EmailTemplate.NOUVELLE_CLASSE_ENGAGEE:
                return this.mapSupprimerClasseEngagee(template, emailParams as SupprimerClasseEngageeParams);
        }
    }

    static mapGenericEmailToBrevo(template: EmailTemplate, emailParams: EmailParams): EmailProviderParams {
        return {
            to: emailParams.to,
            templateId: this.mapTemplateTypeToBrevoId(template),
        };
    }

    //
    static mapVerifierClasseAdminCleToBrevo(
        verifierClasseParams: VerifierClasseEmailAdminCleParams,
    ): EmailProviderVerifierClasseAdminCle {
        return {
            to: verifierClasseParams.to,
            params: {
                class_code: verifierClasseParams.classeCode,
                class_name: verifierClasseParams.classeNom,
                classUrl: verifierClasseParams.classeUrl,
            },
            templateId: this.mapTemplateTypeToBrevoId(EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE),
        };
    }

    static mapVerifierClasseReferentDepRegToBrevo(
        verifierClasseParams: VerifierClasseEmailReferentDepRegParams,
    ): EmailProviderVerifierClasseReferentDepReg {
        return {
            to: verifierClasseParams.to,
            params: {
                class_code: verifierClasseParams.classeCode,
                class_name: verifierClasseParams.classeNom,
                cta: verifierClasseParams.classeUrl,
            },
            templateId: this.mapTemplateTypeToBrevoId(EmailTemplate.VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG),
        };
    }

    static mapInviterReferentClasse(
        template: EmailTemplate,
        inviterReferent: InviterReferentClasseParams,
    ): EmailProviderInviterReferentClasse {
        return {
            to: inviterReferent.to,
            params: {
                class_code: inviterReferent.classeCode,
                class_name: inviterReferent.classeNom,
                cta: inviterReferent.invitationUrl,
                name_school: inviterReferent.etablissementNom,
                emailEtablissement: inviterReferent.etablissementEmail,
            },
            templateId: this.mapTemplateTypeToBrevoId(template),
        };
    }

    static mapSupprimerClasseEngagee(
        template: EmailTemplate,
        supprimerClasseEngagee: SupprimerClasseEngageeParams,
    ): EmailProviderSupprimerClasseEngagee {
        return {
            to: supprimerClasseEngagee.to,
            params: {
                class_name: supprimerClasseEngagee.classeNom,
                class_code: supprimerClasseEngagee.classeCode,
                cta: supprimerClasseEngagee.compteUrl,
            },
            templateId: this.mapTemplateTypeToBrevoId(template),
        };
    }

    // TODO : Mettre en base le mapping
    static mapTemplateTypeToBrevoId(templateType: EmailTemplate): number {
        switch (templateType) {
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_ADMIN_CLE:
                return 2084;
            case EmailTemplate.VERIFIER_CLASSE_EMAIL_REFERENT_DEP_REG:
                return 2085;
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_INSCRIPTION:
                return 1391;
            case EmailTemplate.INVITER_REFERENT_CLASSE_TO_CONFIRMATION:
                return 1427;
            case EmailTemplate.SUPPRIMER_REFERENT_CLASSE:
                return 2349;
            case EmailTemplate.SUPPRIMER_CLASSE_ENGAGEE:
                return 2331;
            case EmailTemplate.NOUVELLE_CLASSE_ENGAGEE:
                return 2350;
        }
    }
}

export interface EmailProviderVerifierClasseAdminCle extends EmailProviderParams {
    params: {
        class_name?: string;
        class_code: string;
        classUrl: string;
    };
}

export interface EmailProviderVerifierClasseReferentDepReg extends EmailProviderParams {
    params: {
        class_name?: string;
        class_code: string;
        cta: string;
    };
}

export interface EmailProviderInviterReferentClasse extends EmailProviderParams {
    params: {
        class_name?: string;
        class_code: string;
        cta: string;
        name_school: string;
        emailEtablissement: string;
    };
}

export interface EmailProviderSupprimerClasseEngagee extends EmailProviderParams {
    params: {
        class_name?: string;
        class_code: string;
        cta: string;
    };
}
